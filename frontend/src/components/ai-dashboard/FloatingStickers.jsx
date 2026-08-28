import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Trophy, Zap, Heart, BookMarked, GraduationCap, Rocket } from 'lucide-react';

/**
 * FloatingStickers — playful floating stickers scattered around the dashboard
 * (Duolingo / LexieLingua style). Each sticker floats gently with its own
 * offset so they don't all move in sync.
 */
const STICKERS = [
  { icon: Sparkles, color: '#1F6DB8', pos: 'top-[8%] right-[4%]', size: 34, float: '0s' },
  { icon: Star, color: '#F59E0B', pos: 'top-[30%] left-[2%]', size: 28, float: '-2s' },
  { icon: Trophy, color: '#0E4E93', pos: 'bottom-[22%] right-[3%]', size: 30, float: '-4s' },
  { icon: Zap, color: '#F59E0B', pos: 'top-[55%] right-[5%]', size: 26, float: '-1s' },
  { icon: Heart, color: '#5F9FDD', pos: 'top-[12%] left-[4%]', size: 24, float: '-3s' },
  { icon: BookMarked, color: '#1F6DB8', pos: 'bottom-[40%] left-[3%]', size: 28, float: '-5s' },
  { icon: GraduationCap, color: '#7CAFE5', pos: 'top-[68%] right-[2%]', size: 26, float: '-2.5s' },
  { icon: Rocket, color: '#39C1FF', pos: 'bottom-[8%] left-[6%]', size: 30, float: '-1.5s' },
];

export default function FloatingStickers() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden hidden lg:block" aria-hidden="true">
      {STICKERS.map((s, i) => (
        <motion.div
          key={i}
          className={`absolute ${s.pos}`}
          style={{ animationDelay: s.float }}
          initial={{ opacity: 0, scale: 0, rotate: -20 }}
          animate={{ opacity: 0.85, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.8 + i * 0.1, type: 'spring', stiffness: 120 }}
        >
          <div className="animate-float-slow" style={{ animationDelay: s.float }}>
            <s.icon style={{ width: s.size, height: s.size, color: s.color }} strokeWidth={1.8} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
