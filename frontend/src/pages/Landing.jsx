import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Mic,
  Brain,
  Award,
  Code2,
  TrendingUp,
  Users,
  BookOpen,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Shield,
  Globe,
  Layers,
  LogOut,
  LayoutDashboard,
  Search,
  Bell,
  FileText,
  UserCheck,
  Bot,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { CampusAiLogo } from '../components/CampusAiLogo';
import { AnimatedTitle, CampusAiBrandTitle } from '../components/AnimatedTitle';

// ─── Intersection Observer Hook ───
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, revealed];
}

// ─── Animated Section Wrapper ───
function RevealSection({ children, className = '', delay = 0 }) {
  const [ref, revealed] = useReveal();
  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}

// ─── Background Layer ───
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F7E6CA] via-[#fdf6e8] to-[#F0DFC0] dark:from-[#1c1c1c] dark:via-[#242424] dark:to-[#171717] animate-gradient-mesh" />

      {/* Indigo & sky orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#4F46E5]/15 to-[#0EA5E9]/10 blur-[80px] animate-float-orb" />
      <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#0EA5E9]/15 to-[#4F46E5]/10 blur-[80px] animate-float-orb-delayed" />
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#E8D59E]/15 to-[#D9BBB0]/10 blur-[100px] animate-float-orb-slow" />

      {/* Warm amber orb */}
      <div className="absolute top-[50%] left-[-8%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-[#E8D59E]/20 to-[#D9BBB0]/10 blur-[70px] animate-float-orb-delayed" />

      {/* Expanding pulse rings */}
      <div className="absolute top-[20%] left-[50%] w-32 h-32 rounded-full border border-[#4F46E5]/20 animate-pulse-ring" />
      <div className="absolute top-[20%] left-[50%] w-32 h-32 rounded-full border border-[#0EA5E9]/15 animate-pulse-ring-delayed" />
      <div className="absolute bottom-[30%] right-[20%] w-24 h-24 rounded-full border border-[#E8D59E]/15 animate-pulse-ring" style={{ animationDelay: '-1s' }} />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-1.5 h-1.5 rounded-full bg-[#4F46E5]/30 ${
            i % 3 === 0 ? 'animate-particle' : i % 3 === 1 ? 'animate-particle-delayed' : 'animate-particle-slow'
          }`}
          style={{
            left: `${5 + (i * 8) % 90}%`,
            bottom: '-5%',
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}
      {[...Array(8)].map((_, i) => (
        <div
          key={i + 12}
          className={`absolute w-1 h-1 rounded-full bg-[#E8D59E]/20 ${
            i % 2 === 0 ? 'animate-particle' : 'animate-particle-slow'
          }`}
          style={{
            left: `${3 + (i * 12) % 94}%`,
            bottom: '-5%',
            animationDelay: `${i * 1.2 + 3}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const features = [
    {
      icon: FileText,
      title: 'AI Notes',
      description: 'Transform lectures into structured, revision-ready notes automatically.',
      gradient: 'from-[#4F46E5]/20 to-[#0EA5E9]/10',
    },
    {
      icon: BookOpen,
      title: 'Lecture Summary',
      description: 'Get concise AI summaries of full lectures in minutes, not hours.',
      gradient: 'from-[#0EA5E9]/20 to-[#38BDF8]/10',
    },
    {
      icon: UserCheck,
      title: 'Attendance',
      description: 'Automated attendance tracking with instant insights and reports.',
      gradient: 'from-[#E8D59E]/20 to-[#D9BBB0]/10',
    },
    {
      icon: TrendingUp,
      title: 'Student Analytics',
      description: 'Track performance, streaks, and growth with detailed visualizations.',
      gradient: 'from-[#4F46E5]/20 to-[#38BDF8]/10',
    },
    {
      icon: Bot,
      title: 'AI Chatbot',
      description: 'Ask questions anytime. Get instant AI-powered study assistance.',
      gradient: 'from-[#0EA5E9]/20 to-[#F0DFC0]/10',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Students', icon: Users },
    { value: '500+', label: 'Lectures Processed', icon: Mic },
    { value: '95%', label: 'Accuracy Rate', icon: TrendingUp },
    { value: '4.9', label: 'User Rating', icon: Award },
  ];

  const benefits = [
    { text: 'Revise full lectures in under 10 minutes', icon: Zap },
    { text: 'Adaptive quizzes based on your weak topics', icon: Brain },
    { text: 'Digital certificates with QR verification', icon: Shield },
    { text: 'Multi-language support for notes', icon: Globe },
    { text: 'Real-time class and university rankings', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-background relative" data-testid="landing-page">
      <AnimatedBackground />

      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <CampusAiLogo className="h-6 w-6" />
              </div>
              <CampusAiBrandTitle variant="shimmer" size="text-lg" />
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-3 h-10 rounded-full bg-background/60 border border-border/50 focus-within:border-primary/40 transition-colors">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none text-sm w-32 placeholder:text-muted-foreground"
                  aria-label="Search"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="rounded-full relative" data-testid="landing-notifications">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />
              </Button>

              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" data-testid="landing-theme-toggle">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.picture} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')} data-testid="landing-signin-btn" className="rounded-full">
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/register')} data-testid="get-started-btn" className="rounded-full shadow-lg shadow-primary/20">
                    Get Started
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-accentText text-sm font-medium mb-8 backdrop-blur-sm border border-primary/10 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              AI-Powered Learning Platform
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">v2.0</Badge>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
              <span className="text-foreground">AI Classroom</span>
              <AnimatedTitle
                text="Assistant"
                variant="stagger"
                as="span"
                speed={50}
                className="text-accentText block mt-2"
              />
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-in stagger-1">
              Learn Smarter with AI — record lectures, auto-generate notes, create quizzes, track performance, and get instant AI assistance.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-fade-in stagger-2">
              <Button
                onClick={() => navigate('/register')}
                size="lg"
                className="rounded-full text-base px-10 h-13 shadow-xl shadow-primary/25 hover:shadow-primary/35 transition-shadow"
                data-testid="hero-cta-btn"
              >
                Start Learning Free
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full text-base px-10 h-13 border-border/50"
                data-testid="demo-btn"
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-border/30">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="text-center group cursor-default animate-fade-in"
                  style={{ animationDelay: `${(i + 3) * 0.1}s` }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <stat.icon className="w-4 h-4 text-accentText/60" />
                    <p className="text-3xl sm:text-4xl font-bold text-accentText group-hover:scale-105 transition-transform">
                      {stat.value}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── BENEFITS BANNER ─── */}
      <RevealSection className="py-14 border-y border-border/30 bg-background/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-5">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ─── FEATURES SECTION ─── */}
      <RevealSection className="py-24" delay={100}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-accentText mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform brings together the best tools for modern education.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="group relative overflow-hidden border-border/50 hover:border-primary/40 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                data-testid={`feature-card-${i}`}
              >
                {/* Hover gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <CardContent className="relative p-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:scale-110 flex items-center justify-center mb-6 transition-all duration-300 shadow-lg shadow-primary/5 group-hover:shadow-primary/20">
                    <feature.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full" />
              </Card>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ─── CTA SECTION ─── */}
      <RevealSection className="py-24" delay={100}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative p-12 sm:p-16 rounded-3xl bg-gradient-to-br from-[#1c1c1c] to-[#171717] dark:from-[#1c1c1c] dark:to-[#171717] overflow-hidden group">
            {/* Animated background orbs inside CTA */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-[#4F46E5]/25 to-transparent blur-[60px] group-hover:scale-150 transition-transform duration-1000" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-gradient-to-br from-[#0EA5E9]/15 to-transparent blur-[60px] group-hover:scale-150 transition-transform duration-1000" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-slate-400 mb-10 max-w-xl mx-auto text-lg">
                Join thousands of students and teachers who are already using CampusAi to enhance their classroom experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/register')}
                  size="lg"
                  className="rounded-full px-10 h-14 text-base shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-shadow"
                  data-testid="cta-btn"
                >
                  Get Started Now
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  size="lg"
                  variant="outline"
                  className="rounded-full px-10 h-14 text-base border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Create Free Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ─── FOOTER ─── */}
      <footer className="py-12 border-t border-border/30 bg-background/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CampusAiLogo className="h-5 w-5" />
              <CampusAiBrandTitle variant="shimmer" size="text-sm" />
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
              <span>© 2026 CampusAi</span>
            </div>
            
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Small Play icon inline ───
function PlayIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
