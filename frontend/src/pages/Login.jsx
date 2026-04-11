import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setAuthToken } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { CampusAiLogo } from '../components/CampusAiLogo';

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

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('[LOGIN FORM] Attempting login with email:', email);

      const response = await axios.post(
        `${API}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      setAuthToken(response.data.token);
      console.log('[LOGIN FORM] Login successful:', response.data);
      setUser(response.data.user);
      toast.success('Login successful!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('[LOGIN FORM] Login error:', error.message, error.response?.status, error.response?.data);
      const errorMsg = error.response?.data?.detail || error.message || 'Login failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);

    try {
      console.log('[LOGIN FORM] Demo login requested');
      const response = await axios.post(
        `${API}/auth/dev-session`,
        {},
        { withCredentials: true }
      );
      
      setAuthToken(response.data.token);
      console.log('[LOGIN FORM] Demo login successful:', response.data);
      setUser(response.data.user);
      toast.success('Demo login successful!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('[LOGIN FORM] Demo login error:', error.message);
      setError('Demo login failed. Please try again.');
      toast.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <CampusAiLogo className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">CampusAi</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Enter your email to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    data-testid="email-input"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full"
                size="lg"
                data-testid="login-button"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Sign In
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Demo Login Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full"
                size="lg"
                data-testid="demo-login-button"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Demo Login
              </Button>
            </form>

            {/* Info Text */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              Demo login credentials are auto-filled. Use the button above for instant access.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Don't have an account?{' '}
          <button
            type="button"
            className="text-primary hover:underline font-medium"
            onClick={() => navigate('/register')}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
