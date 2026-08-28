import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, MoreHorizontal, TrendingUp, Sparkles } from 'lucide-react';
import AIProgressBar from './AIProgressBar';

const COURSES = [
  { code: 'MATH101', name: 'Linear Algebra', progress: 92, color: 'bg-brand-primary', grade: 'A', students: 128 },
  { code: 'CS201', name: 'Data Structures', progress: 78, color: 'bg-brand-accent-cyan', grade: 'A-', students: 96 },
  { code: 'PHYS150', name: 'Physics I', progress: 64, color: 'bg-brand-accent-light', grade: 'B+', students: 142 },
  { code: 'ENG204', name: 'Academic Writing', progress: 85, color: 'bg-brand-primary-dark', grade: 'A', students: 74 },
];

export default function CoursesTable() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
className="relative ai-card p-6 sm:p-7 pastel-card-mint"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
<div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent-cyan flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-gray-900 text-lg">Your Courses</h2>
            <p className="text-sm text-gray-500">Track progress across all enrolled courses</p>
          </div>
          {/* Decorative twinkle illustration */}
          <Sparkles className="w-5 h-5 text-brand-accent-warm animate-twinkle ml-1" />
        </div>
        <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primary-dark bg-brand-soft hover:bg-brand-accent-light/30 px-4 py-2 rounded-full transition-colors">
          <TrendingUp className="w-4 h-4" />
          View all courses
        </button>
      </div>

      {/* Courses table */}
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[640px] border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <th className="px-4 py-2">Course</th>
              <th className="px-4 py-2 w-1/3">Progress</th>
              <th className="px-4 py-2 text-center">Grade</th>
              <th className="px-4 py-2 text-center">Students</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {COURSES.map((course, i) => (
              <motion.tr
                key={course.code}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.55 + i * 0.08 }}
                whileHover={{ scale: 1.01 }}
                className="bg-gray-50/70 hover:bg-brand-soft/60 rounded-2xl transition-colors"
              >
                <td className="px-4 py-3.5 rounded-l-2xl">
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-xl ${course.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                      {course.code.slice(0, 3)}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{course.name}</p>
                      <p className="text-xs text-gray-400">{course.code}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <AIProgressBar value={course.progress} color={course.color} />
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-800">
                    {course.grade}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center text-sm text-gray-500">{course.students}</td>
                <td className="px-4 py-3.5 rounded-r-2xl text-right">
                  <button className="p-1.5 rounded-lg hover:bg-gray-200/70 text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
