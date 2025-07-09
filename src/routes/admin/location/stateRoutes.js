const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../../../middleware/admin/authenticate");

const {
  getAllStates
} = require("../../../controllers/location/stateController");

// Base: /api/admin/member/role
router.get("/", authMiddleware, getAllStates);

module.exports = router;
