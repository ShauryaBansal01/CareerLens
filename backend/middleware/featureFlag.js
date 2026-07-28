const crypto = require('crypto');
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

// Deterministically bucket a user into 0-99 for one specific flag.
//
// This replaces a character-code sum of the ObjectId, which failed as a
// rollout hash twice over. First, the sum of 24 hex digits is a narrow bell
// curve — it can only land in 1152-2448 and clusters hard around 1683 — so
// `% 100` was nowhere near uniform and a "10%" rollout reached an arbitrary
// fraction of users. Second, the flag name was not part of the input, so
// every flag bucketed every user identically: whoever fell in the first 10%
// for one flag fell in the first 10% for all of them. Rollouts were perfectly
// correlated instead of independent, which also biases any A/B read.
function bucketFor(flagName, userId) {
  const digest = crypto.createHash('sha256').update(`${flagName}:${userId}`).digest();
  return digest.readUInt32BE(0) % 100;
}

function checkFlag(flag, userId) {
  if (!flag || !flag.enabled) return false;

  if (flag.userIds && flag.userIds.length > 0 && userId) {
    return flag.userIds.some((id) => id.toString() === userId.toString());
  }

  // `percentage` 0 means "no percentage gating" and 100 means everyone, so
  // only a partial rollout needs bucketing.
  if (flag.percentage > 0 && flag.percentage < 100) {
    // A partial rollout cannot include a caller we can't identify. This used
    // to fall through to `return flag.enabled`, handing anonymous requests
    // 100% of a flag that was supposed to be limited to a slice of users.
    if (!userId) return false;
    return bucketFor(flag.name, userId) < flag.percentage;
  }

  return true;
}

function invalidateFlagCache(name) {
  if (name) {
    cache.delete(name);
  } else {
    cache.clear();
  }
}

module.exports = { isFeatureEnabled, invalidateFlagCache };
