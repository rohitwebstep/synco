const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/member/authenticate");

const {
  register,
  login,
  verifyLogin,
  profile,
  forgetPassword,
  verifyOtpAndResetPassword,
} = require("../../controllers/member/authController");

router.post("/register", register); //register route
router.post("/login", login); // login route
router.get("/login/verify", authMiddleware, verifyLogin); // login route
router.post("/password/forget", forgetPassword); //forgot password route
router.post("/password/reset", verifyOtpAndResetPassword); //verify-otp and Reset-password route

module.exports = router;
