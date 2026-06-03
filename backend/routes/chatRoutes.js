const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatController');
const { authMiddleware, hasRole } = require('../middleware/authMiddleware');

// Secure route: only registered users can chat with the assistant
router.post('/', authMiddleware, hasRole('ROLE_USER'), handleChat);

module.exports = router;
