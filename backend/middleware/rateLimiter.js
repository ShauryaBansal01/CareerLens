const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter.
 * Allows 100 requests per 15-minute window per IP.
 * Applied globally to all routes.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * Strict rate limiter for AI-powered routes.
 * These routes call external AI APIs (Gemini) which are expensive and slow.
 * Allows 10 requests per 15-minute window per IP.
 */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI requests. Please wait before trying again.',
  },
});

/**
 * Auth rate limiter to prevent brute-force login attempts.
 * Allows 20 requests per 15-minute window per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

/**
 * Per-user (or per-IP as fallback) rate limiter for authenticated endpoints.
 * Keys on req.user.id when available, falls back to IP.
 */
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    if (req.user?.id) return req.user.id.toString();
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    return ip.replace(/^::ffff:/, '');
  },
  message: {
    success: false,
    message: 'Too many requests, please try again after 15 minutes.',
  },
});

module.exports = { generalLimiter, aiLimiter, authLimiter, userLimiter };
