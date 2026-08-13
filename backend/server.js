const dotenv = require('dotenv');
dotenv.config();

const Sentry = require('@sentry/node');

// Must run before express is required so Sentry can auto-instrument it.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
  enabled: !!process.env.SENTRY_DSN,
});

const express = require('express');
const multer = require('multer');
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
const apiKeyRoutes = require('./routes/apiKeyRoutes');

const PORT = process.env.PORT || 5000;

// Fail fast on missing required configuration rather than 500ing at runtime.
const REQUIRED_ENV = ['JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

// Connect to database
connectDB();

const app = express();

// Render (and most PaaS) terminate TLS at a proxy. Without this, req.ip is the
// load balancer's address and every rate limiter shares one bucket across all
// users. `1` = trust exactly one hop; do not use `true` (spoofable).
app.set('trust proxy', 1);

// Don't advertise the framework.
app.disable('x-powered-by');

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
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-ai-provider'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check — no rate limiting (used by Render & UptimeRobot)
const health = (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
};

app.get('/', health);

// Registered before the /api rate limiter so polling it never consumes a
// caller's request budget. The frontend previously probed liveness with
// `api.get('/../')`, which only reached the root because the browser normalises
// `/api/..` away — fragile, and it broke if the API was mounted on a subpath.
app.get('/api/health', health);

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
app.use('/api/keys', apiKeyRoutes);

// ── 404 for unmatched routes (must be AFTER all routes) ────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
});

// Sentry error handler (must be BEFORE the generic error handler).
// v8+ replaced the old `Sentry.Handlers.*` middleware with this helper —
// the previous `Sentry.Handlers` guard silently no-opped on v10, meaning no
// backend errors were ever reported.
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// ── Global Error Handler (must be AFTER all routes) ───────────────────
app.use((err, req, res, _next) => {
  // Multer surfaces upload problems as errors — these are client mistakes, not
  // server faults, so translate them instead of reporting a 500.
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File is too large. Maximum size is 10MB.'
      : `Upload error: ${err.message}`;
    return res.status(400).json({ message });
  }
  if (err && err.message === 'Only PDFs are allowed') {
    return res.status(400).json({ message: err.message });
  }

  const statusCode = err.statusCode || err.status || 500;

  if (statusCode >= 500) {
    console.error('Unhandled error:', err.stack || err.message || err);
    // Don't leak internal error details in production
    const message = process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : (err.message || 'Internal server error');
    return res.status(statusCode).json({ message });
  }

  // 4xx errors are the caller's problem — their message is safe to return and
  // masking it as "Internal server error" actively misleads the client.
  return res.status(statusCode).json({ message: err.message || 'Request failed' });
});

const server = app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});

// ── Graceful Shutdown ─────────────────────────────────────────────────
const { cleanup: cleanupAiCache } = require('./middleware/aiCache');
const { cacheClose } = require('./config/cache');
const { closeEmailTransport } = require('./utils/sendEmail');
const mongoose = require('mongoose');

let shuttingDown = false;

const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n${signal} received. Shutting down gracefully...`);

  // Force exit if the close sequence hangs. `unref` so this timer alone
  // doesn't hold the event loop open when shutdown succeeds quickly.
  const forceExit = setTimeout(() => {
    console.error('Shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000);
  forceExit.unref();

  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      cleanupAiCache();
      closeEmailTransport();
      await cacheClose();
      await mongoose.connection.close();
    } catch (err) {
      console.error('Error during shutdown cleanup:', err.message);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  Sentry.captureException(reason);
});

module.exports = app;
