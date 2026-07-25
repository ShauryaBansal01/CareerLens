const mongoose = require('mongoose');

// Pool sizing is env-tunable. The previous code gave production a *smaller*
// pool (10) than development (50), which is backwards; a single tunable with
// one sane default avoids re-introducing that asymmetry.
const MAX_POOL_SIZE = parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 10;
const MIN_POOL_SIZE = parseInt(process.env.MONGO_MIN_POOL_SIZE, 10) || 2;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/careerlens',
      {
        serverSelectionTimeoutMS: 8000,   // fail fast, don't hang
        socketTimeoutMS: 45000,
        retryWrites: true,
        // ── Connection pool tuning ───────────────────────────────────────
        maxPoolSize: MAX_POOL_SIZE,
        minPoolSize: MIN_POOL_SIZE,  // Keep warm connections ready to avoid cold-start latency
        maxIdleTimeMS: 30000,        // Close idle connections after 30s to free resources
      }
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // The initial connect succeeding says nothing about staying connected.
    // Without these, a dropped connection is silent and every query just hangs
    // until serverSelectionTimeoutMS.
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected — driver will attempt to reconnect');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
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
