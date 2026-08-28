import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AIDashboardNavbar from '../components/ai-dashboard/AIDashboardNavbar';
import AIInsightsCard from '../components/ai-dashboard/AIInsightsCard';
import StudentAnalytics from '../components/ai-dashboard/StudentAnalytics';
import UpcomingTasks from '../components/ai-dashboard/UpcomingTasks';
import LeaderboardCard from '../components/ai-dashboard/LeaderboardCard';
import AILectureCards from '../components/ai-dashboard/AILectureCards';
import FloatingAIButton from '../components/ai-dashboard/FloatingAIButton';
import FloatingStickers from '../components/ai-dashboard/FloatingStickers';
import DecorativeBlobs from '../components/ai-dashboard/DecorativeBlobs';
import StreakBadge from '../components/ai-dashboard/StreakBadge';
import ProgressRing from '../components/ai-dashboard/ProgressRing';
import { BookOpen, Award, CalendarCheck, Target, Sparkles, ArrowRight, BrainCircuit } from 'lucide-react';

// Skeleton tile shown while "loading"
function SkeletonTile({ className = '' }) {
  return (
    <div className={`bento-tile p-6 ${className}`}>
      <div className="skeleton w-10 h-10 rounded-2xl mb-4" />
      <div className="skeleton h-4 w-1/3 rounded-lg mb-3" />
      <div className="skeleton h-8 w-1/2 rounded-lg mb-4" />
      <div className="skeleton h-3 w-full rounded-lg mb-2" />
      <div className="skeleton h-3 w-2/3 rounded-lg" />
    </div>
  );
}

export default function AIDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Student';

  const STATS = [
    { label: 'Total Lectures', value: '28', icon: BookOpen, gradient: 'from-brand-primary to-brand-accent-light', sub: '8 this week' },
    { label: 'Total Quizzes', value: '42', icon: Award, gradient: 'from-brand-accent-cyan to-brand-accent-light', sub: '+6 this week' },
    { label: 'Attendance', value: '94%', icon: CalendarCheck, gradient: 'from-brand-primary-dark to-brand-primary', sub: '+3% this week' },
    { label: 'Avg Score', value: '87%', icon: Target, gradient: 'from-brand-accent-warm to-orange-400', sub: 'Top 10% of class' },
  ];

  return (
    <div className="min-h-screen ai-dashboard-bg font-sans relative overflow-x-hidden">
      <AIDashboardNavbar />

      <DecorativeBlobs />
      <FloatingStickers />

      <main className="relative max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ============ HERO ============ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="ai-hero relative overflow-hidden mb-6 p-6 sm:p-8"
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/50 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-brand-accent-light/50 rounded-full blur-2xl" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Greeting */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary bg-white/70 px-3 py-1 rounded-full">
                  <Sparkles className="w-3 h-3 animate-twinkle" /> AI Classroom
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Good morning, {firstName} 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-xl">
                You completed <span className="font-semibold text-brand-primary">8 lectures</span> this week.
                AI has prepared <span className="font-semibold text-brand-primary">new recommendations</span> for you.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#2563EB] to-brand-accent-light text-white font-semibold shadow-lg shadow-brand-primary/30 hover:brightness-105 active:scale-[0.98] transition-all">
                  <BrainCircuit className="w-5 h-5" /> View AI Plan
                </button>
                <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/70 backdrop-blur border border-gray-200 text-gray-700 dark:text-gray-200 dark:bg-white/10 dark:border-white/10 font-semibold shadow-sm hover:bg-white transition-colors">
                  Continue Learning <ArrowRight className="w-4 h-4 text-brand-primary" />
                </button>
              </div>
            </div>

            {/* Streak badge */}
            <div className="flex items-center gap-4 shrink-0">
              <StreakBadge days={12} size="lg" />
              <div className="bg-white/70 backdrop-blur rounded-3xl p-4">
                <ProgressRing value={87} size={110} color="#2563EB" label="AI Score" sub="Overall" delay={0.4} />
              </div>
            </div>
          </div>
        </motion.section>

        {/* ============ STATS ============ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              whileHover={{ y: -4 }} 
              className="bento-tile p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg`}>
                  <stat.icon className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
              </div>
              <p className="bento-number text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-brand-primary font-medium mt-1">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* ============ BENTO GRID ============ */}
        {loading ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8 space-y-6">
              <SkeletonTile />
              <SkeletonTile />
            </div>
            <div className="xl:col-span-4 space-y-6">
              <SkeletonTile />
              <SkeletonTile />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8 space-y-6 min-w-0">
              <AIInsightsCard />
              <StudentAnalytics />
              <AILectureCards />
            </div>

            <div className="xl:col-span-4 space-y-6 min-w-0">
              <UpcomingTasks />
              <LeaderboardCard />
            </div>
          </div>
        )}
      </main>

      <FloatingAIButton />
    </div>
  );
}

