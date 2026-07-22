const crypto = require('crypto');
const { cacheGet, cacheSet, cacheDel } = require('../config/redis');

const DEFAULT_TTL_MS = 5 * 60 * 1000;

function getCacheKey(req) {
  const userId = req.user?.id || 'anonymous';
  const endpoint = req.originalUrl;
  const bodyHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(req.body || {}))
    .digest('hex')
    .substring(0, 16);
  return `aicache:${userId}:${endpoint}:${bodyHash}`;
}

async function aiCache(req, res, next) {
  const key = getCacheKey(req);

  const cached = await cacheGet(key);
  if (cached) {
    return res.status(200).json(cached);
  }

  const originalJson = res.json.bind(res);
  res.json = (data) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cacheSet(key, data, DEFAULT_TTL_MS).catch(() => {});
    }
    return originalJson(data);
  };

  next();
}

async function invalidateUserCache(userId) {
  await cacheDel(`aicache:${userId}:*`);
}

function cleanup() {
  // Redis handles TTL natively; in-memory fallback is ephemeral
}

module.exports = { aiCache, invalidateUserCache, cleanup };
