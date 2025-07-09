const { getAdminById } = require("../../services/admin/admin");
const { verifyToken } = require("../../utils/jwt");

/**
 * Middleware to authenticate admins using JWT.
 * Adds validated admin info to `req.admin`.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token is missing or improperly formatted.",
      });
    }

    const token = authHeader.split(" ")[1];
    const result = verifyToken(token);

    if (!result.success) {
      let statusCode = 401;
      if (result.message === "Token has expired.") {
        statusCode = 403; // Forbidden - valid but expired
      }

      return res.status(statusCode).json({
        message: result.message || "Unauthorized access.",
        code: result.code || "AUTH_ERROR",
      });
    }

    const { status, data: admin } = await getAdminById(result.payload.id);

    if (!status || !admin) {
      return res
        .status(404)
        .json({ message: "Admin associated with token not found." });
    }

    // Attach validated admin to request
    req.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    };

    next();
  } catch (error) {
    console.error("❌ Auth middleware exception:", error);
    return res.status(500).json({
      message: "Something went wrong during authentication. Please try again.",
    });
  }
};

module.exports = authMiddleware;
