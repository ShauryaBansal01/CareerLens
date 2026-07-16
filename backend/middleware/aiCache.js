const crypto = require('crypto');

/**
 * In-memory AI response cache with TTL.
 * Caches AI responses by user + endpoint + body hash so that
 * identical repeat requests are served instantly.
 */
const cache = new Map();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a deterministic cache key from request properties.
 */
function getCacheKey(req) {
  const userId = req.user?.id || 'anonymous';
  const endpoint = req.originalUrl;
  const bodyHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(req.body || {}))
    .digest('hex')
    .substring(0, 16); // short hash is sufficient
  return `${userId}:${endpoint}:${bodyHash}`;
}

/**
 * Middleware that checks the cache before hitting the controller.
 * If a cached response exists and hasn't expired, it's returned immediately.
 * Otherwise, it wraps res.json() to capture and cache the response.
 */
function aiCache(req, res, next) {
  const key = getCacheKey(req);
  const cached = cache.get(key);

  // Cache hit — serve instantly
  if (cached && Date.now() < cached.expiresAt) {
    return res.status(200).json(cached.data);
  }

  // Cache miss — wrap res.json to capture the response
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    // Only cache successful responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(key, {
        data,
        expiresAt: Date.now() + DEFAULT_TTL_MS,
      });
    }
    return originalJson(data);
  };

  next();
}

/**
 * Invalidate all cache entries for a specific user.
 * Call this when the user uploads a new resume.
 */
function invalidateUserCache(userId) {
  for (const [key] of cache) {
    if (key.startsWith(`${userId}:`)) {
      cache.delete(key);
    }
  }
}

/**
 * Periodically clean up expired entries to prevent memory leaks.
 * Runs every 10 minutes.
 */
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now >= entry.expiresAt) {
      cache.delete(key);
    }
  }
}, 10 * 60 * 1000);

// Prevent the timer from keeping the process alive during shutdown
cleanupInterval.unref();

/**
 * Clear the cleanup interval for graceful shutdown.
 */
function cleanup() {
  clearInterval(cleanupInterval);
}

module.exports = { aiCache, invalidateUserCache, cleanup };
