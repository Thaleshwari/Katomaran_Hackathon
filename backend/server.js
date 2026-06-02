const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

// Import models to ensure they are registered in Mongoose
require('./models');

const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const redirectRoutes = require('./routes/redirectRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// Trust proxy to read the correct client protocol/host when deployed behind reverse proxies (like Render)
app.set('trust proxy', true);

// CORS configuration matching your frontend ports and deployed environments
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://katomaran-hackathon.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, postman, or curl)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin) ||
                      origin.endsWith('.vercel.app') ||
                      origin.endsWith('.onrender.com') ||
                      (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL.trim());

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Request from unauthorized origin: ${origin}`);
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
  credentials: true,
};

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware for debugging API calls
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/s', redirectRoutes); // Short URL redirect endpoint (/s/:shortUrl)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'An unexpected server error occurred' });
});

// Initialize MongoDB and start server
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Start listening
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
