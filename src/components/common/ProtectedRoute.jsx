import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Wrap a route element to require authentication, optionally restricted
 * to a set of user_type values, and to force the consent screen first.
 *
 * <ProtectedRoute allowedTypes={['client']}><Dashboard /></ProtectedRoute>
 */
const ProtectedRoute = ({ children, allowedTypes }) => {
  const { user, loading, isAuthenticated, consentGiven } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!consentGiven) {
    return <Navigate to="/consent" replace />;
  }

  if (allowedTypes && !allowedTypes.includes(user?.user_type)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
