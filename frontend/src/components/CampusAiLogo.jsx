import React from 'react';

export function CampusAiLogo({ className = 'h-10 w-10' }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      role="img"
      aria-label="CampusAi logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" fillRule="evenodd">
        <circle cx="48" cy="48" r="44" fill="#EAF4FF" />
        <path
          d="M24 24c6-7 14-10 24-10s18 3 24 10"
          stroke="#7CAFE5"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="22" cy="24" r="4" fill="#5F9FDD" />
        <circle cx="74" cy="24" r="4" fill="#5F9FDD" />

        <circle cx="48" cy="54" r="30" fill="#1F6DB8" />
        <path d="M18 56c8-8 17-12 30-12s22 4 30 12v14H18z" fill="#0E4E93" />

        <circle cx="36" cy="50" r="11" fill="#F7FCFF" />
        <circle cx="60" cy="50" r="11" fill="#F7FCFF" />
        <circle cx="36" cy="50" r="7" fill="#2F78C3" />
        <circle cx="60" cy="50" r="7" fill="#2F78C3" />
        <circle cx="36" cy="50" r="3.2" fill="#F59E0B" />
        <circle cx="60" cy="50" r="3.2" fill="#F59E0B" />
        <circle cx="34" cy="48" r="1.2" fill="#FFFFFF" />
        <circle cx="58" cy="48" r="1.2" fill="#FFFFFF" />

        <path d="M48 62l4.3 7.4h-8.6z" fill="#F59E0B" />
      </g>
    </svg>
  );
}
