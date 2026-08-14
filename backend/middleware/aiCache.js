const crypto = require('crypto');
const { cacheGet, cacheSet, cacheDel } = require('../config/cache');

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

/**
 * `POST /resume/improve` sends an empty body, so its cache key is constant for
 * a given user and every call inside the TTL replays the first response. That
 * made the "Re-analyze" button a no-op — the one action whose entire purpose is
 * to produce a new answer.
 *
 * Honouring `Cache-Control: no-cache` lets the caller opt out explicitly. The
 * response is still written back, so the refreshed result is what subsequent
 * requests get rather than the stale one lingering.
 */
function wantsFreshResult(req) {
  return /\bno-cache\b/i.test(req.headers['cache-control'] || '');
}

async function aiCache(req, res, next) {
  const key = getCacheKey(req);

  if (!wantsFreshResult(req)) {
    const cached = await cacheGet(key);
    if (cached) {
      return res.status(200).json(cached);
    }
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
  // Entries carry their own expiry and are checked on read, so there is no
  // sweep to run. The cache dies with the process.
}

module.exports = { aiCache, invalidateUserCache, cleanup };
