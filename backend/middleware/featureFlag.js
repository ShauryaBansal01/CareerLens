const FeatureFlag = require('../models/FeatureFlag');

const cache = new Map();
const CACHE_TTL = 60 * 1000;
const CACHE_MAX_SIZE = 100;

function evictStaleEntries() {
  if (cache.size <= CACHE_MAX_SIZE) return;
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now >= entry.expiresAt) cache.delete(key);
  }
  if (cache.size > CACHE_MAX_SIZE) {
    const iterator = cache.keys();
    while (cache.size > CACHE_MAX_SIZE) cache.delete(iterator.next().value);
  }
}

async function isFeatureEnabled(name, userId) {
  const cached = cache.get(name);
  if (cached && Date.now() < cached.expiresAt) {
    return checkFlag(cached.flag, userId);
  }

  const flag = await FeatureFlag.findOne({ name });
  cache.set(name, { flag, expiresAt: Date.now() + CACHE_TTL });
  evictStaleEntries();
  return checkFlag(flag, userId);
}

function checkFlag(flag, userId) {
  if (!flag) return false;
  if (!flag.enabled) return false;
  if (flag.userIds && flag.userIds.length > 0 && userId) {
    return flag.userIds.some((id) => id.toString() === userId.toString());
  }
  if (flag.percentage > 0 && userId) {
    const hash = userId.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return hash % 100 < flag.percentage;
  }
  return flag.enabled;
}

function invalidateFlagCache(name) {
  if (name) {
    cache.delete(name);
  } else {
    cache.clear();
  }
}

module.exports = { isFeatureEnabled, invalidateFlagCache };
