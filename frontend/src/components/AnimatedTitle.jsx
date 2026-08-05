import React, { useEffect, useState, useRef } from 'react';

/**
 * AnimatedTitle — Reusable animated text component for the CampusAi project.
 *
 * Props:
 *   text        - string (default: "CampusAi")
 *   variant     - "typewriter" | "shimmer" | "float" | "glow" | "stagger" | "bounce" | "wave"
 *                 (default: "shimmer")
 *   as          - HTML tag or component to render (default: "span")
 *   className   - additional classes
 *   speed       - animation speed in ms (default differs per variant)
 *   glowColor   - custom glow color for glow variant (default: primary color)
 */
export function AnimatedTitle({
  text = 'CampusAi',
  variant = 'shimmer',
  as: Tag = 'span',
  className = '',
  speed,
  glowColor,
}) {
  const [displayText, setDisplayText] = useState(variant === 'typewriter' ? '' : text);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  // Intersection observer — only animate when visible
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Typewriter logic
  useEffect(() => {
    if (variant !== 'typewriter' || !isVisible) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed || 80);
    return () => clearInterval(interval);
  }, [variant, isVisible, text, speed]);

  // Determine base classes per variant
  const variantClasses = () => {
    switch (variant) {
      case 'shimmer':
        return 'bg-clip-text text-transparent bg-[length:200%_100%] ' +
          'bg-gradient-to-r from-primary via-primary/70 via-[#38BDF8] to-primary ' +
          'animate-shimmer';
      case 'float':
        return 'inline-block animate-float';
      case 'glow':
        return 'animate-glow';
      case 'stagger':
        return 'inline-block';
      case 'bounce':
        return 'inline-block animate-bounce-subtle';
      case 'wave':
        return 'inline-block';
      case 'typewriter':
      default:
        return '';
    }
  };

  // Letter-staggered rendering (stagger / wave variants)
  if (variant === 'stagger' || variant === 'wave') {
    return (
      <Tag
        ref={ref}
        className={`inline-flex flex-wrap ${className}`}
        aria-label={text}
      >
        {text.split('').map((char, i) => (
          <span
            key={i}
            className={`inline-block ${
              char === ' ' ? 'w-[0.3em]' : ''
            } ${
              variant === 'stagger'
                ? 'opacity-0 animate-stagger-in'
                : 'animate-wave'
            }`}
            style={{
              animationDelay: `${i * (speed || 60)}ms`,
              animationFillMode: 'forwards',
              color: 'inherit',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </Tag>
    );
  }

  // Glow variant with custom color support
  if (variant === 'glow') {
    return (
      <Tag
        ref={ref}
        className={`relative ${className}`}
        style={
          glowColor
            ? {
                textShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor}, 0 0 40px ${glowColor}`,
                animation: 'pulse-glow-text 2s ease-in-out infinite',
              }
            : undefined
        }
      >
        <span className="relative z-10">{displayText}</span>
        <span
          className="absolute inset-0 z-0 blur-xl opacity-60"
          style={{ color: glowColor || 'var(--primary)' }}
          aria-hidden="true"
        >
          {displayText}
        </span>
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={`${variantClasses()} ${className}`}
      aria-label={text}
    >
      {variant === 'typewriter' && !isVisible ? '' : displayText}
      {variant === 'typewriter' && isVisible && displayText.length < text.length && (
        <span className="inline-block w-[2px] h-[1em] bg-primary ml-0.5 animate-pulse align-middle" />
      )}
    </Tag>
  );
}

// ────────────────────────────────────────────
// Pre-built decorative title compositions
// ────────────────────────────────────────────

export function CampusAiBrandTitle({ variant = 'shimmer', className = '', size = 'text-lg' }) {
  return (
    <span className={`inline-flex items-center gap-1 font-bold tracking-tight ${size} ${className}`}>
      <AnimatedTitle text="Campus" variant={variant} speed={70} />
      <AnimatedTitle text="Ai" variant={variant === 'shimmer' ? 'glow' : variant} speed={90} className="text-accentText" />
    </span>
  );
}

export function HeroTitle({ className = '' }) {
  return (
    <h1 className={`text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight ${className}`}>
      Transform Your
      <span className="block mt-2">
        <AnimatedTitle
          text="AI Smart Classroom"
          variant="shimmer"
          as="span"
          className="inline-block"
        />
      </span>
    </h1>
  );
}

