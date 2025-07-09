const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../../middleware/admin/authenticate");

const {
  getAllCities
} = require("../../controllers/location/cityController");

// Base: /api/admin/member/role
router.get("/", getAllCities);

module.exports = router;
