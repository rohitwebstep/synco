// Middleware to extract session token & check role
const { findUserByToken } = require('../models/user');

exports.checkRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    const session_token = req.headers['x-session-token'] || req.body.session_token;

    if (!session_token) {
      return res.status(401).json({ message: 'No session token provided' });
    }

    try {
      const user = await findUserByToken(session_token);
      if (!user) {
        return res.status(401).json({ message: 'Invalid session token' });
      }

      // Add user to request for later use
      req.user = user;

      if (!allowedRoles.includes(user.role_name)) {
        return res.status(403).json({ message: 'Access denied: insufficient role' });
      }

      next();
    } catch (error) {
      console.error("Role Middleware Error:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  };
};
