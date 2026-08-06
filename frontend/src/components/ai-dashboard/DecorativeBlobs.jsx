import React from 'react';
import { motion } from 'framer-motion';

/**
 * DecorativeBlobs — soft pastel gradient blobs / orbs used as playful
 * background decoration (LexieLingua style). These sit behind the content
 * and gently drift to add visual depth without being distracting.
 */
export default function DecorativeBlobs() {
  const blobs = [
    { color: 'from-pink-200/70 to-rose-200/50', pos: 'top-[-40px] right-[10%]', size: 'w-72 h-72', delay: '0s' },
    { color: 'from-indigo-200/70 to-blue-200/50', pos: 'bottom-[10%] left-[-60px]', size: 'w-80 h-80', delay: '-4s' },
    { color: 'from-emerald-200/60 to-teal-200/40', pos: 'top-[40%] left-[30%]', size: 'w-56 h-56', delay: '-8s' },
    { color: 'from-amber-200/60 to-yellow-200/40', pos: 'bottom-[-30px] right-[30%]', size: 'w-64 h-64', delay: '-6s' },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full bg-gradient-to-br ${b.color} blur-3xl ${b.pos} ${b.size}`}
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 25, 0] }}
          transition={{ repeat: Infinity, duration: 18, delay: i * 2, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
