import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = authService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    // If current user is a guest, save their ID for cart migration
    if (user?.isGuest && user?.id) {
      localStorage.setItem('cw_prev_guest_id', user.id);
    }
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  };

  const guestLogin = async () => {
    const data = await authService.guestLogin();
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    // If current user is a guest, save their ID for cart migration
    if (user?.isGuest && user?.id) {
      localStorage.setItem('cw_prev_guest_id', user.id);
    }
    const data = await authService.register(userData);
    // Only set user if token was returned (whitelisted emails auto-login)
    if (data.token) {
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    // Explicit logout — don't migrate cart
    localStorage.removeItem('cw_prev_guest_id');
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    guestLogin,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isGuest: user?.isGuest || false,
    emailVerified: user?.emailVerified || false
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
