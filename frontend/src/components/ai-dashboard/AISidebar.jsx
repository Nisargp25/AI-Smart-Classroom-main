import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Compass,
  Bot,
  BookOpen,
  ClipboardList,
  BarChart3,
  Mic,
  Brain,
  CalendarCheck,
  LineChart,
  Sparkles,
} from 'lucide-react';

const MAIN_NAV = [
  { label: 'Home', href: '/dash', icon: Home },
  { label: 'Learning Hub', href: '/dash/learning', icon: Compass },
  { label: 'AI Assistant', href: '/dash/assistant', icon: Bot },
  { label: 'Lectures', href: '/lectures', icon: BookOpen },
  { label: 'Assignments', href: '/dash/assignments', icon: ClipboardList },
  { label: 'Analytics', href: '/dash/analytics', icon: BarChart3 },
];

const AI_FEATURES = [
  { label: 'Voice Transcription', icon: Mic },
  { label: 'AI Chatbot', icon: Brain },
  { label: 'Smart Attendance', icon: CalendarCheck },
  { label: 'Performance API', icon: LineChart },
];

export default function AISidebar() {
  const location = useLocation();

  const isActive = (href) =>
    location.pathname === href || location.pathname.startsWith(href + '/');

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="hidden md:flex flex-col w-[76px] xl:w-64 shrink-0 px-3 py-6 sticky top-24 h-[calc(100vh-7rem)]"
    >
      {/* Main nav */}
      <nav className="flex flex-col gap-1.5 mb-8">
        {MAIN_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              to={item.href}
              title={item.label}
              className={`relative group flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all ${
                active ? 'text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-pill"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-accent-light shadow-lg shadow-brand-primary/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon className="w-5 h-5 relative z-10" />
              <span className="relative z-10 hidden xl:block text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* AI Features */}
      <div className="hidden xl:block">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-3 mb-3">
          AI Features
        </p>
        <div className="flex flex-col gap-1">
          {AI_FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
            >
<span className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-accent-cyan to-brand-primary flex items-center justify-center text-white">
                <f.icon className="w-4 h-4" />
              </span>
              <span className="text-sm font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Playful upgrade card */}
      <div className="mt-auto hidden xl:block p-4 rounded-3xl bg-brand-soft border border-brand-accent-light/50">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-brand-primary animate-twinkle" />
          <p className="font-semibold text-gray-900 text-sm">AI Pro</p>
        </div>
        <p className="text-xs text-gray-500 mb-3">Unlock unlimited AI magic</p>
        <button className="w-full py-2 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-accent-light text-white text-xs font-semibold hover:brightness-105 transition-all shadow-md shadow-brand-primary/30">
          Upgrade ✨
        </button>
      </div>
    </motion.aside>
  );
}
