import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Sparkles, Home, BookOpen, FileQuestion, BarChart3, Code2, Bell, LogOut, Sun, Moon } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dash', icon: Home },
  { label: 'Lectures', href: '/lectures', icon: BookOpen },
  { label: 'Quizzes', href: '/quizzes', icon: FileQuestion },
  { label: 'Analytics', href: '/dash/analytics', icon: BarChart3 },
  { label: 'Coding Lab', href: '/coding', icon: Code2 },
];

export default function AIDashboardNavbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (href) =>
    location.pathname === href || location.pathname.startsWith(href + '/');

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="floating-nav max-w-[1500px]"
    >
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dash" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent-light flex items-center justify-center shadow-lg shadow-brand-primary/30 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-bold text-gray-900 dark:text-white leading-none">CampusAI</p>
              <p className="text-[10px] text-brand-primary font-semibold tracking-widest">LEARN PLAYFULLY</p>
            </div>
          </Link>

          {/* Nav pill */}
          <nav className="hidden lg:flex items-center gap-1 bg-gray-100/80 dark:bg-white/10 rounded-full p-1.5 border border-gray-200/60 dark:border-white/10">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`relative px-3.5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    active ? 'text-white' : 'text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-accent-light rounded-full shadow-md shadow-brand-primary/30"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-brand-primary hover:bg-brand-soft dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notification bell */}
            <button className="relative p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-brand-primary hover:bg-brand-soft dark:hover:bg-white/10 transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            <Link
              to="/settings"
              className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-gray-100/80 dark:bg-white/10 hover:bg-gray-200/80 dark:hover:bg-white/20 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent-cyan flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div className="text-left leading-tight">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name?.split(' ')[0] || 'Student'}</p>
                <p className="text-[10px] text-gray-400">Pro Explorer</p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              aria-label="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Mobile menu */}
            <details className="lg:hidden relative">
              <summary className="list-none p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </summary>
              <div className="absolute right-0 top-14 w-56 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 shadow-2xl">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                      isActive(item.href) ? 'bg-brand-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
