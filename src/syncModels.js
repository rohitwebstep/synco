const { sequelize } = require("./config/db");
const models = require("./models"); // This will automatically register all models and associations

(async () => {
  try {
    await sequelize.sync({ force: true }); // use { force: true } to drop & recreate
    console.log("✅ All models were synchronized successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to sync models:", err);
    process.exit(1);
  }
})();
