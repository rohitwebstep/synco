const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../../../middleware/authenticate");

const {
  createRole,
  listRoles,
  getRoleById,
  updateRole,
  deleteRole
} = require("../../../controllers/admin/memberRoleController");

// Base: /api/admin/member/role
router.post("/", authMiddleware, createRole);
router.get("/", authMiddleware, listRoles);
router.get("/:id", authMiddleware, getRoleById);
router.put("/:id", authMiddleware, updateRole);
router.delete("/:id", authMiddleware, deleteRole);

module.exports = router;
