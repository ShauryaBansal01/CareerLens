const rateLimit = require('express-rate-limit');

/**
 * NOTE ON STORAGE: these limiters use express-rate-limit's default in-memory
 * store, so counters are per-process and reset on deploy. That is adequate for
 * the current single-instance deployment. If the backend is ever scaled to
 * more than one instance, swap in a shared store (e.g. rate-limit-redis backed
 * by the REDIS_URL already used by config/redis.js) or the effective limit
 * becomes `max * instanceCount`.
 *
 * These all key off `req.ip`, which is only meaningful because server.js sets
 * `trust proxy` — without it every request appears to come from the load
 * balancer and a single caller can exhaust the limit for everyone.
 */

const standard = {
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
};

/**
 * General API rate limiter.
 * Allows 100 requests per 15-minute window per IP.
 * Applied globally to all routes.
 */
const generalLimiter = rateLimit({
  ...standard,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * Strict rate limiter for AI-powered routes.
 * These routes call external AI APIs which are expensive and slow.
 * Allows 10 requests per 15-minute window per IP.
 */
const aiLimiter = rateLimit({
  ...standard,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many AI requests. Please wait before trying again.',
  },
});

/**
 * Auth rate limiter to prevent brute-force login attempts.
 * Allows 20 requests per 15-minute window per IP.
 * Successful requests don't count, so a legitimate user who logs in normally
 * never burns through the budget.
 */
const authLimiter = rateLimit({
  ...standard,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

/**
 * Rate limiter for endpoints that send email (OTP issue / resend).
 * Tighter than authLimiter because each request costs an outbound email and
 * these endpoints are the obvious target for mail-bombing a third party.
 */
const otpLimiter = rateLimit({
  ...standard,
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many verification codes requested. Please try again later.',
  },
});

/**
 * Per-user (or per-IP as fallback) rate limiter for authenticated endpoints.
 * Keys on req.user.id when available, falls back to IP.
 * Must be mounted *after* `protect` for the per-user key to apply.
 */
const userLimiter = rateLimit({
  ...standard,
  windowMs: 15 * 60 * 1000,
  max: 200,
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

module.exports = { generalLimiter, aiLimiter, authLimiter, otpLimiter, userLimiter };
