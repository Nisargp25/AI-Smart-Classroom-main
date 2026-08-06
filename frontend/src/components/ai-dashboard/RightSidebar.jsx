import React from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  CalendarClock,
  FileQuestion,
  Bell,
  CalendarDays,
  ChevronRight,
} from 'lucide-react';

const ASSIGNMENTS = [
  { title: 'Linear Algebra Problem Set', course: 'Math 101', due: 'Tomorrow', color: 'bg-indigo-500' },
  { title: 'Essay: AI Ethics', course: 'English 204', due: 'Fri', color: 'bg-pink-500' },
  { title: 'Physics Lab Report', course: 'Physics 150', due: 'Next Mon', color: 'bg-emerald-500' },
];

const DEADLINES = [
  { title: 'Capstone Proposal', date: 'Mar 28', priority: 'High', color: 'text-red-500' },
  { title: 'Quiz 3 - Calculus', date: 'Apr 02', priority: 'Medium', color: 'text-amber-500' },
  { title: 'Group Presentation', date: 'Apr 05', priority: 'Low', color: 'text-emerald-500' },
];

const PENDING_QUIZZES = [
  { title: 'Chapter 5 Quiz', questions: 12, time: '15 min' },
  { title: 'Vocabulary Drill', questions: 20, time: '10 min' },
];

const NOTIFICATIONS = [
  { title: 'New lecture available', desc: 'AI Ethics — uploaded', time: '2m ago', color: 'bg-indigo-500' },
  { title: 'Quiz graded', desc: 'You scored 92%', time: '1h ago', color: 'bg-emerald-500' },
  { title: 'Streak at risk', desc: 'Complete today to keep 12-day streak', time: '3h ago', color: 'bg-amber-500' },
];

const EVENTS = [
  { day: '18', month: 'Mar', title: 'Midterm Exam', color: 'bg-rose-500' },
  { day: '21', month: 'Mar', title: 'Project Demo', color: 'bg-purple-500' },
  { day: '25', month: 'Mar', title: 'Guest Lecture', color: 'bg-cyan-500' },
];

function Section({ icon: Icon, title, children, badge }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
className="bento-tile p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-indigo-500" />
          <h3 className="font-display font-semibold text-gray-900 text-sm">{title}</h3>
          {badge && (
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>
      {children}
    </motion.div>
  );
}

export default function RightSidebar() {
  return (
    <aside className="space-y-4">
      {/* Upcoming Assignments */}
      <Section icon={ClipboardList} title="Upcoming Assignments" badge={String(ASSIGNMENTS.length)}>
        <div className="space-y-3">
          {ASSIGNMENTS.map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${a.color} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{a.title}</p>
                <p className="text-xs text-gray-500">{a.course}</p>
              </div>
              <span className="text-[11px] font-semibold text-gray-400 shrink-0">{a.due}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Deadlines */}
      <Section icon={CalendarClock} title="Deadlines">
        <div className="space-y-2.5">
          {DEADLINES.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{d.title}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{d.date}</span>
                <span className={`text-[10px] font-bold ${d.color}`}>{d.priority}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Pending Quizzes */}
      <Section icon={FileQuestion} title="Pending Quizzes" badge={String(PENDING_QUIZZES.length)}>
        <div className="space-y-3">
          {PENDING_QUIZZES.map((q, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-800">{q.title}</p>
                <p className="text-xs text-gray-500">{q.questions} questions · {q.time}</p>
              </div>
              <button className="text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-colors">
                Start
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <div className="space-y-3">
          {NOTIFICATIONS.map((n, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`w-8 h-8 rounded-xl ${n.color} flex items-center justify-center text-white shrink-0`}>
                <Bell className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 leading-tight">{n.title}</p>
                <p className="text-xs text-gray-500 truncate">{n.desc}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Calendar Events */}
      <Section icon={CalendarDays} title="Calendar Events">
        <div className="space-y-2.5">
          {EVENTS.map((e, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className={`w-11 flex flex-col items-center justify-center rounded-xl ${e.color} text-white py-1.5`}>
                <span className="text-sm font-bold leading-none">{e.day}</span>
                <span className="text-[9px] uppercase">{e.month}</span>
              </div>
              <span className="text-sm font-medium text-gray-800">{e.title}</span>
            </div>
          ))}
        </div>
      </Section>
    </aside>
  );
}
