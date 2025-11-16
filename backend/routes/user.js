const express = require("express");
const router = express.Router();
const User = require("../models/user");

// GET ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // hide password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE USER (role, isActive, etc.)
router.put("/:id", async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const userId = req.params.id;

    // Validate role if provided
    if (role && !["customer", "admin"].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid role. Must be 'customer' or 'admin'" 
      });
    }

    // Prepare update object
    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user
    });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

module.exports = router;