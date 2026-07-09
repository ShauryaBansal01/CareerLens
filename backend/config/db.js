const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/careerlens',
      {
        serverSelectionTimeoutMS: 8000,   // fail fast, don't hang
        socketTimeoutMS: 45000,
        retryWrites: true,
        // ── Connection pool tuning for high concurrency ──────────────────
        maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 50,
        minPoolSize: 5,        // Keep warm connections ready to avoid cold-start latency
        maxIdleTimeMS: 30000,  // Close idle connections after 30s to free resources
      }
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('');
    console.error('  Common fixes:');
    console.error('  1. Use a mobile hotspot — campus Wi-Fi may block port 27017');
    console.error('  2. Add your IP to MongoDB Atlas Network Access whitelist');
    console.error('  3. Check that MONGO_URI in .env is correct');
    process.exit(1);
  }
};

module.exports = connectDB;
