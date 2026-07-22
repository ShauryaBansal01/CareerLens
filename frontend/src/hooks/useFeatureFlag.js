import { useState, useEffect } from 'react';
import api from '../services/api';

const flagCache = new Map();

export function useFeatureFlag(flagName) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const cached = flagCache.get(flagName);
      if (cached !== undefined) {
        if (!cancelled) {
          setEnabled(cached);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await api.get(`/admin/feature-flags/${flagName}`);
        const value = res.data?.enabled ?? false;
        flagCache.set(flagName, value);
        if (!cancelled) {
          setEnabled(value);
        }
      } catch {
        if (!cancelled) setEnabled(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    check();
    return () => { cancelled = true; };
  }, [flagName]);

  return { enabled, loading };
}
