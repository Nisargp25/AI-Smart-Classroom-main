import React from 'react';
import { C } from './aiTheme';

/* Pulsing glowing AI indicator ring. */
export default function AIRing({ color = C.green, size = 'w-1.5 h-1.5' }) {
  return (
    <span className="relative inline-flex w-2 h-2">
      <span className={`${size} rounded-full`} style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      <span className={`absolute inset-0 rounded-full`} style={{ background: color, animation: 'aiRing 1.8s ease-out infinite' }} />
    </span>
  );
}
