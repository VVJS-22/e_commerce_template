import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirects authenticated (non-guest) users away from auth pages (login, register, etc.)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isGuest, loading } = useAuth();

  if (loading) return null;

  // Allow guest users to access auth pages (so they can register/login)
  if (isAuthenticated && !isGuest) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;
