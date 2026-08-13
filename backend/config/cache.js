/**
 * In-process response cache.
 *
 * This was previously a Redis client with an in-memory fallback, but the
 * fallback was the only path ever exercised: REDIS_URL was unset in every
 * environment, so the app paid for a dependency, a connection state machine
 * and a retry policy to reach the same Map it now uses directly.
 *
 * The tradeoff is unchanged from what the fallback already gave us — the cache
 * is per-process and lost on restart. That is correct for a single-instance
 * deployment and for the only thing being cached (AI responses, 5-minute TTL,
 * keyed per user). If the backend is ever scaled horizontally, a shared store
 * becomes worth reintroducing; until then it is cost without benefit.
 */

// A plain Map has no eviction of its own, so without a cap it grows unbounded
// for the whole process lifetime. Entries are insertion-ordered, which makes
// oldest-first eviction a simple walk from the front.
const MAX_ENTRIES = 500;

const store = new Map();

function set(key, value) {
  // Re-inserting must refresh position, otherwise a hot key stays at the front
  // and gets evicted despite constant use.
  store.delete(key);
  store.set(key, value);

  if (store.size <= MAX_ENTRIES) return;

  // Cheap pass: drop anything already expired before evicting live entries.
  const now = Date.now();
  for (const [k, entry] of store) {
    if (now >= entry.expiresAt) store.delete(k);
  }

  const iterator = store.keys();
  while (store.size > MAX_ENTRIES) {
    const oldest = iterator.next();
    if (oldest.done) break;
    store.delete(oldest.value);
  }
}

async function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() >= entry.expiresAt) {
    store.delete(key);
    return null;
  }

  return entry.data;
}

async function cacheSet(key, data, ttlMs = 5 * 60 * 1000) {
  set(key, { data, expiresAt: Date.now() + ttlMs });
}

/**
 * Deletes by key pattern. Only trailing-`*` prefix patterns are used
 * (`aicache:<userId>:*`), which is all this needs to support.
 */
async function cacheDel(pattern) {
  const prefix = pattern.replace('*', '');
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

async function cacheClose() {
  store.clear();
}

module.exports = { cacheGet, cacheSet, cacheDel, cacheClose };
