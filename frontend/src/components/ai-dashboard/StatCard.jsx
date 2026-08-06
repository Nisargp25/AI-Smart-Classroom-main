import React from 'react';
import { motion } from 'framer-motion';

/**
 * StatCard — bento tile that supports accent (spanning) variants.
 * `accent` renders a richer gradient tile, otherwise a clean white tile.
 */
export default function StatCard({ icon: Icon, label, value, sub, gradient, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`bento-tile p-5 h-full flex flex-col ${
        accent ? 'pastel-card-sky border-indigo-100' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className="bento-number text-3xl font-bold text-gray-900">{value}</p>
      {sub && (
        <p className={`text-sm mt-1 ${accent ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>{sub}</p>
      )}
    </motion.div>
  );
}
