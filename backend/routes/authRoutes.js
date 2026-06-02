const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

router.post('/public/register', registerUser);
router.post('/public/login', loginUser);

module.exports = router;
