const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../../middleware/authenticate");
const {
    createMember,
    listMembers,
    updateMember,
    deleteMember,
    getMemberProfile,
} = require("../../controllers/admin/memberController");

const upload = multer();

// Create a new member
router.post("/", upload.single("profile"), authMiddleware, createMember);

// List all members
router.get("/", authMiddleware, listMembers);

// Get a specific member's profile by ID
router.get("/:id", authMiddleware, getMemberProfile);

// Update a member by ID
router.put("/:id", authMiddleware, updateMember);

// Delete a member by ID
router.delete("/:id", authMiddleware, deleteMember);

module.exports = router;
