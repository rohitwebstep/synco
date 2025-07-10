const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../../middleware/admin/authenticate");

const {
    createDiscount,
    getAllDiscounts
} = require("../../controllers/admin/discountController");

router.post("/", authMiddleware, createDiscount);
router.get("/", authMiddleware,  getAllDiscounts);

module.exports = router;
