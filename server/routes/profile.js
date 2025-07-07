const express = require("express");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get user profile
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userWithoutPassword = {
      id: req.user.id,
      username: req.user.username,
      name: req.user.name,
      role: req.user.role,
      department: req.user.department,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    };

    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user profile
router.put("/", authenticateToken, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = req.user;

    const updates = {};

    if (name && name.trim()) {
      updates.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          error: "Current password is required to change password",
        });
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: "Current password is incorrect",
        });
      }

      updates.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "No valid updates provided",
      });
    }

    await user.update(updates);

    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      user: userWithoutPassword,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
