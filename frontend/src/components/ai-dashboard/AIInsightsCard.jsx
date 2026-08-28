import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileQuestion, StickyNote, BarChart3, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

const INSIGHTS = [
  'Students struggle with OOP concepts',
  'Generate a revision quiz for the class',
  'Create flashcards from the last lecture',
  'Schedule a revision lecture this week',
];

const ACTIONS = [
  { label: 'Generate Quiz', icon: FileQuestion, color: 'from-brand-primary to-brand-accent-light' },
  { label: 'Create Notes', icon: StickyNote, color: 'from-brand-accent-cyan to-brand-accent-light' },
  { label: 'View Analytics', icon: BarChart3, color: 'from-brand-accent-warm to-orange-400' },
];

export default function AIInsightsCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#0E4E93] via-[#1F6DB8] to-[#39C1FF] text-white shadow-xl shadow-brand-primary/30"
    >
      {/* Decorative glows */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-10 w-40 h-40 bg-brand-accent-cyan/20 rounded-full blur-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow">
              <Sparkles className="w-5 h-5 animate-twinkle" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg leading-tight">AI Insights</h2>
              <p className="text-xs text-brand-accent-light">Analyzed from your class activity</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
          </span>
        </div>

        {/* Insight bullets */}
        <div className="space-y-2.5 mb-6">
          {INSIGHTS.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
              className="flex items-start gap-3 bg-white/10 backdrop-blur rounded-2xl px-4 py-3 border border-white/10"
            >
              {i === 0 ? (
                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-300 shrink-0 mt-0.5" />
              )}
              <span className="text-sm text-white/95 leading-snug">{insight}</span>
            </motion.div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-3">
          {ACTIONS.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="group flex flex-col items-center gap-2 bg-white/15 backdrop-blur rounded-2xl py-3.5 px-2 border border-white/15 hover:bg-white/25 transition-colors"
            >
              <span className={`w-9 h-9 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow group-hover:scale-110 transition-transform`}>
                <action.icon className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-semibold text-white leading-tight text-center">{action.label}</span>
            </motion.button>
          ))}
        </div>

        <button className="mt-4 w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-accent-light hover:text-white transition-colors">
          Open AI Assistant <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.section>
  );
}

