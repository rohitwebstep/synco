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

// Routes
app.use("/api/admin/member", require("./routes/admin/member"));
app.use("/api/admin/auth", require("./routes/admin/authRoutes"));
app.use("/api/admin/profile", require("./routes/admin/profileRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

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
