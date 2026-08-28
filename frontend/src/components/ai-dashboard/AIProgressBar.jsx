import React from 'react';
import { motion } from 'framer-motion';

export default function AIProgressBar({ value, color = 'bg-brand-primary', label, delay = 0 }) {
  return (
    <div>
      {label && (
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="font-semibold text-gray-900">{value}%</span>
        </div>
      )}
      <div className="h-2.5 w-full bg-gray-200/70 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
          className={`h-full rounded-full ${color} relative overflow-hidden`}
        >
          <span className="absolute inset-0 bg-white/30 animate-pulse" style={{ width: '40%' }} />
        </motion.div>
      </div>
    </div>
  );
}
