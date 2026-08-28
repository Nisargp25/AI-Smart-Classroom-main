import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight } from 'lucide-react';
import AIProgressBar from './AIProgressBar';

const STUDENTS = [
  { name: 'John', score: 95, medal: '🥇', color: 'bg-amber-400' },
  { name: 'Sarah', score: 92, medal: '🥈', color: 'bg-slate-300' },
  { name: 'Alex', score: 89, medal: '🥉', color: 'bg-orange-300' },
];

export default function LeaderboardCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      whileHover={{ y: -4 }}
      className="bento-tile p-6 flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-accent-warm to-orange-400 flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <Trophy className="w-5 h-5" />
          </span>
          <h2 className="font-display font-semibold text-gray-900">Top Students</h2>
        </div>
        <button className="text-sm font-semibold text-brand-primary hover:text-brand-primary-dark flex items-center gap-1">
          View all <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 flex-1">
        {STUDENTS.map((student, i) => (
          <motion.div
            key={student.name}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-brand-accent-light/50 hover:bg-brand-soft/50 transition-colors"
          >
            <span className="text-2xl w-8 text-center shrink-0">{student.medal}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-gray-800 text-sm">{student.name}</span>
                <span className="text-sm font-bold text-brand-primary">{student.score}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200/70 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${student.score}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${student.color}`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-accent-light text-white text-sm font-semibold shadow-lg shadow-brand-primary/25 hover:brightness-105 active:scale-[0.98] transition-all">
        <Trophy className="w-4 h-4" /> View Full Leaderboard
      </button>
</motion.section>
  );
}

