import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(undefined);

const API = (() => {
  const configured = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '');
  const host = window.location.hostname;
  const isRemoteHost = host !== 'localhost' && host !== '127.0.0.1';
  const isDevTunnelHost = /-4000\..*\.devtunnels\.ms$/i.test(host);

  if (isDevTunnelHost) {
    return `${window.location.origin}/api`;
  }

  if (isRemoteHost && (!configured || configured.includes('localhost') || configured.includes('127.0.0.1'))) {
    return `${window.location.protocol}//${window.location.hostname}:8000/api`;
  }

  return `${configured || window.location.origin}/api`;
})();

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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('[AUTH] Checking authentication with /auth/me endpoint');
      const response = await axios.get(`${API}/auth/me`, {
        withCredentials: true
      });
      console.log('[AUTH] Auth check successful, user:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('[AUTH] Auth check failed:', error.message, error.response?.status);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    const hostname = window.location.hostname;
    console.log('[LOGIN] Starting login flow on host:', hostname);
    
    // Localhost cannot always complete external auth + secure cookie flow reliably.
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      try {
        console.log('[LOGIN] Localhost detected, calling dev-session endpoint:', `${API}/auth/dev-session`);
        const response = await axios.post(`${API}/auth/dev-session`, {}, { withCredentials: true });
        console.log('[LOGIN] Dev session response received:', response.data);
        setUser(response.data.user);
        console.log('[LOGIN] Redirecting to dashboard...');
        window.location.href = '/dashboard';
        return;
      } catch (error) {
        console.error('[LOGIN] Local dev login error:', error.message, error.response?.status, error.response?.data);
      }
    }

    // Use configured OAuth provider URL for non-localhost login.
    console.log('[LOGIN] Non-localhost or fallback, redirecting to configured OAuth provider');
    const redirectUrl = window.location.origin + '/dashboard';
    const oauthUrl = process.env.REACT_APP_OAUTH_URL;
    if (!oauthUrl) {
      console.error('[LOGIN] Missing REACT_APP_OAUTH_URL for external OAuth flow');
      return;
    }
    window.location.href = `${oauthUrl}?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthToken();
      setUser(null);
    }
  };

  const updateUserRole = async (role) => {
    try {
      const response = await axios.put(`${API}/auth/role`, { role }, { withCredentials: true });
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Role update error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, checkAuth, updateUserRole }}>
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
