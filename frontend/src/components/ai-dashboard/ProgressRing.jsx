import React from 'react';
import { motion } from 'framer-motion';

/**
 * ProgressRing — an animated SVG circular progress indicator.
 * Used for gamified "level" / "mastery" rings (Duolingo style).
 */
export default function ProgressRing({
  value = 0,
  size = 120,
  strokeWidth = 12,
  color = '#4F46E5',
  trackColor = 'rgba(226,232,240,0.8)',
  label = '',
  sub = '',
  delay = 0,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <motion.div
        initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay, type: 'spring', stiffness: 60 }}
        className="relative"
      >
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, delay: delay + 0.2, ease: 'easeOut' }}
          />
        </svg>
        {/* Center content */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: 'rotate(90deg)' }}
        >
          <span className="font-display font-bold text-gray-900" style={{ fontSize: size * 0.22 }}>
            {value}%
          </span>
          {label && <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>}
        </div>
      </motion.div>
      {sub && <span className="text-xs text-gray-500 mt-1.5">{sub}</span>}
    </div>
  );
}
