const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/admin/authenticate");
const {
    createAdmin,
    getAllAdmins,
    updateAdmin,
    changeAdminStatus,
    deleteAdmin,
    getAdminProfile
} = require("../../controllers/admin/adminController");

const multer = require("multer");
const upload = multer();

router.use("/role", require("./roleRoutes"));

// Base: /api/admin/admin
router.post("/", upload.single("profile"), authMiddleware, createAdmin);
router.get("/", getAllAdmins);
router.get("/:id", authMiddleware, getAdminProfile);
router.put("/:id", upload.single("profile"), authMiddleware, updateAdmin);
router.patch("/:id/status", authMiddleware, changeAdminStatus);
router.delete("/:id", authMiddleware, deleteAdmin);

// Mount sub-routes here

module.exports = router;
