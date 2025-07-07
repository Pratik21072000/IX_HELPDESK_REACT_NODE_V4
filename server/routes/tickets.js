const express = require("express");
const { sequelize } = require("../config/database");
const { User, Ticket } = require("../models");
const { authenticateToken, isManager } = require("../middleware/auth");
const { upload, deleteFile, getSignedUrl } = require("../services/s3Service");
const {
  sendTicketCreatedNotification,
  sendTicketUpdatedNotification,
} = require("../services/emailService");

const router = express.Router();

// File upload endpoint
router.post(
  "/upload",
  authenticateToken,
  upload.array("files", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedFiles = req.files.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.originalname,
        size: file.size,
        key: file.key,
        location: file.location,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString(),
        uploadedBy: req.user.id,
      }));

      res.json({ files: uploadedFiles });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "File upload failed" });
    }
  },
);

// Get file download URL
router.get("/file/:key", authenticateToken, async (req, res) => {
  try {
    const fileKey = req.params.key;
    const signedUrl = getSignedUrl(fileKey, 3600); // 1 hour expiry

    if (!signedUrl) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({ downloadUrl: signedUrl });
  } catch (error) {
    console.error("Get file URL error:", error);
    res.status(500).json({ error: "Failed to generate download URL" });
  }
});

// Get tickets with filtering and pagination
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const {
      department,
      priority,
      status,
      search,
      myTickets,
      page = 1,
      limit = 10,
    } = req.query;

    // Convert page and limit to integers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = {};

    // Apply role-based filtering
    if (myTickets === "true") {
      // For "My Tickets" - show only tickets created by the user
      whereClause.createdBy = user.id;
    } else if (!user.isManager) {
      // Employees always see only their own tickets
      whereClause.createdBy = user.id;
    } else if (user.isManager && user.managedDepartments) {
      // Managers see tickets from departments they manage
      const managedDepts = JSON.parse(user.managedDepartments);
      whereClause.department = managedDepts; // Sequelize will handle array for IN clause
    }

    // Apply additional filters
    if (department) {
      whereClause.department = department;
    }
    if (priority) {
      whereClause.priority = priority;
    }
    if (status) {
      whereClause.status = status;
    }

    let tickets;
    let totalCount;

    // Search functionality - using raw SQL for LIKE operation
    if (search) {
      // First get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM tickets t
        JOIN users u ON t.createdBy = u.id
        WHERE (t.subject LIKE :search OR t.description LIKE :search)
        ${whereClause.createdBy ? "AND t.createdBy = :createdBy" : ""}
        ${whereClause.department ? "AND t.department = :department" : ""}
        ${priority ? "AND t.priority = :priority" : ""}
        ${status ? "AND t.status = :status" : ""}
      `;

      const countResult = await sequelize.query(countQuery, {
        replacements: {
          search: `%${search}%`,
          createdBy: whereClause.createdBy,
          department: whereClause.department,
          priority,
          status,
        },
        type: sequelize.QueryTypes.SELECT,
      });

      totalCount = countResult[0].total;

      // Then get paginated results
      const searchQuery = `
        SELECT t.*, u.id as user_id, u.name as user_name, u.username as user_username,
               u.role as user_role, u.department as user_department
        FROM tickets t
        JOIN users u ON t.createdBy = u.id
        WHERE (t.subject LIKE :search OR t.description LIKE :search)
        ${whereClause.createdBy ? "AND t.createdBy = :createdBy" : ""}
        ${whereClause.department ? "AND t.department = :department" : ""}
        ${priority ? "AND t.priority = :priority" : ""}
        ${status ? "AND t.status = :status" : ""}
        ORDER BY t.createdAt DESC
        LIMIT :limit OFFSET :offset
      `;

      const results = await sequelize.query(searchQuery, {
        replacements: {
          search: `%${search}%`,
          createdBy: whereClause.createdBy,
          department: whereClause.department,
          priority,
          status,
          limit: limitNum,
          offset: offset,
        },
        type: sequelize.QueryTypes.SELECT,
      });

      tickets = results.map((row) => ({
        id: row.id,
        subject: row.subject,
        description: row.description,
        department: row.department,
        priority: row.priority,
        status: row.status,
        category: row.category,
        subcategory: row.subcategory,
        comment: row.comment,
        createdBy: row.createdBy,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        user: {
          id: row.user_id,
          name: row.user_name,
          username: row.user_username,
          role: row.user_role,
          department: row.user_department,
        },
      }));
    } else {
      // Get total count
      totalCount = await Ticket.count({ where: whereClause });

      // Get paginated tickets
      tickets = await Ticket.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "username", "role", "department"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: limitNum,
        offset: offset,
      });
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      tickets,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Get tickets error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create ticket
router.post("/", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    if (
      !data.subject ||
      !data.description ||
      !data.department ||
      !data.priority
    ) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // Clean and sanitize subject
    const cleanSubject = data.subject
      .trim()
      .replace(/[^\w\s\-.,!?()&@#$%]/g, "")
      .replace(/\b[a-z]{8,}\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    const baseSubject =
      data.category && data.subcategory
        ? `[${data.category} - ${data.subcategory}] ${cleanSubject}`
        : cleanSubject;

    const ticket = await Ticket.create({
      subject: baseSubject,
      description: data.description.trim(),
      department: data.department,
      priority: data.priority,
      category: data.category,
      subcategory: data.subcategory,
      files: data.files || [],
      createdBy: user.id,
    });

    // Fetch the ticket with user data
    const ticketWithUser = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "username", "role", "department"],
        },
      ],
    });

    // Send email notification
    try {
      await sendTicketCreatedNotification(ticketWithUser, user);
    } catch (emailError) {
      console.error("Failed to send ticket created notification:", emailError);
      // Don't fail the ticket creation if email fails
    }

    res.status(201).json({ ticket: ticketWithUser });
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update ticket
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const ticketId = req.params.id;
    const updates = req.body;

    const ticket = await Ticket.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Check permissions
    let canEdit = ticket.createdBy === user.id; // Creator can edit

    // Check if user is a manager of this ticket's department
    if (user.isManager && user.managedDepartments) {
      const managedDepts = JSON.parse(user.managedDepartments);
      canEdit = canEdit || managedDepts.includes(ticket.department);
    }

    if (!canEdit) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // Store original ticket for email comparison
    const originalTicket = ticket.toJSON();

    // Handle file operations
    if (updates.filesToDelete || updates.newFiles) {
      let currentFiles = ticket.files || [];

      // Delete files from S3 if they're being removed
      if (updates.filesToDelete && updates.filesToDelete.length > 0) {
        for (const fileId of updates.filesToDelete) {
          const fileToDelete = currentFiles.find((f) => f.id === fileId);
          if (fileToDelete && fileToDelete.key) {
            try {
              await deleteFile(fileToDelete.key);
            } catch (deleteError) {
              console.error("Error deleting file from S3:", deleteError);
            }
          }
        }
        currentFiles = currentFiles.filter(
          (file) => !updates.filesToDelete.includes(file.id),
        );
      }

      // Add new files
      if (updates.newFiles && updates.newFiles.length > 0) {
        currentFiles = [...currentFiles, ...updates.newFiles];
      }

      updates.files = currentFiles;

      // Clean up the update object
      delete updates.filesToDelete;
      delete updates.newFiles;
      delete updates.hasNewFiles;
    }

    await ticket.update(updates);

    // Fetch updated ticket with user data
    const updatedTicket = await Ticket.findByPk(ticketId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "username", "role", "department"],
        },
      ],
    });

    // Send email notification if there were significant changes
    try {
      const significantFields = [
        "status",
        "priority",
        "department",
        "subject",
        "description",
      ];
      const hasSignificantChanges = significantFields.some(
        (field) => originalTicket[field] !== updatedTicket[field],
      );

      if (hasSignificantChanges) {
        await sendTicketUpdatedNotification(
          updatedTicket,
          user,
          originalTicket,
        );
      }
    } catch (emailError) {
      console.error("Failed to send ticket updated notification:", emailError);
      // Don't fail the ticket update if email fails
    }

    res.json({ ticket: updatedTicket });
  } catch (error) {
    console.error("Update ticket error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single ticket
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const ticketId = req.params.id;

    const ticket = await Ticket.findByPk(ticketId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "username", "role", "department"],
        },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Check permissions
    let canView = ticket.createdBy === user.id; // Creator can view

    // Check if user is a manager of this ticket's department
    if (user.isManager && user.managedDepartments) {
      const managedDepts = JSON.parse(user.managedDepartments);
      canView = canView || managedDepts.includes(ticket.department);
    }

    if (!canView) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    res.json({ ticket });
  } catch (error) {
    console.error("Get ticket error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
