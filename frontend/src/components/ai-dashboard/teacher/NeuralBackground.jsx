import React from 'react';
import { motion } from 'framer-motion';
import { C } from './aiTheme';

/* Subtle AI neural background — almost white, pattern visible only up close. */
export default function NeuralBackground() {
  const particles = [
    { t: '12%', l: '18%', c: C.violet },
    { t: '28%', l: '82%', c: C.electric },
    { t: '55%', l: '8%', c: C.cyan },
    { t: '70%', l: '90%', c: C.primary },
    { t: '85%', l: '30%', c: C.green },
    { t: '40%', l: '50%', c: C.violet },
  ];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(37,99,235,0.05) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 20%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 20%, black 30%, transparent 80%)',
        }}
      />
      <div className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10), transparent 65%)' }} />
      <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.10), transparent 65%)' }} />
      <div className="absolute bottom-0 left-1/3 w-[460px] h-[460px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.08), transparent 65%)' }} />
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ top: p.t, left: p.l, width: 4, height: 4, background: p.c, opacity: 0.5 }}
          animate={{ y: [0, -14, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 6, delay: i * 0.7 }}
        />
      ))}
    </div>
  );
}
