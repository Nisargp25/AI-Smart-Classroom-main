import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { C } from './aiTheme';

/* Hero neural network visualization with a glowing central AI node. */
export default function NeuralHeroVisual() {
  const nodes = [
    { x: 50, y: 18 },
    { x: 18, y: 40 },
    { x: 50, y: 40 },
    { x: 82, y: 40 },
    { x: 18, y: 70 },
    { x: 50, y: 70 },
    { x: 82, y: 70 },
    { x: 50, y: 88 },
  ];
  const edges = [
    [0, 1], [0, 2], [0, 3],
    [1, 4], [1, 5], [2, 3], [2, 5], [2, 6], [3, 6],
    [4, 7], [5, 7], [6, 7],
  ];
  return (
    <div className="relative w-full h-[300px]">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {edges.map((e, i) => (
          <motion.line
            key={i}
            x1={nodes[e[0]].x}
            y1={nodes[e[0]].y}
            x2={nodes[e[1]].x}
            y2={nodes[e[1]].y}
            stroke="#2563EB"
            strokeWidth="0.35"
            strokeOpacity="0.35"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, delay: 0.2 + i * 0.08 }}
          />
        ))}
        {nodes.map((n, i) => (
          <motion.circle
            key={`n${i}`}
            cx={n.x}
            cy={n.y}
            r="2.2"
            fill={i === 2 ? '#102A43' : '#2563EB'}
            fillOpacity={i === 2 ? 1 : 0.7}
            animate={{ r: [2.2, i === 2 ? 3 : 2.6, 2.2] }}
            transition={{ repeat: Infinity, duration: 2.4, delay: i * 0.2 }}
          />
        ))}
        <motion.circle
          cx="50"
          cy="40"
          r="6"
          fill="none"
          stroke="#2563EB"
          strokeWidth="0.4"
          animate={{ r: [6, 9, 6], opacity: [0.8, 0.2, 0.8] }}
          transition={{ repeat: Infinity, duration: 2.4 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <Sparkles className="w-5 h-5 mx-auto mb-1" style={{ color: C.primary }} />
          <p className="font-display font-bold text-xs tracking-[0.3em] text-[#102A43]">CAMPUS AI</p>
        </div>
      </div>
    </div>
  );
}
