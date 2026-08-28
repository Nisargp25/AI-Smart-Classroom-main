import React from 'react';
import { motion } from 'framer-motion';
import {
  FileQuestion,
  FileText,
  Layers,
  BookOpenText,
  Sparkles,
  StickyNote,
  ArrowRight,
} from 'lucide-react';

const ACTIONS = [
  { label: 'Generate Quiz', desc: 'Instant quizzes from any lecture', icon: FileQuestion, color: 'from-brand-primary to-brand-accent-light' },
  { label: 'Lecture Summary', desc: 'Concise AI-powered summaries', icon: FileText, color: 'from-brand-primary-dark to-brand-primary' },
  { label: 'Flashcards', desc: 'Smart spaced-repetition cards', icon: Layers, color: 'from-brand-accent-cyan to-brand-accent-light' },
  { label: 'Vocabulary Practice', desc: 'Interactive word drills', icon: BookOpenText, color: 'from-brand-accent-light to-brand-accent-cyan' },
  { label: 'AI Recommendations', desc: 'Personalized study paths', icon: Sparkles, color: 'from-brand-accent-warm to-brand-accent-light' },
  { label: 'Smart Notes', desc: 'Auto-structured notes', icon: StickyNote, color: 'from-brand-primary to-brand-accent-cyan' },
];

export default function AIInsights() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="ai-insights-bg rounded-3xl p-6 sm:p-8 border border-brand-accent-light/50 shadow-soft"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/70 backdrop-blur flex items-center justify-center text-brand-primary shadow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-gray-900 text-lg">AI Insights</h2>
            <p className="text-sm text-brand-primary/70">Your intelligent study companion</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-brand-primary bg-white/60 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-cyan animate-pulse" />
          AI Active
        </span>
      </div>

      {/* Actions grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {ACTIONS.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 + i * 0.06 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group text-left bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm hover:shadow-lg transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 shadow group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">{action.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
<span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Try now <ArrowRight className="w-3 h-3" />
            </span>
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
