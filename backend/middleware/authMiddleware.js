const { verifyToken } = require('../utils/jwtUtils');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Full authentication is required to access this resource' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Spring Boot set subject as username. So sub in decoded represents username.
    const username = decoded.sub;
    if (!username) {
      return res.status(401).json({ message: 'Token is missing subject claim' });
    }

    const user = await User.findOne({ username }); // Mongoose query syntax
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server authentication error' });
  }
};

const hasRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Role check (Spring Boot stores role e.g., 'ROLE_USER')
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Access Denied: You do not have the required permissions' });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  hasRole,
};
