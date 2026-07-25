import axios from 'axios';
import { getStoredUser, storeUser, clearSession } from './tokenStore';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * The single HTTP client for the app. Every request must go through this
 * instance — interceptors registered on the global `axios` default do NOT
 * apply to instances, so a page that imports raw `axios` silently opts out of
 * both auth-header injection and 401 refresh.
 */
const api = axios.create({ baseURL: API_URL });

/**
 * Bare client for the refresh call itself. Using `api` here would re-enter the
 * response interceptor on failure and recurse.
 */
const refreshClient = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const user = getStoredUser();
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// ── 401 handling: refresh once, queue everything else behind it ────────────
let refreshing = false;
let queue = [];

function flushQueue(error, token = null) {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  queue = [];
}

async function refreshAccessToken() {
  const current = getStoredUser();
  if (!current?.refreshToken || !current?.refreshFamily) return null;

  const { data } = await refreshClient.post('/auth/refresh-token', {
    refreshToken: current.refreshToken,
    refreshFamily: current.refreshFamily,
  });

  if (!data?.token) return null;
  storeUser({ ...current, ...data });
  return data.token;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // 403 means authenticated-but-not-permitted; refreshing the token would
    // change nothing, so don't burn a rotation on it.
    if (status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

    const url = original.url || '';
    if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh-token')) {
      return Promise.reject(error);
    }

    if (refreshing) {
      // Wait for the in-flight refresh, then replay with the new token.
      return new Promise((resolve, reject) => queue.push({ resolve, reject }))
        .then((token) => {
          original._retry = true;
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
    }

    original._retry = true;
    refreshing = true;

    try {
      const token = await refreshAccessToken();
      if (!token) throw error;

      flushQueue(null, token);
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch (refreshError) {
      flushQueue(refreshError);
      clearSession();
      return Promise.reject(refreshError);
    } finally {
      refreshing = false;
    }
  }
);

export default api;
