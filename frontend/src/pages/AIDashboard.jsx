import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AIDashboardNavbar from '../components/ai-dashboard/AIDashboardNavbar';
import AISidebar from '../components/ai-dashboard/AISidebar';
import StatCard from '../components/ai-dashboard/StatCard';
import AIProgressBar from '../components/ai-dashboard/AIProgressBar';
import AIInsights from '../components/ai-dashboard/AIInsights';
import RightSidebar from '../components/ai-dashboard/RightSidebar';
import CoursesTable from '../components/ai-dashboard/CoursesTable';
import FloatingAIButton from '../components/ai-dashboard/FloatingAIButton';
import FloatingStickers from '../components/ai-dashboard/FloatingStickers';
import DoodleArrow from '../components/ai-dashboard/DoodleArrow';
import StreakBadge from '../components/ai-dashboard/StreakBadge';
import ProgressRing from '../components/ai-dashboard/ProgressRing';
import DecorativeBlobs from '../components/ai-dashboard/DecorativeBlobs';
import Mascot from '../components/ai-dashboard/Mascot';
import {
  CalendarCheck,
  Flame,
  BookOpenCheck,
  BrainCircuit,
  School,
  TrendingUp,
  BookOpen,
  Play,
  ChevronRight,
  Award,
  Clock,
  Trophy,
  Sparkles,
  Target,
  ArrowRight,
} from 'lucide-react';

// ===== Asymmetric Bento stat tiles (2/1/1/1/2 "broken grid") =====
const STATS = [
  { icon: CalendarCheck, label: 'Attendance', value: '94%', sub: '+3% this week', gradient: 'from-indigo-500 to-blue-500', span: 'lg:col-span-2', accent: true },
  { icon: Flame, label: 'Study Streak', value: '12d', sub: 'Personal best!', gradient: 'from-orange-500 to-amber-500', span: 'lg:col-span-1' },
  { icon: BookOpenCheck, label: 'Completed', value: '28', sub: 'Lectures finished', gradient: 'from-emerald-500 to-teal-500', span: 'lg:col-span-1' },
  { icon: BrainCircuit, label: 'AI Score', value: '87', sub: 'Top 10% of class', gradient: 'from-purple-500 to-fuchsia-500', span: 'lg:col-span-1' },
  { icon: School, label: 'Upcoming', value: '3', sub: 'Classes this week', gradient: 'from-pink-500 to-rose-500', span: 'lg:col-span-2', accent: true },
];

const TOPICS = [
  { name: 'Linear Algebra', value: 92, color: 'bg-indigo-500' },
  { name: 'Calculus II', value: 78, color: 'bg-purple-500' },
  { name: 'Physics', value: 64, color: 'bg-emerald-500' },
  { name: 'English', value: 85, color: 'bg-pink-500' },
];

const RECENT_LECTURES = [
  { title: 'AI Ethics & Society', subject: 'Computer Science', time: 'Today 10:00 AM', emoji: '🤖', color: 'from-indigo-500 to-blue-500' },
  { title: 'Matrix Transformations', subject: 'Math 101', time: 'Yesterday', emoji: '🧮', color: 'from-purple-500 to-violet-500' },
  { title: 'Thermodynamics Basics', subject: 'Physics 150', time: 'Mar 20', emoji: '🔥', color: 'from-emerald-500 to-teal-500' },
];

const WEEK = [
  { day: 'M', value: 45 },
  { day: 'T', value: 60 },
  { day: 'W', value: 52 },
  { day: 'T', value: 72 },
  { day: 'F', value: 68 },
  { day: 'S', value: 85 },
  { day: 'S', value: 92 },
];

const DAILY_GOALS = [
  { label: 'Review Linear Algebra', done: true },
  { label: 'Complete Quiz 3', done: true },
  { label: 'Watch Physics lecture', done: false },
  { label: 'Practice flashcards', done: false },
];

export default function AIDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen ai-dashboard-bg font-sans relative overflow-x-hidden">
      <AIDashboardNavbar />

      {/* Decorative pastel blobs + floating stickers behind content */}
      <DecorativeBlobs />
      <FloatingStickers />

      <div className="flex max-w-[1600px] mx-auto">
        <AISidebar />

        {/* Main content */}
        <main className="relative flex-1 px-4 sm:px-6 lg:px-8 py-8 min-w-0">
          {/* ============ HERO ============ */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="ai-hero relative overflow-hidden mb-6 p-6 sm:p-8"
          >
            {/* floating decorative blobs inside hero */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/40 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-fuchsia-200/40 rounded-full blur-2xl" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Mascot illustration */}
              <div className="shrink-0 animate-mascot-bob">
                <Mascot size={120} />
              </div>

              {/* Greeting */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 bg-white/70 px-3 py-1 rounded-full">
                    <Sparkles className="w-3 h-3 animate-twinkle" /> Level 8 Explorer
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-4xl font-bold text-gray-900">
                  Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 🎉
                </h1>
                <p className="text-gray-600 mt-1 max-w-xl">
                  You're on a 12-day streak. Let's keep the momentum going — you have
                  <span className="font-semibold text-indigo-600"> 2 tasks </span>
                  left today.
                </p>
              </div>

              {/* Streak + CTA */}
              <div className="flex items-center gap-4 shrink-0">
                <StreakBadge days={12} size="lg" />
                <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:brightness-105 transition-all">
                  <Target className="w-5 h-5" /> Start Learning
                </button>
              </div>
            </div>
          </motion.section>

          {/* ============ BENTO GRID (asymmetric) ============ */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* ---------- LEFT (8/12) ---------- */}
            <div className="xl:col-span-8 space-y-6 min-w-0">
              {/* Asymmetric stat tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((stat, i) => (
                  <div key={stat.label} className={stat.span}>
                    <StatCard {...stat} delay={0.05 * i} />
                  </div>
                ))}
              </div>

              {/* Large AI "Daily Focus" card — spans 2 cols */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="ai-daily-bg text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-purple-500/20"
              >
                <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-10 w-40 h-40 bg-fuchsia-400/20 rounded-full blur-2xl" />

                <div className="relative flex items-start justify-between flex-wrap gap-6">
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                        <BrainCircuit className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-lg leading-tight">AI Daily Focus</h2>
                        <p className="text-xs text-purple-100">Personalized by your learning patterns</p>
                      </div>
                    </div>
                    <p className="text-sm text-purple-50/90 leading-relaxed mb-4">
                      You're strongest in <span className="font-semibold text-white">Linear Algebra</span> 🔥. To
                      boost your overall score, we recommend focusing on{' '}
                      <span className="font-semibold text-white">Physics</span> today — your mastery is at 64%.
                    </p>
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-purple-700 font-semibold text-sm hover:bg-purple-50 transition-colors shadow-lg">
                      View AI plan <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mastery ring */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="bg-white/15 rounded-3xl p-4 backdrop-blur">
                      <ProgressRing value={87} size={110} color="#fff" label="AI Score" sub="Overall" delay={0.4} />
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* AI Insights actions */}
              <AIInsights />

              {/* Asymmetric split: Topic Mastery (2) + This Week (1) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ y: -4 }}
                  className="bento-tile p-6 lg:col-span-2 pastel-card-sky"
                >
                  <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-500" />
                      <h2 className="font-display font-semibold text-gray-900">Topic Mastery</h2>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      +8% this month
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block shrink-0">
                      <ProgressRing value={87} size={110} color="#4F46E5" label="Mastery" sub="Overall" delay={0.4} />
                    </div>
                    <div className="flex-1 space-y-4">
                      {TOPICS.map((topic, i) => (
                        <AIProgressBar key={topic.name} label={topic.name} value={topic.value} color={topic.color} delay={0.35 + i * 0.1} />
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* This Week chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  whileHover={{ y: -4 }}
                  className="bento-tile p-6 flex flex-col pastel-card-peach"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    <h2 className="font-display font-semibold text-gray-900">This Week</h2>
                  </div>
                  <div className="flex items-end gap-2 h-32 flex-1">
                    {WEEK.map((w, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${w.value}%` }}
                        transition={{ duration: 0.6, delay: 0.4 + i * 0.08 }}
                        className="flex-1 rounded-t-xl bg-gradient-to-t from-indigo-500 to-purple-400 hover:from-indigo-600 hover:to-purple-500 transition-colors"
                        style={{ minHeight: w.value > 0 ? '8px' : '0' }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {WEEK.map((w, i) => (
                      <span key={i} className="flex-1 text-center text-[10px] text-gray-400 font-medium">{w.day}</span>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Recent lectures — playful cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative bento-tile p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    <h2 className="font-display font-semibold text-gray-900">Recent Lectures</h2>
                  </div>
                  <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {RECENT_LECTURES.map((lec, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="group p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50/60 transition-colors cursor-pointer border border-gray-100"
                    >
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${lec.color} flex items-center justify-center text-2xl mb-3 shadow`}>
                        {lec.emoji}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm leading-snug">{lec.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{lec.subject}</p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 mt-2">
                        <Clock className="w-3 h-3" /> {lec.time}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Daily goals checklist */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="bento-tile p-6 pastel-card-mint"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-display font-semibold text-gray-900">Today's Goals</h2>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full ml-auto">
                    {DAILY_GOALS.filter(g => g.done).length}/{DAILY_GOALS.length} done
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DAILY_GOALS.map((g, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                        g.done ? 'bg-white border-emerald-200' : 'bg-white/70 border-gray-200'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          g.done ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {g.done ? '✓' : i + 1}
                      </span>
                      <span className={`text-sm font-medium ${g.done ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {g.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ---------- RIGHT (4/12) ---------- */}
            <div className="xl:col-span-4 min-w-0">
              <RightSidebar />
            </div>
          </div>

          {/* ---------- BOTTOM: Courses strip ---------- */}
          <div className="mt-6">
            <CoursesTable />
          </div>
        </main>
      </div>

      <FloatingAIButton />
    </div>
  );
}
