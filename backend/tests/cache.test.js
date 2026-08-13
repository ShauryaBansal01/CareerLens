const { cacheGet, cacheSet, cacheDel, cacheClose } = require('../config/cache');

// The cache used to be a Redis client whose in-memory fallback was the only
// path ever taken, and none of that eviction logic was covered. Now that it is
// the whole implementation, the bounds it promises need to be enforced.

const MAX_ENTRIES = 500;

afterEach(async () => {
  await cacheClose();
});

describe('response cache', () => {
  it('stores and returns a value', async () => {
    await cacheSet('a', { v: 1 });
    expect(await cacheGet('a')).toEqual({ v: 1 });
  });

  it('returns null for a key that was never set', async () => {
    expect(await cacheGet('missing')).toBeNull();
  });

  it('expires entries once the TTL has passed', async () => {
    await cacheSet('short', { v: 2 }, 30);
    expect(await cacheGet('short')).toEqual({ v: 2 });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(await cacheGet('short')).toBeNull();
  });

  it('clears one user without touching another', async () => {
    // The pattern aiCache.invalidateUserCache actually passes.
    await cacheSet('aicache:u1:/improve:h1', { v: 1 });
    await cacheSet('aicache:u1:/optimize:h2', { v: 2 });
    await cacheSet('aicache:u2:/improve:h3', { v: 3 });

    await cacheDel('aicache:u1:*');

    expect(await cacheGet('aicache:u1:/improve:h1')).toBeNull();
    expect(await cacheGet('aicache:u1:/optimize:h2')).toBeNull();
    expect(await cacheGet('aicache:u2:/improve:h3')).toEqual({ v: 3 });
  });

  it('stays bounded when more live entries are written than the cap', async () => {
    // Long TTLs, so nothing is dropped by expiry — only the cap can hold this.
    for (let i = 0; i < MAX_ENTRIES + 200; i += 1) {
      await cacheSet(`k${i}`, { i }, 60_000);
    }

    let survivors = 0;
    for (let i = 0; i < MAX_ENTRIES + 200; i += 1) {
      if (await cacheGet(`k${i}`)) survivors += 1;
    }

    expect(survivors).toBeLessThanOrEqual(MAX_ENTRIES);
    expect(await cacheGet(`k${MAX_ENTRIES + 199}`)).not.toBeNull();  // newest kept
    expect(await cacheGet('k0')).toBeNull();                         // oldest dropped
  });

  it('refreshes position on re-insert so a hot key is not evicted', async () => {
    for (let i = 0; i < MAX_ENTRIES; i += 1) {
      await cacheSet(`k${i}`, { i }, 60_000);
    }

    await cacheSet('k0', { i: 0, hot: true }, 60_000);

    for (let i = MAX_ENTRIES; i < MAX_ENTRIES + 100; i += 1) {
      await cacheSet(`k${i}`, { i }, 60_000);
    }

    expect(await cacheGet('k0')).toEqual({ i: 0, hot: true });
    expect(await cacheGet('k1')).toBeNull();  // its untouched neighbour went
  });

  it('empties the store on close', async () => {
    await cacheSet('a', { v: 1 }, 60_000);
    await cacheClose();
    expect(await cacheGet('a')).toBeNull();
  });
});
