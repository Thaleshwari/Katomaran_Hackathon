const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_for_url_shortener_dev';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '2d';

/**
 * Generate a JWT token matching Spring Boot claims
 * @param {Object} user - User database model instance
 * @returns {String} Signed JWT token
 */
const generateToken = (user) => {
  const payload = {
    sub: user.username,
    roles: user.role, // Comma separated roles if multiple, or just the string e.g. "ROLE_USER"
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
};

/**
 * Verify and decode a JWT token
 * @param {String} token - JWT token
 * @returns {Object|null} Decoded payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
