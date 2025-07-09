const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../../../middleware/admin/authenticate");

const {
  createMemberRole,
  getAllMemberRoles,
  getMemberRoleById,
  updateMemberRole,
  deleteMemberRole
} = require("../../../controllers/admin/member/memberRoleController");

// Base: /api/admin/member/role
router.post("/", authMiddleware, createMemberRole);
router.get("/", authMiddleware, getAllMemberRoles);
router.get("/:id", authMiddleware, getMemberRoleById);
router.put("/:id", authMiddleware, updateMemberRole);
router.delete("/:id", authMiddleware, deleteMemberRole);

module.exports = router;
