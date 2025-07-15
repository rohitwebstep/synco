const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../../middleware/admin/authenticate");

const {
  createAdminRole,
  getAllAdminRoles,
  getAdminRoleById,
  updateAdminRole,
  deleteAdminRole
} = require("../../controllers/admin/adminRoleController");

// Base: /api/admin/admin/role
router.post("/", authMiddleware, createAdminRole);
router.get("/", authMiddleware, getAllAdminRoles);
router.get("/:id", authMiddleware, getAdminRoleById);
router.put("/:id", authMiddleware, updateAdminRole);
router.delete("/:id", authMiddleware, deleteAdminRole);

module.exports = router;
