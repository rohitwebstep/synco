const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/member/authenticate");

const {
    profile
} = require("../../controllers/member/authController");

router.get("/", authMiddleware, profile);

module.exports = router;
