const STORAGE_KEY = 'user';

/** Broadcast so any listener (AuthContext, route guards) can react to a forced logout. */
export const LOGOUT_EVENT = 'cl:logout';

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function storeUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function clearSession() {
  storeUser(null);
  window.dispatchEvent(new CustomEvent(LOGOUT_EVENT));
}
