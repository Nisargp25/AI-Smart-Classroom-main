import React from 'react';
import { CampusAiLogo } from './CampusAiLogo';
import { AnimatedTitle, CampusAiBrandTitle } from './AnimatedTitle';

/**
 * AuthLayout — Shared animated background + layout wrapper for Login / Register pages.
 *
 * Props:
 *   children     - ReactNode (the form content)
 *   title        - string (e.g. "Welcome Back")
 *   subtitle     - string (e.g. "Sign in to your account")
 *   altAction    - { text: "Don't have an account?", linkText: "Sign up", onClick: fn }
 *   showLogo      - boolean (default true)
 */
export function AuthLayout({ children, title, subtitle, altAction, showLogo = true }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* ─── Animated Background ─── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Base gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F7E6CA] via-[#fdf6e8] to-[#F0DFC0] dark:from-[#1c1c1c] dark:via-[#242424] dark:to-[#171717] animate-gradient-mesh" />

        {/* Indigo & sky orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#4F46E5]/15 to-[#0EA5E9]/10 blur-[80px] animate-float-orb" />
        <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#0EA5E9]/15 to-[#4F46E5]/10 blur-[80px] animate-float-orb-delayed" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#E8D59E]/15 to-[#D9BBB0]/10 blur-[100px] animate-float-orb-slow" />

        {/* Expanding pulse rings */}
        <div className="absolute top-[20%] left-[50%] w-32 h-32 rounded-full border border-[#4F46E5]/20 animate-pulse-ring" />
        <div className="absolute top-[20%] left-[50%] w-32 h-32 rounded-full border border-[#0EA5E9]/15 animate-pulse-ring-delayed" />
        <div className="absolute bottom-[30%] right-[20%] w-24 h-24 rounded-full border border-[#E8D59E]/15 animate-pulse-ring" style={{ animationDelay: '-1s' }} />

        {/* Floating particles */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1.5 h-1.5 rounded-full bg-[#4F46E5]/30 ${
              i % 3 === 0 ? 'animate-particle' : i % 3 === 1 ? 'animate-particle-delayed' : 'animate-particle-slow'
            }`}
            style={{
              left: `${5 + (i * 9) % 90}%`,
              bottom: '-5%',
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* ─── Glass Card ─── */}
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo header */}
        {showLogo && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10 backdrop-blur-sm">
                <CampusAiLogo className="h-8 w-8" />
              </div>
              <CampusAiBrandTitle variant="shimmer" size="text-2xl" />
            </div>
            {subtitle && (
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            )}
          </div>
        )}

        {/* Glass card */}
        <div className="relative backdrop-blur-xl bg-white/80 dark:bg-[#242424]/80 rounded-2xl border border-white/20 dark:border-white/5 shadow-[0_8px_40px_rgba(79,70,229,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] p-8">
          {/* Decorative top gradient line */}
          <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full" />

          {/* Title */}
          {title && (
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
              {title}
            </h1>
          )}

          {/* Children (form content) */}
          <div className="mt-6">
            {children}
          </div>

          {/* Alt action link */}
          {altAction && (
            <p className="text-center text-xs text-muted-foreground mt-6 pt-4 border-t border-border/30">
              {altAction.text}{' '}
              <button
                type="button"
                className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
                onClick={altAction.onClick}
              >
                {altAction.linkText}
              </button>
            </p>
          )}
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          Protected by encrypted connections
        </p>
      </div>
    </div>
  );
}

