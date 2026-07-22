const dotenv = require('dotenv');
dotenv.config();

const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
  enabled: !!process.env.SENTRY_DSN,
});

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

// ── Single Process: run the Express app ─────────────────────────

// Connect to database
connectDB();

const app = express();

// ── Performance & Security Middleware ──────────────────────────────────
  app.use(compression());   // Gzip all responses — reduces bandwidth by 60-80%
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://texlive.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173'],
        workerSrc: ["'self'", "blob:"],
        frameSrc: ["'self'", "https://texlive.net"],
      },
    },
  }));        // Set secure HTTP headers

  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Adjust based on your deployed frontend URL
    credentials: true
  }));
  if (process.env.SENTRY_DSN && Sentry.Handlers) {
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
  }
  app.use(express.json());

  // Health check — no rate limiting (used by Render & UptimeRobot)
  app.get('/', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
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

  // Sentry error handler (must be BEFORE the generic error handler)
  if (process.env.SENTRY_DSN && Sentry.Handlers) {
    app.use(Sentry.Handlers.errorHandler());
  }

  // ── Global Error Handler (must be AFTER all routes) ───────────────────
  app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err.stack || err.message || err);

    const statusCode = err.statusCode || 500;
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Internal server error';

    res.status(statusCode).json({ message });
  });

  const server = app.listen(PORT, () => {
    console.log(`✅ Server listening on port ${PORT}`);
  });

  // ── Graceful Shutdown ─────────────────────────────────────────────────
  const { cleanup: cleanupAiCache } = require('./middleware/aiCache');
  const { cacheClose } = require('./config/redis');

  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    cleanupAiCache();
    cacheClose().catch(() => {});
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
    // Force exit after 10s if server hasn't closed
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
