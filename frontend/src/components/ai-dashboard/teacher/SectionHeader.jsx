import React from 'react';
import { C } from './aiTheme';

/* Shared AI section header with glowing status dot. */
export default function SectionHeader({ icon: Icon, title, subtitle, accent, action }) {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg relative" style={{ background: `linear-gradient(135deg, ${accent || C.primary}, ${C.electric})` }}>
          <Icon className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
        </span>
        <div>
          <h2 className="font-display font-bold text-[#102A43] text-lg leading-tight">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
