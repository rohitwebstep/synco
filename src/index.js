const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path"); // ✅ Add path module
const { sequelize, connectWithRetry } = require("./config/db");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static files from /uploads
app.use('/uploads', express.static('uploads'));

// ✅ Auth & Profile
app.use("/api/admin/auth", require("./routes/admin/authRoutes"));          // Login, Logout, etc.
app.use("/api/admin/profile", require("./routes/admin/profileRoutes"));    // Admin profile CRUD

// ✅ Member Management
app.use("/api/admin/member", require("./routes/admin/member"));           // Manage members

// ✅ Notifications
app.use("/api/admin/notification", require("./routes/admin/notification/notificationRoutes"));  // Notifications (CRUD, read status)
app.use("/api/admin/custom-notification", require("./routes/admin/notification/customNotificationRoutes"));  // Notifications (CRUD, read status)

// ✅ Payments
app.use("/api/admin/payment-plan", require("./routes/admin/payment/paymentPlanRoutes"));         // Plan definitions
app.use("/api/admin/payment-group", require("./routes/admin/payment/paymentGroupRoutes"));       // Group definitions

// ✅ Discounts
app.use("/api/admin/discount", require("./routes/admin/discountRoutes"));  // Discount logic


// ✅ Auth & Profile
app.use("/api/member/auth", require("./routes/member/authRoutes"));          // Login, Logout, etc.
app.use("/api/member/profile", require("./routes/member/profileRoutes"));    // Member profile CRUD

// ✅ Notifications
app.use("/api/member/notification", require("./routes/member/notification/notificationRoutes"));  // Notifications (CRUD, read status)

app.use("/api/location", require("./routes/location"));           // Manage members

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server only after DB is connected
connectWithRetry().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
