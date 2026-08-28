import React from 'react';
import { motion } from 'framer-motion';
import { CampusAiLogo } from './CampusAiLogo';
import { CampusAiBrandTitle } from './AnimatedTitle';
import Mascot from './ai-dashboard/Mascot';
import {
  Sparkles,
  BrainCircuit,
  GraduationCap,
  Award,
  Flame,
  BookOpenCheck,
  BarChart3,
  ShieldCheck,
  Zap,
} from 'lucide-react';

/**
 * AuthLayout — Premium split-screen auth shell for Login / Register.
 * Left: brand panel (AI classroom illustration, floating analytics cards, slogan).
 * Right: glassmorphism form panel.
 * Matches the CampusAI landing + dashboard brand language (24px radius, brand gradient,
 * glass, bento tiles, Framer Motion, floating particles, AI icons).
 *
 * Props:
 *   page       - "login" | "register" (drives left-panel copy)
 *   children   - ReactNode (the form content)
 *   title      - string
 *   subtitle   - string
 *   altAction  - { text, linkText, onClick }
 *   showLogo   - bool
 */
export function AuthLayout({
  page = 'login',
  children,
  title,
  subtitle,
  altAction,
  showLogo = true,
}) {
  const isRegister = page === 'register';

  const sloganMark = isRegister ? 'Start learning smarter today.' : 'Welcome back to your classroom.';
  const sloganHighlight = isRegister ? 'Start learning smarter' : 'your classroom';
  const subline = isRegister
    ? 'Join students & teachers using AI-powered learning, lectures, and quizzes.'
    : 'Sign in to continue your streak, track progress, and let AI guide you to mastery.';

  const features = isRegister
    ? [
        { icon: GraduationCap, label: 'Personalized learning paths' },
        { icon: BrainCircuit, label: 'AI lecture summaries & quizzes' },
      ]
    : [
        { icon: Flame, label: 'Your 12-day streak is waiting' },
        { icon: BrainCircuit, label: 'AI insights on your progress' },
      ];

  // Floating analytics cards data
  const cards = [
    {
      Icon: Award,
      label: 'AI Score',
      value: '87',
      sub: 'Top 10% of class',
      float: 'animate-float-bob',
      className: 'top-[12%] right-[4%]',
      accent: 'from-brand-primary to-brand-accent-cyan',
    },
    {
      Icon: BarChart3,
      label: 'Attendance',
      value: '94%',
      sub: '+3% this week',
      float: 'animate-float-bob-slow',
      className: 'top-[52%] right-[12%]',
      accent: 'from-brand-accent-cyan to-brand-accent-light',
    },
    {
      Icon: BookOpenCheck,
      label: 'Lectures done',
      value: '28',
      sub: 'Keep it up!',
      float: 'animate-float-bob',
      className: 'bottom-[16%] right-[2%]',
      accent: 'from-brand-accent-light to-brand-primary',
    },
  ];

  // Render a feature bullet with a dynamic icon (capitalized component)
  const renderFeature = (f) => {
    const Icon = f.icon;
    return (
      <span
        key={f.label}
        className="inline-flex items-center gap-2 text-xs font-medium bg-white/10 border border-white/15 px-3.5 py-2 rounded-full"
      >
        <Icon className="w-4 h-4 text-[#7CAFE5]" />
        {f.label}
      </span>
    );
  };

  // Render a floating analytics card with a dynamic icon
  const renderCard = (card, i) => {
    return (
      <motion.div
        key={card.label}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
        className={`absolute ${card.className} ${card.float}`}
      >
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] px-4 py-3 flex items-center gap-3 w-44">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.accent} flex items-center justify-center text-white shadow`}>
            <card.Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{card.label}</p>
            <p className="font-display font-bold text-gray-900 leading-none">{card.value}</p>
            <p className="text-[10px] text-gray-500">{card.sub}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-[#F6Faff] dark:bg-[#081a30]">
      {/* ───────────────── LEFT: Brand panel ───────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0E4E93] via-[#1F6DB8] to-[#39C1FF] text-white p-10 xl:p-14 min-h-screen">
        {/* Premium grid overlay */}
        <div className="absolute inset-0 premium-grid opacity-40" />

        {/* Aurora blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-white/20 to-[#39C1FF]/20 blur-[80px] animate-float-orb" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-[#7CAFE5]/30 to-[#0A6BFF]/30 blur-[90px] animate-float-orb-delayed" />
        <div className="absolute top-[40%] left-[30%] w-72 h-72 rounded-full bg-[#5F9FDD]/20 blur-[70px] animate-float-orb-slow" />

        {/* Expanding pulse rings */}
        <div className="absolute top-[18%] left-[8%] w-40 h-40 rounded-full border border-white/20 animate-pulse-ring" />
        <div className="absolute bottom-[24%] right-[10%] w-28 h-28 rounded-full border border-white/15 animate-pulse-ring-delayed" />

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1.5 h-1.5 rounded-full bg-white/40 ${
              i % 3 === 0 ? 'animate-particle' : i % 3 === 1 ? 'animate-particle-delayed' : 'animate-particle-slow'
            }`}
            style={{
              left: `${4 + (i * 8) % 90}%`,
              bottom: '-5%',
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}

        {/* Logo header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
            <CampusAiLogo className="h-9 w-9" />
          </div>
          <CampusAiBrandTitle variant="shimmer" size="text-2xl" />
        </div>

        {/* Center content: slogan + illustration */}
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight"
          >
            {sloganMark}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="mt-4 max-w-md text-[#EAF4FF]/90"
          >
            {subline}
          </motion.p>

          {/* AI classroom illustration + floating analytics cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
            className="relative mt-10 max-w-md"
          >
            {/* Classroom glass card */}
            <div className="relative glass-card border-white/25 text-left rounded-[24px] p-5 dark:shadow-none">
              {/* card header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">AI Smart Classroom</p>
                    <p className="text-[11px] text-[#EAF4FF]/70">Live session</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-white/20 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> AI Active
                </span>
              </div>

              {/* Mascot + typing bar illustration */}
              <div className="relative mt-4 flex items-end gap-3">
                <div className="shrink-0 animate-mascot-bob">
                  <Mascot size={72} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="glass-card border-white/20 rounded-2xl px-3 py-2 text-sm text-[#EAF4FF]">
                    <Sparkles className="inline w-3.5 h-3.5 mr-1 text-[#7CAFE5]" />
                    AI summarized your lecture into 3 key points ✅
                  </div>
                  <div className="flex gap-2">
                    <div className="glass-card border-white/20 rounded-xl px-3 py-1.5 text-xs text-[#EAF4FF] font-medium">
                      📋 Quiz ready
                    </div>
                    <div className="glass-card border-white/20 rounded-xl px-3 py-1.5 text-xs text-[#EAF4FF] font-medium">
                      🔥 Streak 12
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating analytics cards */}
            {cards.map((card, i) => renderCard(card, i))}
          </motion.div>

          {/* Feature bullets */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            {features.map(renderFeature)}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="relative z-10 flex items-center justify-between text-xs text-[#EAF4FF]/60"
        >
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Encrypted · Trusted by students & teachers
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#39C1FF]" /> Powered by AI
          </span>
        </motion.div>
      </div>

      {/* ───────────────── RIGHT: Form panel ───────────────── */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-12 overflow-hidden">
        {/* Animated brand background (mobile + desktop right panel) */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#EAF4FF] via-[#f6fbff] to-[#d9ecff] dark:from-[#0b1a2c] dark:via-[#0e2a47] dark:to-[#081a30] animate-gradient-mesh" />
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#1F6DB8]/20 to-[#7CAFE5]/15 blur-[80px] animate-float-orb" />
          <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#39C1FF]/20 to-[#1F6DB8]/15 blur-[80px] animate-float-orb-delayed" />
          <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#7CAFE5]/20 to-[#5F9FDD]/15 blur-[100px] animate-float-orb-slow" />

          {/* Pulse rings */}
          <div className="absolute top-[20%] left-[50%] w-32 h-32 rounded-full border border-[#1F6DB8]/20 animate-pulse-ring" />
          <div className="absolute top-[20%] left-[50%] w-32 h-32 rounded-full border border-[#39C1FF]/15 animate-pulse-ring-delayed" />
          <div className="absolute bottom-[30%] right-[20%] w-24 h-24 rounded-full border border-[#7CAFE5]/15 animate-pulse-ring" style={{ animationDelay: '-1s' }} />

          {/* Floating particles */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full bg-[#1F6DB8]/30 ${
                i % 3 === 0 ? 'animate-particle' : i % 3 === 1 ? 'animate-particle-delayed' : 'animate-particle-slow'
              }`}
              style={{ left: `${5 + (i * 9) % 90}%`, bottom: '-5%', animationDelay: `${i * 0.8}s` }}
            />
          ))}
        </div>

        {/* Mobile/tablet logo (hidden on lg) */}
        {showLogo && (
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center gap-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-brand-primary/10 backdrop-blur-sm">
                <CampusAiLogo className="h-8 w-8" />
              </div>
              <CampusAiBrandTitle variant="shimmer" size="text-2xl" />
            </div>
          </div>
        )}

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="relative backdrop-blur-xl bg-white/85 dark:bg-[#0e2a47]/85 rounded-[24px] border border-brand-soft dark:border-white/10 shadow-[0_8px_40px_rgba(31,109,184,0.15)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] p-8">
            {/* Decorative top gradient line */}
            <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-brand-accent-light to-transparent rounded-full" />

            {/* Title */}
            {(title || subtitle) && (
              <div className="mb-6">
                {title && (
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>
                )}
              </div>
            )}

            {/* Form content */}
            <div>{children}</div>

            {/* Alt action */}
            {altAction && (
              <p className="text-center text-xs text-muted-foreground mt-6 pt-4 border-t border-border/30">
                {altAction.text}{' '}
                <button
                  type="button"
                  className="font-medium text-brand-primary hover:text-brand-primary/80 underline-offset-4 hover:underline transition-colors"
                  onClick={altAction.onClick}
                >
                  {altAction.linkText}
                </button>
              </p>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground/60 mt-6">
            Protected by encrypted connections
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthLayout;

