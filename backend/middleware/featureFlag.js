const FeatureFlag = require('../models/FeatureFlag');

const cache = new Map();
const CACHE_TTL = 60 * 1000;

async function isFeatureEnabled(name, userId) {
  const cached = cache.get(name);
  if (cached && Date.now() < cached.expiresAt) {
    return checkFlag(cached.flag, userId);
  }

  const flag = await FeatureFlag.findOne({ name });
  cache.set(name, { flag, expiresAt: Date.now() + CACHE_TTL });
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
