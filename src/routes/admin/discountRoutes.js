const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../../middleware/admin/authenticate");

const {
    createDiscount
} = require("../../controllers/admin/discountController");

router.post("/", authMiddleware, createDiscount);

module.exports = router;
