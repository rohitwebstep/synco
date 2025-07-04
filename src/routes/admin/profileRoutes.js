const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authenticate");

const {
    profile
} = require("../../controllers/admin/authController");

router.get("/profile", authMiddleware, profile);

module.exports = router;
