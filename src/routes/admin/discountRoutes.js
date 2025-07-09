const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
    res.json({
        status: true,
        message: "discount request"
    });
});

module.exports = router;
