import React from 'react';
import { motion } from 'framer-motion';

/**
 * Mascot
 * ------------------------------------------------------------------
 * A playful, animated EdTech mascot illustration (LexieLingua-style).
 * Rendered with pure JSX + Tailwind so it scales to any size and animates
 * using framer-motion. Used in the hero section and empty states.
 *
 * Props:
 *  - size   : number -> width/height in px (default 120)
 *  - className : extra wrapper classes
 */
export default function Mascot({ size = 120, className = '' }) {
  return (
    <motion.div
      className={`relative select-none ${className}`}
      style={{ width: size, height: size }}
      initial={{ scale: 0, rotate: -12 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.2 }}
    >
      {/* Waving hand (separate, floats) */}
      <motion.span
        className="absolute -top-3 -right-2 text-[0.45em] z-20 inline-block origin-bottom-left"
        animate={{ rotate: [0, -18, 0, -18, 0] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        style={{ fontSize: size * 0.28, lineHeight: 1 }}
      >
        👋
      </motion.span>

      {/* Sparkle accent */}
      <motion.span
        className="absolute -top-2 -left-1 z-20"
        animate={{ scale: [1, 1.25, 1], rotate: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        style={{ fontSize: size * 0.22, lineHeight: 1 }}
      >
        ✨
      </motion.span>

      {/* Body bubble */}
      <div
        className="absolute inset-0 rounded-[45%] bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 shadow-lg shadow-orange-200/60"
        style={{ transform: 'rotate(-4deg)' }}
      />

      {/* Face */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: 'rotate(-4deg)' }}>
        {/* Eyes */}
        <div className="flex items-center gap-[18%]">
          <div className="rounded-full bg-gray-800" style={{ width: '9%', height: '9%', minWidth: 6, minHeight: 6 }} />
          <div className="rounded-full bg-gray-800" style={{ width: '9%', height: '9%', minWidth: 6, minHeight: 6 }} />
        </div>
        {/* Smile */}
        <div
          className="mt-[6%] rounded-b-full border-b-4 border-gray-700"
          style={{ width: '26%', height: '14%' }}
        />
        {/* Rosy cheeks */}
        <div className="flex items-center gap-[26%] mt-[4%]">
          <span className="rounded-full bg-rose-300/70" style={{ width: '12%', height: '12%', minWidth: 8, minHeight: 8 }} />
          <span className="rounded-full bg-rose-300/70" style={{ width: '12%', height: '12%', minWidth: 8, minHeight: 8 }} />
        </div>
      </div>

      {/* Little graduation cap */}
      <div className="absolute top-[6%] left-1/2 -translate-x-1/2">
        <div
          className="bg-brand-primary rounded-t-md"
          style={{ width: size * 0.34, height: size * 0.1 }}
        />
        <div
          className="bg-brand-accent-cyan mx-auto"
          style={{ width: size * 0.2, height: size * 0.06, borderRadius: 4 }}
        />
      </div>
    </motion.div>
  );
}
