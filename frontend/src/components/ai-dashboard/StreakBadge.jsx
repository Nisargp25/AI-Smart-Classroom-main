import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

/**
 * StreakBadge — an animated daily-streak badge (Duolingo style).
 * Shows a pulsing flame with a bobbing motion and a "day count" callout.
 */
export default function StreakBadge({ days = 12, size = 'md' }) {
  const sizes = {
    sm: { flame: 'w-8 h-8', text: 'text-2xl', pad: 'px-4 py-2' },
    md: { flame: 'w-12 h-12', text: 'text-4xl', pad: 'px-6 py-3' },
    lg: { flame: 'w-16 h-16', text: 'text-5xl', pad: 'px-8 py-4' },
  }[size];

  return (
    <motion.div
      initial={{ scale: 0, rotate: -15 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      whileHover={{ scale: 1.08, rotate: 5 }}
      className={`inline-flex items-center gap-3 rounded-full bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 shadow-lg shadow-orange-200/50 ${sizes.pad}`}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        className="relative"
      >
        <Flame className={`${sizes.flame} text-orange-500 drop-shadow-lg`} fill="currentColor" />
        {/* Glow ring */}
        <motion.span
          className="absolute inset-0 rounded-full bg-orange-400/40"
          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      </motion.div>
      <div className="text-left">
        <span className={`font-display font-extrabold text-orange-600 leading-none block ${sizes.text}`}>
          {days}
        </span>
        <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">day streak</span>
      </div>
    </motion.div>
  );
}
