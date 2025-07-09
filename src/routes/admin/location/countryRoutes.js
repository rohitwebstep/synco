const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../../../middleware/admin/authenticate");

const {
  getAllCountries
} = require("../../../controllers/location/countryController");

// Base: /api/admin/member/role
router.get("/", authMiddleware, getAllCountries);

module.exports = router;
