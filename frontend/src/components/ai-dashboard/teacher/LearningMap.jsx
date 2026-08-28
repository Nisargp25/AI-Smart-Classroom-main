import React from 'react';
import { motion } from 'framer-motion';
import { C } from './aiTheme';

const LEARNING_MAP_NODES = [
  { name: 'Algorithms', progress: 78, difficulty: 'Hard', confidence: 84 },
  { name: 'OOP', progress: 82, difficulty: 'Medium', confidence: 91 },
  { name: 'Data Structures', progress: 74, difficulty: 'Hard', confidence: 79 },
  { name: 'DBMS', progress: 91, difficulty: 'Easy', confidence: 95 },
  { name: 'AI / ML', progress: 68, difficulty: 'Hard', confidence: 72 },
];

/* AI Learning Map — knowledge graph (neural-network style). */
export default function LearningMap() {
  const ORDER = ['Algorithms', 'OOP', 'Data Structures', 'DBMS', 'AI / ML'];
  const nodePos = {
    'Algorithms': { x: 50, y: 8 },
    'OOP': { x: 12, y: 42 },
    'Data Structures': { x: 50, y: 46 },
    'DBMS': { x: 88, y: 42 },
    'AI / ML': { x: 50, y: 84 },
  };
  const edges = [[1, 2], [2, 3], [2, 0], [2, 4]];
  return (
    <div className="relative w-full">
      <svg viewBox="0 0 100 100" className="w-full h-[300px]">
        {edges.map((e, i) => {
          const a = nodePos[ORDER[e[0]]];
          const b = nodePos[ORDER[e[1]]];
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#2563EB" strokeWidth="0.4" strokeOpacity="0.35" strokeDasharray="2 2" />
              <motion.circle cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} r="0.6" fill="#8B5CF6" animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.3 }} />
            </g>
          );
        })}
        {ORDER.map((name, i) => {
          const p = nodePos[name];
          return (
            <g key={name}>
              <motion.circle cx={p.x} cy={p.y} r="9" fill="#fff" stroke={i === 2 ? C.violet : C.primary} strokeWidth="0.6" initial={{ r: 0 }} whileInView={{ r: 9 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }} />
              <motion.circle cx={p.x} cy={p.y} r="4" fill={i === 2 ? C.violet : C.primary} animate={{ r: [4, 5, 4] }} transition={{ repeat: Infinity, duration: 2.4, delay: i * 0.3 }} />
            </g>
          );
        })}
      </svg>
      {ORDER.map((name, i) => {
        const n = LEARNING_MAP_NODES[i];
        const p = nodePos[name];
        return (
          <motion.div key={name} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${p.x}%`, top: `${p.y}%` }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.1 }}>
            <div className="bg-white/90 backdrop-blur border border-slate-100 rounded-xl px-2.5 py-1.5 shadow-sm min-w-[92px]">
              <p className="font-medium text-[#102A43] text-xs">{name}</p>
              <p className="font-display font-bold text-sm" style={{ color: i === 2 ? C.violet : C.primary }}>{n.progress}%</p>
              <p className="text-[9px] text-slate-400">{n.difficulty} · AI {n.confidence}%</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
