import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { CampusAiLogo } from '../components/CampusAiLogo';
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  animate,
} from 'framer-motion';
import {
  Sparkles,
  Zap,
  Brain,
  Award,
  Code2,
  TrendingUp,
  Users,
  BookOpen,
  Mic,
  Shield,
  Globe,
  Layers,
  ArrowRight,
  Sun,
  Moon,
  Check,
  ChevronDown,
  Star,
  Play,
  Bot,
  FileText,
  UserCheck,
BarChart3,
  Crown,
  Flame,
  Target,
  Clock,
  Trophy,
  Quote,
  Menu,
  X,
} from 'lucide-react';

// ════════════════════════════════════════════════════════════
//  Shared motion variants
// ════════════════════════════════════════════════════════════
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

// ════════════════════════════════════════════════════════════
//  Reusable section header
// ════════════════════════════════════════════════════════════
function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      className="text-center max-w-2xl mx-auto mb-16"
    >
      <motion.span
        variants={fadeUp}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border border-brand-primary/20 bg-brand-primary/5 text-brand-primary"
      >
        <Sparkles className="w-3.5 h-3.5" />
        {eyebrow}
      </motion.span>
      <motion.h2
        variants={fadeUp}
        className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight text-foreground"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
//  Animated counter
// ════════════════════════════════════════════════════════════
function Counter({ to, suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref} className="animate-count-shimmer">
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// ════════════════════════════════════════════════════════════
//  Floating glassmorphism Navbar
// ════════════════════════════════════════════════════════════
function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Product', href: '#product' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 inset-x-0 z-50 px-4 pt-4 sm:px-6"
    >
      <nav
        className={`premium-nav max-w-6xl mx-auto rounded-full px-4 sm:px-6 h-16 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'shadow-lg' : ''
        }`}
      >
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2.5 select-none">
          <CampusAiLogo className="h-8 w-8" aria-label="CampusAI" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Campus<span className="brand-gradient-text">AI</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-brand-primary/10 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full border border-border/50 hover:bg-brand-primary/10 transition-colors text-muted-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <Button
              onClick={() => navigate('/dashboard')}
              className="rounded-full hidden sm:inline-flex"
            >
              Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="rounded-full hidden sm:inline-flex"
              >
                Sign in
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="rounded-full bg-brand-gradient text-white hidden sm:inline-flex"
              >
                Get Started
              </Button>
            </>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2.5 rounded-full border border-border/50 text-muted-foreground"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-nav lg:hidden max-w-6xl mx-auto mt-2 rounded-3xl p-4 flex flex-col gap-1"
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-brand-primary/10 transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="flex-1 rounded-full"
              >
                Sign in
              </Button>
              <Button onClick={() => navigate('/register')} className="flex-1 rounded-full">
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// ════════════════════════════════════════════════════════════
//  Interactive Dashboard Preview (hero mock)
// ════════════════════════════════════════════════════════════
function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('Overview');
  const progressRef = useRef(null);
  const progressInView = useInView(progressRef, { once: true, amount: 0.4 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
      className="relative mt-16"
    >
      {/* Glow behind */}
      <div className="absolute -inset-8 bg-gradient-to-br from-brand-primary/20 via-brand-accent-cyan/10 to-transparent rounded-[40px] blur-2xl" />

      {/* Browser frame */}
      <div className="premium-nav relative rounded-3xl overflow-hidden shadow-2xl">
        {/* Window bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border/40">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
          <div className="ml-4 flex-1 max-w-xs h-6 rounded-md bg-brand-primary/5 border border-border/40 flex items-center px-3 text-xs text-muted-foreground">
            campusai.app/dashboard
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-12 gap-4 p-4 sm:p-6 bg-background/30">
          {/* Sidebar (hidden on small) */}
          <div className="hidden md:flex col-span-3 flex-col gap-2">
            {['Overview', 'Lectures', 'Quizzes', 'Rankings', 'Coding', 'Certificates'].map(
              (item, i) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                      : 'text-muted-foreground hover:bg-brand-primary/10'
                  }`}
                >
                  {[Layers, BookOpen, Award, Trophy, Code2, Shield][i] && (
                    <span className="opacity-80">
                      {React.createElement(
                        [Layers, BookOpen, Award, Trophy, Code2, Shield][i],
                        { className: 'w-4 h-4' }
                      )}
                    </span>
                  )}
                  {item}
                </button>
              )
            )}
          </div>

          {/* Main content */}
          <div className="col-span-12 md:col-span-9 flex flex-col gap-4">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Good morning, Alex</p>
                <p className="text-lg font-bold text-foreground">
                  {activeTab === 'Overview' ? 'Your Learning Dashboard' : activeTab}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-full bg-amber-400/15 text-amber-500 text-xs font-semibold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> 12 day streak
                </div>
                <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold">
                  <Crown className="w-3.5 h-3.5" /> Top 5%
                </div>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Courses', value: '5', icon: BookOpen, color: '#0A6BFF' },
                { label: 'Quiz Score', value: '92%', icon: Target, color: '#39C1FF' },
                { label: 'Hours', value: '48', icon: Clock, color: '#F59E0B' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: { delay: 0.7 + i * 0.15 },
                  }}
                  className="glass-card rounded-2xl p-3 sm:p-4"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                    style={{ backgroundColor: `${s.color}1a`, color: s.color }}
                  >
                    <s.icon className="w-4 h-4" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Progress chart */}
            <div ref={progressRef} className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-brand-primary" /> Weekly Activity
                </p>
                <span className="text-xs text-muted-foreground">+18% this week</span>
              </div>
              <div className="flex items-end gap-1.5 h-24">
                {[45, 70, 55, 85, 62, 95, 78].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={progressInView ? { height: `${h}%` } : {}}
                    transition={{ duration: 0.8, delay: 0.9 + i * 0.1, ease: 'easeOut' }}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-brand-primary to-brand-accent-cyan"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating illustration cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="absolute -left-4 sm:-left-8 top-24 glass-card rounded-2xl p-3 flex items-center gap-3 animate-float"
      >
        <div className="w-9 h-9 rounded-xl bg-green-500/15 text-green-600 flex items-center justify-center">
          <Check className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Quiz completed</p>
          <p className="text-xs text-muted-foreground">Scored 92% — Great job!</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7 }}
        className="absolute -right-4 sm:-right-8 bottom-24 glass-card rounded-2xl p-3 flex items-center gap-3 animate-float-slow"
      >
        <div className="w-9 h-9 rounded-xl bg-brand-primary/15 text-brand-primary flex items-center justify-center">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">AI Tip</p>
          <p className="text-xs text-muted-foreground">Review Linear Algebra next</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
//  Hero Section
// ════════════════════════════════════════════════════════════
function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-16"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-soft via-background to-background" />
        <div className="premium-grid absolute inset-0" />
        <div className="aurora-blob absolute -top-24 -left-24 w-[500px] h-[500px] bg-brand-primary/25" />
        <div className="aurora-blob absolute top-20 right-0 w-[400px] h-[400px] bg-brand-accent-cyan/25" />
        <div className="aurora-blob absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-brand-accent-warm/15" />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="max-w-6xl mx-auto px-4 sm:px-6 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-primary/20 bg-white/60 dark:bg-white/5 backdrop-blur-sm text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4 text-brand-primary" />
          <span className="text-foreground">The AI-powered classroom for modern students</span>
          <span className="hidden sm:inline text-brand-primary font-semibold">v2.0</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-foreground"
        >
          <motion.span variants={fadeUp} className="block">
            Learn smarter with
          </motion.span>
          <motion.span variants={fadeUp} className="block brand-gradient-text">
            your AI classroom
          </motion.span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Record lectures, auto-generate notes, ace adaptive quizzes, and track your growth —
          all in one beautifully simple platform built for students and teachers.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            onClick={() => navigate(user ? '/dashboard' : '/register')}
            className="rounded-full px-8 h-14 text-base bg-brand-gradient text-white shadow-xl shadow-brand-primary/30 hover:shadow-brand-primary/40 transition-shadow group"
          >
            {user ? 'Open Dashboard' : 'Start Learning Free'}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => (window.location.href = '#product')}
            className="rounded-full px-8 h-14 text-base border-border/50 bg-white/50 dark:bg-white/5 backdrop-blur-sm"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            See how it works
          </Button>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-2"
        >
          <span className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </span>
          Loved by 10,000+ students & teachers
        </motion.p>

        {/* Dashboard preview */}
        <DashboardPreview />
      </motion.div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
//  Animated Stats
// ════════════════════════════════════════════════════════════
function Stats() {
  const stats = [
    { to: 10000, suffix: '+', label: 'Active students', icon: Users },
    { to: 500, suffix: '+', label: 'Lectures processed', icon: Mic },
    { to: 95, suffix: '%', label: 'Accuracy rate', icon: TrendingUp },
    { to: 4.9, suffix: '★', decimals: 1, label: 'Average rating', icon: Award },
  ];

  return (
    <section className="py-16 sm:py-20 border-y border-border/40 bg-background/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="text-center group cursor-default"
            >
              <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-brand-gradient text-white flex items-center justify-center shadow-lg shadow-brand-primary/25 group-hover:scale-110 transition-transform">
                <s.icon className="w-6 h-6" />
              </div>
              <p className="text-4xl sm:text-5xl font-bold text-foreground">
                <Counter to={s.to} suffix={s.suffix} decimals={s.decimals || 0} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
//  Bento-Grid Features
// ════════════════════════════════════════════════════════════
function Features() {
  const features = [
    {
      icon: FileText,
      title: 'AI Notes, instantly',
      desc: 'Transform recorded lectures into structured, revision-ready notes with AI in seconds.',
      color: '#0A6BFF',
      span: 'md:col-span-2',
      visual: 'wide',
    },
    {
      icon: Bot,
      title: 'Always-on AI Tutor',
      desc: 'Ask anything, anytime. Get instant, personalized study help.',
      color: '#39C1FF',
      span: 'md:col-span-1',
      visual: 'tall',
    },
    {
      icon: Target,
      title: 'Adaptive Quizzes',
      desc: 'Quizzes that evolve with your weak spots so you master every topic.',
      color: '#F59E0B',
      span: 'md:col-span-1',
      visual: 'tall',
    },
    {
      icon: TrendingUp,
      title: 'Smart Analytics',
      desc: 'Track streaks, scores, and growth with beautiful visualizations.',
      color: '#5F9FDD',
      span: 'md:col-span-1',
      visual: 'tall',
    },
    {
      icon: Shield,
      title: 'Verified Certificates',
      desc: 'Earn QR-verified certificates you can share with confidence.',
      color: '#0E4E93',
      span: 'md:col-span-2',
      visual: 'wide',
    },
  ];

  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Features"
          title="Everything you need to excel"
          subtitle="A complete toolkit that turns every lecture into a chance to learn smarter."
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-fr"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`bento-gradient-border glass-card rounded-3xl p-8 group relative overflow-hidden ${f.span}`}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
            >
              {/* hover glow */}
              <div
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle, ${f.color}22, transparent 70%)` }}
              />
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3"
                  style={{ backgroundColor: `${f.color}1a`, color: f.color }}
                >
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: f.color }}>
                  Learn more <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
//  Interactive Product Preview (second showcase)
// ════════════════════════════════════════════════════════════
function ProductShowcase() {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: Mic, title: 'Record', color: '#0A6BFF', desc: 'Capture full lectures with crystal-clear audio.' },
    { icon: Brain, title: 'Analyze', color: '#39C1FF', desc: 'AI transcribes and identifies key concepts.' },
    { icon: FileText, title: 'Generate', color: '#5F9FDD', desc: 'Structured notes, summaries, and quizzes appear automatically.' },
  ];

  return (
    <section className="py-24 sm:py-32 bg-background/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: interactive steps */}
          <div>
            <SectionHeader
              eyebrow="Product"
              title="From lecture to learning in minutes"
              subtitle="Three steps. Zero friction. More time for what matters."
            />
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="space-y-4"
            >
              {steps.map((s, i) => (
                <motion.button
                  key={i}
                  variants={fadeUp}
                  onClick={() => setStep(i)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all ${
                    step === i
                      ? 'border-brand-primary/40 bg-white/70 dark:bg-white/5 shadow-lg'
                      : 'border-border/40 hover:border-brand-primary/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${s.color}1a`, color: s.color }}
                    >
                      <s.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        <span className="text-brand-primary mr-2">0{i + 1}.</span>
                        {s.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Right: animated visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-gradient-to-br from-brand-primary/15 to-brand-accent-cyan/10 rounded-[36px] blur-2xl" />
            <div className="glass-card rounded-3xl p-6 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-4"
                >
                  {/* Mock transcript */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center text-red-500">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2.5 bg-brand-primary/20 rounded-full w-3/4" />
                      <div className="h-2.5 bg-brand-primary/10 rounded-full w-1/2 mt-2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[100, 90, 80, 95].map((w, i) => (
                      <div key={i} className="h-2.5 bg-brand-primary/10 rounded-full" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold">
                      Key Concepts
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-brand-accent-cyan/10 text-brand-accent-cyan text-xs font-semibold">
                      Summary Ready
                    </div>
                  </div>
<div className="h-28 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent-cyan flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white/80" />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
//  How It Works
// ════════════════════════════════════════════════════════════
function HowItWorks() {
  const steps = [
    { icon: UserCheck, title: 'Create your account', desc: 'Sign up in under a minute — free forever for students.' },
    { icon: Mic, title: 'Record your lecture', desc: 'Hit record in class or upload an existing audio file.' },
    { icon: Sparkles, title: 'Let AI do the rest', desc: 'Get notes, quizzes, and insights while you relax.' },
    { icon: Award, title: 'Watch yourself grow', desc: 'Earn badges, certificates, and climb the rankings.' },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="How it works"
          title="Start learning in 4 simple steps"
          subtitle="No setup, no technical skills, no stress. Just better learning."
        />

        <div className="relative">
          {/* connecting line */}
          <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent" />
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="relative text-center">
                <div
                  className="relative mx-auto mb-6 w-16 h-16 rounded-2xl bg-brand-gradient text-white flex items-center justify-center shadow-xl shadow-brand-primary/25"
                >
                  <s.icon className="w-7 h-7" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
//  Testimonials
// ════════════════════════════════════════════════════════════
function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Computer Science, Year 2',
      quote:
        'CampusAI completely changed how I study. The AI notes are so good I actually enjoy revising now. My grades jumped from a C to an A- in one semester!',
      avatar: 'https://i.pravatar.cc/100?img=47',
      initials: 'SC',
    },
    {
      name: 'Marcus Johnson',
      role: 'High School Teacher',
      quote:
        'I save hours every week. The attendance tracking and analytics let me focus on teaching instead of admin. My students are more engaged than ever.',
      avatar: 'https://i.pravatar.cc/100?img=12',
      initials: 'MJ',
    },
    {
      name: 'Priya Patel',
      role: 'Medical Student',
      quote:
        'The adaptive quizzes are a game-changer. It always knows what I need to review. This is the Duolingo of university — but better.',
      avatar: 'https://i.pravatar.cc/100?img=32',
      initials: 'PP',
    },
  ];

  return (
    <section id="testimonials" className="py-24 sm:py-32 bg-gradient-to-b from-background to-brand-soft/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Testimonials"
          title="Loved by students & teachers"
          subtitle="Join thousands who transformed their learning experience."
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="glass-card rounded-3xl p-7 flex flex-col"
            >
              <Quote className="w-8 h-8 text-brand-primary/30 mb-4" />
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed flex-1">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={t.avatar} alt={t.name} />
                  <AvatarFallback className="bg-brand-primary/10 text-brand-primary">
                    {t.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
//  FAQ
// ════════════════════════════════════════════════════════════
function FAQ() {
  const [open, setOpen] = useState(0);
  const faqs = [
    {
      q: 'Is CampusAI free for students?',
      a: 'Yes! The core experience — recording lectures, AI notes, and quizzes — is completely free for students. We offer premium plans for institutions and advanced analytics.',
    },
    {
      q: 'How accurate is the AI transcription?',
      a: 'Our AI achieves over 95% accuracy on clear audio. It handles multiple speakers, technical terminology, and even accents, with live correction capabilities.',
    },
    {
      q: 'Which subjects and languages are supported?',
      a: 'CampusAI works across all subjects — from STEM to humanities. It supports 30+ languages for notes and study materials.',
    },
    {
      q: 'Can teachers use CampusAI too?',
      a: 'Absolutely. Teachers get attendance tracking, lecture analytics, class insights, and the ability to create and distribute quizzes to their students.',
    },
    {
      q: 'Is my data private and secure?',
      a: 'Yes. Your lecture recordings and notes are encrypted at rest and in transit. We never sell your data, and you can export or delete everything at any time.',
    },
  ];

  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="FAQ"
          title="Questions, answered"
          subtitle="Everything you need to know about CampusAI."
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="space-y-3"
        >
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="glass-card rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-semibold text-foreground">{f.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-brand-primary shrink-0 transition-transform ${
                    open === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="px-5 pb-5 text-muted-foreground leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
//  CTA + Footer
// ════════════════════════════════════════════════════════════
function CTASection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <section className="py-24 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto relative overflow-hidden rounded-[36px] bg-gradient-to-br from-brand-primary via-brand-accent-cyan to-brand-accent-warm p-[1px]"
      >
        <div className="rounded-[35px] bg-background/95 backdrop-blur-xl p-10 sm:p-16 text-center relative">
          {/* decorative orbs */}
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-brand-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-brand-accent-warm/20 blur-3xl" />

          <div className="relative">
            <div className="mx-auto mb-8 w-16 h-16 rounded-2xl bg-brand-gradient text-white flex items-center justify-center shadow-xl shadow-brand-primary/30">
              <Brain className="w-8 h-8" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Ready to learn smarter?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Join the future of education. Free to start, takes 60 seconds, and your first AI-
              powered lecture is waiting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate(user ? '/dashboard' : '/register')}
                className="rounded-full px-10 h-14 text-base bg-brand-gradient text-white shadow-xl shadow-brand-primary/30 group"
              >
                {user ? 'Open Dashboard' : 'Get Started Free'}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="rounded-full px-10 h-14 text-base border-border/50"
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  const navigate = useNavigate();
  const columns = [
    { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Changelog'] },
    { title: 'Company', links: ['About', 'Careers', 'Blog', 'Press'] },
    { title: 'Resources', links: ['Help Center', 'Community', 'Documentation', 'Status'] },
    { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
  ];

  return (
    <footer className="py-16 border-t border-border/40 bg-background/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <a href="#top" className="flex items-center gap-2.5 mb-4">
              <CampusAiLogo className="h-8 w-8" />
              <span className="text-lg font-bold text-foreground">
                Campus<span className="brand-gradient-text">AI</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              The AI-powered classroom platform helping students and teachers learn smarter together.
            </p>
          </div>
          {columns.map((col, i) => (
            <div key={i}>
              <p className="font-semibold text-foreground mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href="#top" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2026 CampusAI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Sign in
            </Button>
            <Button size="sm" onClick={() => navigate('/register')} className="rounded-full">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ════════════════════════════════════════════════════════════
//  Main Landing Page
// ════════════════════════════════════════════════════════════
export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden" data-testid="landing-page">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <ProductShowcase />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
