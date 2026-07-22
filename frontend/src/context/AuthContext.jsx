import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

function storeUser(user) {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);
  const refreshing = useRef(false);
  const failedQueue = useRef([]);

  const processQueue = useCallback((error, token = null) => {
    failedQueue.current.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    failedQueue.current = [];
  }, []);

  const refreshToken = useCallback(async () => {
    const current = getStoredUser();
    if (!current?.refreshToken || !current?.refreshFamily) {
      return null;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/refresh-token`, {
        refreshToken: current.refreshToken,
        refreshFamily: current.refreshFamily,
      });

      if (res.data) {
        const updated = { ...current, ...res.data };
        storeUser(updated);
        setUser(updated);
        return res.data.token;
      }
      return null;
    } catch {
      storeUser(null);
      setUser(null);
      return null;
    }
  }, []);

  // Setup axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          const url = originalRequest.url || '';
          const isAuthEndpoint = url.includes('/auth/login') ||
            url.includes('/auth/register') ||
            url.includes('/auth/refresh-token');

          if (isAuthEndpoint) {
            return Promise.reject(error);
          }

          if (refreshing.current) {
            return new Promise((resolve, reject) => {
              failedQueue.current.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axios(originalRequest);
            });
          }

          originalRequest._retry = true;
          refreshing.current = true;

          try {
            const newToken = await refreshToken();
            if (newToken) {
              processQueue(null, newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
            processQueue(new Error('Refresh failed'));
            storeUser(null);
            setUser(null);
            window.dispatchEvent(new CustomEvent('cl:logout'));
            return Promise.reject(error);
          } catch (refreshError) {
            processQueue(refreshError);
            storeUser(null);
            setUser(null);
            window.dispatchEvent(new CustomEvent('cl:logout'));
            return Promise.reject(refreshError);
          } finally {
            refreshing.current = false;
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken, processQueue]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    if (res.data) {
      storeUser(res.data);
      setUser(res.data);
    }
    return res.data;
  };

  const sendOtp = async (email) => {
    const res = await axios.post(`${API_URL}/auth/send-otp`, { email });
    return res.data;
  };

  const register = async (name, email, password, role, otp) => {
    const res = await axios.post(`${API_URL}/auth/register`, { name, email, password, role, otp });
    if (res.data) {
      storeUser(res.data);
      setUser(res.data);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
    } catch {
      // Logout locally even if server call fails
    }
    storeUser(null);
    window.dispatchEvent(new CustomEvent('cl:logout'));
    setUser(null);
  };

  const forgotPassword = async (email) => {
    const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return res.data;
  };

  const resetPassword = async (email, otp, password) => {
    const res = await axios.post(`${API_URL}/auth/reset-password`, { email, otp, password });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, sendOtp, register, logout, forgotPassword, resetPassword, refreshToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
