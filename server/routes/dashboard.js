const express = require("express");
const { sequelize } = require("../config/database");
const { Ticket } = require("../models");
const { authenticateToken, isManager } = require("../middleware/auth");

const router = express.Router();

// Get dashboard stats using raw SQL for aggregation
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { myTickets } = req.query;

    let whereCondition = "";
    let replacements = {};

    // Apply role-based filtering
    if (myTickets === "true") {
      whereCondition = "WHERE createdBy = :userId";
      replacements.userId = user.id;
    } else if (!user.isManager) {
      whereCondition = "WHERE createdBy = :userId";
      replacements.userId = user.id;
    } else if (user.isManager && user.managedDepartments) {
      const managedDepts = JSON.parse(user.managedDepartments);
      whereCondition = `WHERE department IN (${managedDepts.map((_, i) => `:dept${i}`).join(",")})`;
      managedDepts.forEach((dept, i) => {
        replacements[`dept${i}`] = dept;
      });
    }

    // Get total and status counts
    const statsQuery = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status = 'ON_HOLD' THEN 1 ELSE 0 END) as onHold,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) as closed
      FROM tickets
      ${whereCondition}
    `;

    // Get department counts
    const departmentQuery = `
      SELECT
        SUM(CASE WHEN department = 'ADMIN' THEN 1 ELSE 0 END) as admin,
        SUM(CASE WHEN department = 'FINANCE' THEN 1 ELSE 0 END) as finance,
        SUM(CASE WHEN department = 'HR' THEN 1 ELSE 0 END) as hr
      FROM tickets
      ${whereCondition}
    `;

    // Get priority counts
    const priorityQuery = `
      SELECT
        SUM(CASE WHEN priority = 'LOW' THEN 1 ELSE 0 END) as low,
        SUM(CASE WHEN priority = 'MEDIUM' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN priority = 'HIGH' THEN 1 ELSE 0 END) as high
      FROM tickets
      ${whereCondition}
    `;

    const [statsResult] = await sequelize.query(statsQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const [departmentResult] = await sequelize.query(departmentQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const [priorityResult] = await sequelize.query(priorityQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const stats = {
      total: parseInt(statsResult.total) || 0,
      open: parseInt(statsResult.open) || 0,
      inProgress: parseInt(statsResult.inProgress) || 0,
      onHold: parseInt(statsResult.onHold) || 0,
      cancelled: parseInt(statsResult.cancelled) || 0,
      closed: parseInt(statsResult.closed) || 0,
      byDepartment: {
        admin: parseInt(departmentResult.admin) || 0,
        finance: parseInt(departmentResult.finance) || 0,
        hr: parseInt(departmentResult.hr) || 0,
      },
      byPriority: {
        low: parseInt(priorityResult.low) || 0,
        medium: parseInt(priorityResult.medium) || 0,
        high: parseInt(priorityResult.high) || 0,
      },
    };

    res.json({ stats });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
