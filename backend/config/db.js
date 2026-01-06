const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  Server will continue running without database connection');
    console.log('   Database operations will fail until MongoDB is connected');
    console.log('   See backend/MONGODB_SETUP.md for setup instructions');
    // Don't exit - allow server to run for API testing
  }
};

module.exports = connectDB;
