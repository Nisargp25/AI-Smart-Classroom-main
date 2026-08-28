import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, FileQuestion, Target, Play, StickyNote, ArrowRight } from 'lucide-react';

const LECTURES = [
  {
    title: 'Object-Oriented Programming',
    subject: 'Computer Science',
    students: 45,
    quizzes: 12,
    avgScore: 82,
    color: 'from-brand-primary to-brand-accent-light',
    emoji: '📚',
  },
  {
    title: 'Data Structures & Algorithms',
    subject: 'Computer Science',
    students: 38,
    quizzes: 9,
    avgScore: 76,
    color: 'from-brand-accent-cyan to-brand-accent-light',
    emoji: '🧠',
  },
  {
    title: 'Introduction to Machine Learning',
    subject: 'AI & Data',
    students: 52,
    quizzes: 15,
    avgScore: 88,
    color: 'from-brand-primary-dark to-brand-primary',
    emoji: '🤖',
  },
];

const ACTIONS = [
  { label: 'Open Lecture', icon: Play, color: 'bg-brand-primary text-white hover:bg-brand-primary-dark' },
  { label: 'Generate Quiz', icon: FileQuestion, color: 'bg-brand-soft text-brand-primary hover:bg-brand-accent-light/30' },
  { label: 'Generate Notes', icon: StickyNote, color: 'bg-brand-soft text-brand-primary hover:bg-brand-accent-light/30' },
];

export default function AILectureCards() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="relative bento-tile p-6 sm:p-7"
    >
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent-cyan flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
            <BookOpen className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-display font-bold text-gray-900 text-lg">Lecture Cards</h2>
            <p className="text-sm text-gray-500">Manage lectures & generate AI content</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primary-dark bg-brand-soft hover:bg-brand-accent-light/30 px-4 py-2 rounded-full transition-colors">
          All lectures <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {LECTURES.map((lec, i) => (
          <motion.div
            key={lec.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-2xl hover:shadow-brand-primary/10 hover:border-brand-accent-light/50 transition-all"
          >
            <div className={`absolute -top-8 -right-8 w-28 h-28 bg-gradient-to-br ${lec.color} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`} />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${lec.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {lec.emoji}
                </span>
                <span className="text-xs font-semibold text-brand-primary bg-brand-soft px-3 py-1.5 rounded-full">
                  {lec.subject}
                </span>
              </div>

              <h3 className="font-display font-semibold text-gray-900 leading-snug mb-4">{lec.title}</h3>

              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="flex flex-col items-center p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <Users className="w-4 h-4 text-brand-primary mb-1" />
                  <span className="text-sm font-bold text-gray-900">{lec.students}</span>
                  <span className="text-[10px] text-gray-400">Students</span>
                </div>
                <div className="flex flex-col items-center p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <FileQuestion className="w-4 h-4 text-brand-accent-cyan mb-1" />
                  <span className="text-sm font-bold text-gray-900">{lec.quizzes}</span>
                  <span className="text-[10px] text-gray-400">Quizzes</span>
                </div>
                <div className="flex flex-col items-center p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <Target className="w-4 h-4 text-brand-accent-warm mb-1" />
                  <span className="text-sm font-bold text-gray-900">{lec.avgScore}%</span>
                  <span className="text-[10px] text-gray-400">Avg Score</span>
                </div>
              </div>

              <div className="space-y-2">
                {ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${action.color}`}
                  >
                    <action.icon className="w-3.5 h-3.5" /> {action.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
</motion.section>
  );
}
