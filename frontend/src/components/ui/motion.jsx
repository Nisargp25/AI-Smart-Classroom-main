import React from 'react';
import { motion } from 'framer-motion';

/**
 * Shared motion variants & helpers for the CampusAI design system.
 * Use these across ALL pages so every section animates consistently
 * (fade-up on scroll, staggered children, hover lift).
 */

// ────────────────────────────────────────────────────────────
// Base variants
// ────────────────────────────────────────────────────────────
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export const staggerFast = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export const viewportOnce = { once: true, amount: 0.2 };

// ────────────────────────────────────────────────────────────
// <Reveal> — wraps children, fades+slides up when scrolled into view
// ────────────────────────────────────────────────────────────
export function Reveal({ children, className = '', delay = 0, y = 24, amount = 0.2 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// <Stagger> — parent container that staggers its <motion.*> children
// ────────────────────────────────────────────────────────────
export function Stagger({ children, className = '', as = 'div', amount = 0.2 }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      className={className}
    >
      {children}
    </Comp>
  );
}

// ────────────────────────────────────────────────────────────
// <MotionCard> — a card that lifts on hover + fades up in.
// Unified micro-interaction used across bento grids & lists.
// ────────────────────────────────────────────────────────────
export function MotionCard({
  children,
  className = '',
  delay = 0,
  hoverY = -6,
  hoverScale = 1.01,
  ...rest
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: hoverY, scale: hoverScale, transition: { duration: 0.25 } }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// <SectionHeader> — consistent eyebrow + title + subtitle
// ────────────────────────────────────────────────────────────
export function SectionHeader({ eyebrow, title, subtitle, className = '', align = 'center' }) {
  const alignCls = align === 'left' ? 'text-left items-start' : 'text-center items-center';
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      className={`max-w-2xl mx-auto mb-12 flex flex-col ${alignCls} ${className}`}
    >
      {eyebrow && (
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border border-brand-primary/20 bg-brand-primary/5 text-brand-primary uppercase tracking-wide text-xs"
        >
          {eyebrow}
        </motion.span>
      )}
      {title && (
        <motion.h2
          variants={fadeUp}
          className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
        >
          {title}
        </motion.h2>
      )}
      {subtitle && (
        <motion.p variants={fadeUp} className="mt-3 text-lg text-muted-foreground">
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}

const motionUtils = {
  fadeUp,
  fadeIn,
  scaleIn,
  stagger,
  container,
  Reveal,
  Stagger,
  MotionCard,
  SectionHeader,
};

export default motionUtils;
</content>
