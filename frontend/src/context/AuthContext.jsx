import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getStoredUser, storeUser, LOGOUT_EVENT } from '../services/tokenStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);

  // Token refresh and forced logout live in the api interceptor (so they apply
  // to every request, not just ones made from this context). React state just
  // mirrors the store — this listener keeps them in sync.
  useEffect(() => {
    const onLogout = () => setUser(null);
    const onStorage = (event) => {
      if (event.key === 'user') setUser(getStoredUser());
    };

    window.addEventListener(LOGOUT_EVENT, onLogout);
    // Keeps multiple tabs consistent: log out in one, log out in all.
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(LOGOUT_EVENT, onLogout);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const persist = useCallback((data) => {
    storeUser(data);
    setUser(data);
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return persist(res.data);
  }, [persist]);

  const sendOtp = useCallback(async (email) => {
    const res = await api.post('/auth/send-otp', { email });
    return res.data;
  }, []);

  const register = useCallback(async (name, email, password, role, otp) => {
    // `role` is intentionally not sent — the server assigns it and rejects
    // client-supplied values.
    const res = await api.post('/auth/register', { name, email, password, otp });
    return persist(res.data);
  }, [persist]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Log out locally even if the server call fails
    }
    persist(null);
  }, [persist]);

  const forgotPassword = useCallback(async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  }, []);

  const resetPassword = useCallback(async (email, otp, password) => {
    const res = await api.post('/auth/reset-password', { email, otp, password });
    return res.data;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        // Session state is read synchronously from localStorage on first
        // render, so there is no async bootstrap to wait on.
        loading: false,
        isAdmin: user?.role === 'admin',
        login,
        sendOtp,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
