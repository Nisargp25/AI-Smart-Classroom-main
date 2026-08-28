import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, BookOpen, ClipboardList, BrainCircuit, ChevronRight } from 'lucide-react';

const TASKS = [
  {
    title: 'OOP Quiz',
    detail: 'Tomorrow · 9:00 AM',
    icon: BrainCircuit,
    color: 'from-brand-primary to-brand-accent-light',
    priority: 'High',
    tagColor: 'bg-rose-100 text-rose-600',
  },
  {
    title: 'Data Structures Assignment',
    detail: 'Due in 3 days',
    icon: ClipboardList,
    color: 'from-brand-accent-cyan to-brand-accent-light',
    priority: 'Medium',
    tagColor: 'bg-amber-100 text-amber-600',
  },
  {
    title: 'AI Lecture',
    detail: 'Today · 4:00 PM',
    icon: BookOpen,
    color: 'from-brand-primary-dark to-brand-primary',
    priority: 'Now',
    tagColor: 'bg-green-100 text-green-600',
  },
];

export default function UpcomingTasks() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ y: -4 }}
      className="bento-tile p-6 flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent-cyan flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
            <CalendarDays className="w-5 h-5" />
          </span>
          <h2 className="font-display font-semibold text-gray-900">Upcoming Tasks</h2>
        </div>
        <button className="text-sm font-semibold text-brand-primary hover:text-brand-primary-dark flex items-center gap-1">
          View all <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 flex-1">
        {TASKS.map((task, i) => (
          <motion.div
            key={task.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 + i * 0.1 }}
            whileHover={{ x: 4 }}
            className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-brand-soft/50 hover:border-brand-accent-light/50 transition-colors"
          >
            <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${task.color} flex items-center justify-center text-white shadow shrink-0`}>
              <task.icon className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 text-sm truncate">{task.title}</p>
              <p className="text-xs text-gray-500">{task.detail}</p>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${task.tagColor}`}>
              {task.priority}
            </span>
          </motion.div>
        ))}
      </div>
</motion.section>
  );
}

