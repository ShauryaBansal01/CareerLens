const dotenv = require('dotenv');
dotenv.config();
const cluster = require('cluster');
const os = require('os');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { generalLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const projectRoutes = require('./routes/projectRoutes');
const adminRoutes = require('./routes/adminRoutes');
const profileRoutes = require('./routes/profileRoutes');

const PORT = process.env.PORT || 5000;
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  // ── Primary Process: fork workers ────────────────────────────────────────
  console.log(`🚀 Primary process ${process.pid} starting ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Auto-restart crashed workers
  cluster.on('exit', (worker, code, signal) => {
    console.warn(`⚠️  Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`);
    cluster.fork();
  });
} else {
  // ── Worker Process: run the Express app ──────────────────────────────────

  // Connect to database (each worker gets its own connection pool)
  connectDB();

  const app = express();

  // ── Performance & Security Middleware ──────────────────────────────────
  app.use(compression());   // Gzip all responses — reduces bandwidth by 60-80%
  app.use(helmet());        // Set secure HTTP headers

  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Adjust based on your deployed frontend URL
    credentials: true
  }));
  app.use(express.json());

  // Health check — no rate limiting (used by load balancers & monitoring)
  app.get('/', (req, res) => {
    res.send('API is running...');
  });

  // Apply rate limiter only to API routes (not health check)
  app.use('/api', generalLimiter);

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/resume', resumeRoutes);
  app.use('/api/analysis', analysisRoutes);
  app.use('/api/roadmap', roadmapRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/keys', require('./routes/apiKeyRoutes'));

  app.listen(PORT, () => {
    console.log(`✅ Worker ${process.pid} listening on port ${PORT}`);
  });
}
