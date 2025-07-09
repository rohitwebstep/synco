const { sequelize } = require("./config/db");
require("./models"); // Automatically registers models and associations

(async () => {
  try {
    // 🔐 Disable FK constraints temporarily
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    // 🔁 Drop and recreate all tables
    await sequelize.sync({ force: true });

    // ✅ Re-enable FK constraints
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ All models were synchronized successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to sync models:", err);
    process.exit(1);
  }
})();
