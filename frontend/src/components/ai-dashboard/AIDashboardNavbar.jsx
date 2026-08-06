import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Sparkles, Home, Compass, Bot, BookOpen, ClipboardList, BarChart3, LogOut, Bell } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', href: '/dash', icon: Home },
  { label: 'Learning Hub', href: '/dash/learning', icon: Compass },
  { label: 'AI Assistant', href: '/dash/assistant', icon: Bot },
  { label: 'Lectures', href: '/lectures', icon: BookOpen },
  { label: 'Assignments', href: '/dash/assignments', icon: ClipboardList },
];

export default function AIDashboardNavbar() {
  const { user, logout } = useAuth();
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
      className="floating-nav max-w-[1400px]"
    >
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dash" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-bold text-gray-900 leading-none">CampusAI</p>
              <p className="text-[10px] text-indigo-500 font-semibold tracking-widest">LEARN PLAYFULLY</p>
            </div>
          </Link>

          {/* Nav pill */}
          <nav className="hidden lg:flex items-center gap-1 bg-gray-100/80 rounded-full p-1.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    active ? 'text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full shadow-md shadow-indigo-500/30"
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
            {/* Notification bell */}
            <button className="relative p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            <Link
              to="/settings"
              className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div className="text-left leading-tight">
                <p className="text-sm font-medium text-gray-900">{user?.name?.split(' ')[0] || 'Student'}</p>
                <p className="text-[10px] text-gray-400">Pro Explorer</p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-gray-500 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              aria-label="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Mobile menu */}
            <details className="lg:hidden relative">
              <summary className="list-none p-2 rounded-full text-gray-600 hover:bg-gray-100 cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </summary>
              <div className="absolute right-0 top-14 w-56 rounded-3xl bg-white border border-gray-200 p-2 shadow-2xl">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                      isActive(item.href) ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'
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
