import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { loginRequest, fetchCurrentUser } from '../api/auth';

const AuthContext = createContext(null);

function loadToken() {
  return localStorage.getItem('jinjin_token') || null;
}

function saveToken(token) {
  if (token) {
    localStorage.setItem('jinjin_token', token);
  } else {
    localStorage.removeItem('jinjin_token');
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(loadToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCurrentUser(token);
        setUser(data.user);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setUser(null);
        saveToken(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const login = useCallback(async (username, password) => {
    setError(null);
    const { token: newToken, user: userInfo } = await loginRequest(username, password);
    saveToken(newToken);
    setToken(newToken);
    setUser(userInfo);
    return userInfo;
  }, []);

  const logout = useCallback(() => {
    saveToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    error,
    login,
    logout,
    setError
  }), [token, user, loading, error, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있어요.');
  return context;
}

export function useRequireRole(roles = []) {
  const { user } = useAuth();
  if (!user) return false;
  if (roles.length === 0) return true;
  return roles.includes(user.role);
}
