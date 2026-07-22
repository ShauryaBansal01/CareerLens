const Redis = require('ioredis');

let redis = null;
let fallback = null;
let isConfiguredChecked = false;
let redisFailed = false;

function getRedis() {
  if (redis) return redis;
  if (redisFailed) return null;

  if (!fallback) {
    fallback = new Map();
  }

  const url = process.env.REDIS_URL;
  if (!url) {
    if (!isConfiguredChecked) {
      console.log('Redis not configured — using in-memory fallback cache');
      isConfiguredChecked = true;
    }
    return null;
  }

  if (isConfiguredChecked && !redis) {
    return null;
  }

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('Redis connection failed after 3 retries — using in-memory fallback');
          redisFailed = true;
          if (redis) {
            redis.disconnect();
            redis = null;
          }
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      if (!redisFailed) {
        console.error('Redis error:', err.message);
      }
    });

    redis.on('connect', () => {
      console.log('Redis connected');
      redisFailed = false;
    });

    isConfiguredChecked = true;
    return redis;
  } catch (err) {
    console.warn('Redis initialization failed — using in-memory fallback:', err.message);
    redisFailed = true;
    isConfiguredChecked = true;
    redis = null;
    return null;
  }
}

async function cacheGet(key) {
  const client = getRedis();
  if (client) {
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      // Fall through to in-memory cache if Redis command fails
    }
  }
  if (fallback) {
    const entry = fallback.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      return entry.data;
    }
    if (entry) fallback.delete(key);
  }
  return null;
}

async function cacheSet(key, data, ttlMs = 5 * 60 * 1000) {
  const client = getRedis();
  if (client) {
    try {
      await client.setex(key, Math.ceil(ttlMs / 1000), JSON.stringify(data));
      return;
    } catch {
      // Fall through to in-memory cache if Redis command fails
    }
  }
  if (!fallback) fallback = new Map();
  fallback.set(key, { data, expiresAt: Date.now() + ttlMs });
}

async function cacheDel(pattern) {
  const client = getRedis();
  if (client) {
    try {
      let cursor = '0';
      do {
        const result = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = result[0];
        const keys = result[1];
        if (keys.length > 0) {
          await client.del(...keys);
        }
      } while (cursor !== '0');
      return;
    } catch {
      // Fall through to in-memory cache if Redis command fails
    }
  }
  if (fallback) {
    const prefix = pattern.replace('*', '');
    for (const [key] of fallback) {
      if (key.startsWith(prefix)) {
        fallback.delete(key);
      }
    }
  }
}

async function cacheClose() {
  if (redis) {
    try {
      await redis.quit();
    } catch {
      // ignore
    }
    redis = null;
  }
  if (fallback) {
    fallback.clear();
    fallback = null;
  }
}

module.exports = { cacheGet, cacheSet, cacheDel, cacheClose };

