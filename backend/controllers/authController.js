const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../utils/jwtUtils');

/**
 * Register a new user
 */
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields (username, email, password) are required' });
    }

    // Check if user already exists (Mongoose syntax)
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash the password (using BCrypt)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (Mongoose syntax)
    await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'ROLE_USER', // Default role matching Spring Boot
    });

    // Spring Boot returns simple string text "User Registered Successfully"
    return res.status(200).send('User Registered Successfully');
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
};

/**
 * Login user and return JWT token
 */
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user (Mongoose syntax)
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return token in JwtAuthenticationResponse format
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
