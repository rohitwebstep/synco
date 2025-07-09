const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middleware/admin/authenticate");
const {
    createMember,
    getAllMembers,
    updateMember,
    changeMemberStatus,
    deleteMember,
    getMemberProfile
} = require("../../../controllers/admin/memberController");

const multer = require("multer");
const upload = multer();

router.use("/role", require("./roleRoutes")); // Sub-routes

// Base: /api/admin/member
router.post("/", upload.single("profile"), authMiddleware, createMember);
router.get("/", getAllMembers);
router.get("/:id", authMiddleware, getMemberProfile);
router.put("/:id", upload.single("profile"), authMiddleware, updateMember);
router.patch("/:id/status", authMiddleware, changeMemberStatus);
router.delete("/:id", authMiddleware, deleteMember);

// Mount sub-routes here

module.exports = router;
