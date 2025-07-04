const { sequelize } = require("../config/db");
const { QueryTypes } = require("sequelize");

exports.logActivity = async ({ user_id, action, module, description }) => {
  try {
    await sequelize.query(
      `INSERT INTO activity_logs (user_id, action, module, description) 
       VALUES (?, ?, ?, ?)`,
      {
        replacements: [user_id, action, module, description],
        type: QueryTypes.INSERT,
      }
    );
  } catch (err) {
    console.error("Activity logging error:", err.message);
  }
};
