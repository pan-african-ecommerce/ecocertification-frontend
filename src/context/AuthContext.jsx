import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import API from '../api/endpoints';
import { errorMessage } from '../api/axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    try {
      const r = await API.me();
      setUser(r.data);
      return r.data;
    } catch (e) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('access_token')) fetchUser();
    else setLoading(false);
  }, [fetchUser]);

  const login = async (username, password) => {
    try {
      const r = await API.login({ username, password });
      localStorage.setItem('access_token', r.data.access);
      localStorage.setItem('refresh_token', r.data.refresh);
      await fetchUser();
      navigate('/dashboard');
      return { success: true };
    } catch (e) {
      return { success: false, error: errorMessage(e, 'Login failed') };
    }
  };

  const register = async (data) => {
    try {
      await API.register(data);
      toast.success('Registration successful. Please sign in.');
      return { success: true };
    } catch (e) {
      return { success: false, errors: e.response?.data || { error: 'Registration failed' } };
    }
  };

  const giveConsent = async () => {
    try {
      await API.giveConsent();
      await fetchUser();
      navigate('/dashboard');
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  };

  const logout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    try { await API.logout(refresh); } catch (e) { /* ignore */ }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    navigate('/login');
  };

  const t = user?.user_type;
  const value = {
    user, loading, login, register, logout, fetchUser, giveConsent,
    isAuthenticated: !!user,
    consentGiven: !!user?.consent_given_at,
    isClient: t === 'client',
    isInspector: t === 'inspector',
    isVerifier: t === 'verifier',
    isManager: t === 'manager' || t === 'admin',
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
