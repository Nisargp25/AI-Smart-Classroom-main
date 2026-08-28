import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Users } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const WEEKLY_PROGRESS = [
  { day: 'Mon', score: 65 },
  { day: 'Tue', score: 72 },
  { day: 'Wed', score: 68 },
  { day: 'Thu', score: 80 },
  { day: 'Fri', score: 78 },
  { day: 'Sat', score: 88 },
  { day: 'Sun', score: 92 },
];

const QUIZ_COMPLETION = [
  { name: 'Q1', completed: 82 },
  { name: 'Q2', completed: 90 },
  { name: 'Q3', completed: 76 },
  { name: 'Q4', completed: 88 },
  { name: 'Q5', completed: 95 },
];

const BARS = ['#2563EB', '#39C1FF', '#F59E0B'];

export default function StudentAnalytics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bento-tile p-6"
    >
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent-light flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
            <BarChart3 className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-display font-bold text-gray-900 text-lg">Student Analytics</h2>
            <p className="text-sm text-gray-500">Weekly performance overview</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
          <TrendingUp className="w-3.5 h-3.5" /> +12% engagement
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-semibold text-gray-700">Weekly Progress</h3>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEKLY_PROGRESS} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-semibold text-gray-700">Quiz Completion</h3>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={QUIZ_COMPLETION} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
                <Bar dataKey="completed" radius={[6, 6, 0, 0]} maxBarSize={28}>
                  {QUIZ_COMPLETION.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={BARS[i % BARS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-brand-accent-cyan/15 flex items-center justify-center text-brand-primary">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 leading-none">87%</p>
            <p className="text-xs text-gray-500 mt-1">Student Engagement</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-gray-500">Highly engaged class</span>
        </div>
      </div>
    </motion.div>
  );
}

