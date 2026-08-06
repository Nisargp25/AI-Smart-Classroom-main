import React from 'react';
import { motion } from 'framer-motion';

/**
 * DoodleArrow — a hand-drawn, squiggly curved arrow (SVG path) used to
 * point at important UI elements, giving a playful sketch accent.
 */
export default function DoodleArrow({
  className = '',
  color = '#F59E0B',
  strokeWidth = 3,
  slight = false,
}) {
  // Slightly random-looking hand-drawn paths
  const path = slight
    ? 'M10,90 C40,80 45,45 95,40 C120,37 130,18 150,10'
    : 'M10,90 C50,85 60,50 100,55 C140,60 150,25 190,12';

  return (
    <motion.svg
      width="190"
      height="100"
      viewBox="0 0 200 100"
      fill="none"
      className={className}
      initial={{ opacity: 0, pathLength: 0 }}
      animate={{ opacity: 1, pathLength: 1 }}
      transition={{ duration: 1.2, delay: 1, ease: 'easeInOut' }}
      aria-hidden="true"
    >
      <motion.path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 1, ease: 'easeInOut' }}
      />
      {/* Arrow head */}
      <motion.path
        d="M150,10 L158,22 M150,10 L138,17"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      />
    </motion.svg>
  );
}
