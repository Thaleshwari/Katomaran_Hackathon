const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in .env file');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error(`   Reason: ${error.message}`);

    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.error('\n👉 FIX: Authentication failed. Please check:');
      console.error('   1. Go to MongoDB Atlas → Database Access');
      console.error('   2. Verify your username: thaleshwari2005');
      console.error('   3. Reset/verify your password');
      console.error('   4. Make sure the user has "Read and Write" access to the database\n');
    }

    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect ETIMEDOUT')) {
      console.error('\n👉 FIX: Connection refused. Please check:');
      console.error('   1. Go to MongoDB Atlas → Network Access');
      console.error('   2. Add your current IP address OR add 0.0.0.0/0 to allow all IPs\n');
    }

    process.exit(1);
  }
};

module.exports = connectDB;
