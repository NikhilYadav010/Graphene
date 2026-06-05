const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = (process.env.MONGODB_URI || '').replace(/^["']|["']$/g, '');
    if (!uri) {
      console.error('❌ MONGODB_URI is not set in environment variables');
      process.exit(1);
    }
    console.log('⏳ Connecting to MongoDB...');
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
