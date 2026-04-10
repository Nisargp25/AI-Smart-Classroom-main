import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
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
  CheckCircle2,
} from 'lucide-react';
import { CampusAiLogo } from '../components/CampusAiLogo';

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: Mic,
      title: 'Smart Lecture Recording',
      description: 'Record lectures with one click. AI transcribes and structures content automatically.',
    },
    {
      icon: Brain,
      title: 'AI-Powered Notes',
      description: 'Transform lectures into summaries, key points, and revision checklists instantly.',
    },
    {
      icon: Award,
      title: 'Auto Quiz Generation',
      description: 'AI creates quizzes from lecture content. Track progress and identify weak areas.',
    },
    {
      icon: Code2,
      title: 'Coding Integration',
      description: 'Link LeetCode, HackerRank & more. Get personalized problem recommendations.',
    },
    {
      icon: TrendingUp,
      title: 'Performance Analytics',
      description: 'Track scores, streaks, and rankings. Visualize growth with detailed charts.',
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Student, Teacher, and Admin dashboards tailored for each role.',
    },
  ];

  const benefits = [
    'Revise full lectures in under 10 minutes',
    'Adaptive quizzes based on your weak topics',
    'Digital certificates with QR verification',
    'Multi-language support for notes',
    'Real-time class and university rankings',
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <CampusAiLogo className="h-6 w-6" />
              </div>
              <span className="font-bold text-lg tracking-tight">CampusAi</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" data-testid="landing-theme-toggle">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button onClick={() => navigate('/login')} data-testid="get-started-btn" className="rounded-full">
                Get Started
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              AI-Powered Learning Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 animate-fade-in">
              Transform Your
              <span className="text-primary block mt-2">Classroom Experience</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-in stagger-1">
              Record lectures, auto-generate notes, create quizzes, track performance, and earn certificates—all powered by cutting-edge AI technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in stagger-2">
              <Button size="lg" onClick={() => navigate('/login')} className="rounded-full text-base px-8 h-12" data-testid="hero-cta-btn">
                Start Learning Free
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-base px-8 h-12" data-testid="demo-btn">
                Watch Demo
              </Button>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-border/50 animate-fade-in stagger-3">
              {[
                { value: '10K+', label: 'Active Students' },
                { value: '500+', label: 'Lectures Processed' },
                { value: '95%', label: 'Accuracy Rate' },
                { value: '4.9', label: 'User Rating' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 border-y border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform brings together the best tools for modern education.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="group relative overflow-hidden border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
                data-testid={`feature-card-${i}`}
              >
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:scale-110 flex items-center justify-center mb-6 transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative p-12 sm:p-16 rounded-3xl bg-slate-900 dark:bg-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-8">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-slate-400 mb-10 max-w-xl mx-auto text-lg">
                Built to help students and teachers improve outcomes through classroom analytics.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="rounded-full px-10 h-14 text-base bg-primary hover:bg-primary/90"
                data-testid="cta-btn"
              >
                Get Started Now
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CampusAiLogo className="h-5 w-5" />
              <span className="font-semibold">CampusAi</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 CampusAi. Smart Classroom Management & Learning Analytics System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
