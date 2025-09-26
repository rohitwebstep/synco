const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/admin/authenticate");
const permissionMiddleware = require("../../middleware/admin/permission");

const {
  createBooking,
  getAllWaitingListBookings,
  getAccountProfile,
  sendEmail,
  removeWaitingList,
  convertToMembership,
  updateWaitinglistBooking,
} = require("../../controllers/admin/booking/waitingListController");

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("waiting-list", "create"),
  createBooking
);
router.get(
  "/",
  authMiddleware,
  permissionMiddleware("waiting-list", "view-listing"),
  getAllWaitingListBookings
);
router.get(
  "/service-history/:id",
  authMiddleware,
  permissionMiddleware("waiting-list", "view-listing"),
  getAccountProfile
);

router.put(
  "/service-history/update/:bookingId",
  authMiddleware,
  permissionMiddleware("waiting-list", "update"),
  updateWaitinglistBooking
);

router.post(
  "/send-email",
  authMiddleware,
  permissionMiddleware("waiting-list", "view-listing"),
  sendEmail
);

// ✅ Remove from waiting list route
router.post(
  "/remove",
  authMiddleware,
  permissionMiddleware("waiting-list", "remove"), // new permission key
  removeWaitingList
);
router.put(
  "/convert-membership/:id", // ✅ add :id here
  authMiddleware,
  permissionMiddleware("waiting-list", "remove"),
  convertToMembership
);

module.exports = router;
