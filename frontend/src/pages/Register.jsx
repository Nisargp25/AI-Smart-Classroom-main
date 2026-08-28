import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AuthLayout } from '../components/AuthLayout';
import { ArrowRight, GraduationCap, BookOpen, Loader2, Mail, Lock, User } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { user, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already signed in, redirect
  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, selectedRole);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      page="register"
      title="Create your account"
      subtitle="Join CampusAI and start learning smarter."
      altAction={{
        text: 'Already have an account?',
        linkText: 'Sign in',
        onClick: () => navigate('/login'),
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex gap-1.5 mb-2">
          <div className="h-1 flex-1 rounded-full bg-primary" />
          <div className="h-1 flex-1 rounded-full bg-muted" />
          <div className="h-1 flex-1 rounded-full bg-muted" />
        </div>

        {/* Role Selection */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/80">
            I want to join as
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              disabled={loading}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                selectedRole === 'student'
                  ? 'border-primary bg-primary/5 text-accentText'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <div className="text-left">
                <p className="text-sm font-medium">Student</p>
                <p className="text-xs opacity-70">Learn & take quizzes</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('teacher')}
              disabled={loading}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                selectedRole === 'teacher'
                  ? 'border-primary bg-primary/5 text-accentText'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <div className="text-left">
                <p className="text-sm font-medium">Teacher</p>
                <p className="text-xs opacity-70">Create lectures & quizzes</p>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 h-11 rounded-xl"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11 rounded-xl"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-11 rounded-xl"
              minLength={6}
              required
              disabled={loading}
            />
          </div>
        </div>

<Button
          type="submit"
          disabled={loading}
          variant="gradient"
          className="h-12 w-full shadow-lg shadow-brand-primary/25"
          size="lg"
          data-testid="register-button"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {selectedRole === 'teacher' ? 'Create Teacher Account' : 'Create Student Account'}
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}

