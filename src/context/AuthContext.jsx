import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, refreshAuthToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('ivy_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('ivy_access_token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('ivy_refresh_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setUser(data.user);

      localStorage.setItem('ivy_access_token', data.access_token);
      localStorage.setItem('ivy_refresh_token', data.refresh_token);
      localStorage.setItem('ivy_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('ivy_access_token');
    localStorage.removeItem('ivy_refresh_token');
    localStorage.removeItem('ivy_user');
  };

  const refreshSession = async () => {
    if (!refreshToken) return false;
    try {
      const data = await refreshAuthToken(refreshToken);
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setUser(data.user);
      localStorage.setItem('ivy_access_token', data.access_token);
      localStorage.setItem('ivy_refresh_token', data.refresh_token);
      localStorage.setItem('ivy_user', JSON.stringify(data.user));
      return true;
    } catch (err) {
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        loading,
        login,
        logout,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
