import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API, { debugLog, debugError } from '../lib/api';

const AuthContext = createContext(undefined);

// Configure axios to always send credentials
axios.defaults.withCredentials = true;

export function setAuthToken(token) {
  if (!token) return;
  localStorage.setItem('auth_token', token);
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAuthToken() {
  localStorage.removeItem('auth_token');
  delete axios.defaults.headers.common.Authorization;
}

/**
 * AuthProvider — handles email/password authentication via backend API.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          setAuthToken(token);
        }
        const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        // Not authenticated
        clearAuthToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
      const { user: userData, token } = response.data;
      setAuthToken(token);
      setUser(userData);
      return userData;
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      debugError('LOGIN', 'Login error:', message);
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    try {
      const response = await axios.post(`${API}/auth/register`, { name, email, password, role }, { withCredentials: true });
      const { user: userData, token } = response.data;
      setAuthToken(token);
      setUser(userData);
      return userData;
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      debugError('REGISTER', 'Register error:', message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      debugError('LOGOUT', 'Logout error:', error);
    } finally {
      clearAuthToken();
      setUser(null);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserRole = useCallback(async (newRole) => {
    try {
      const response = await axios.put(`${API}/auth/role`, { role: newRole }, { withCredentials: true });
      setUser(response.data);
      return response.data;
    } catch (error) {
      debugError('ROLE', 'Role update error:', error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, checkAuth, updateUserRole, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

