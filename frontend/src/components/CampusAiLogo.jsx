import React from 'react';

/**
 * CampusAiLogo — Renders the CampusAI brand logo as inline SVG.
 *
 * Modes:
 *   - `variant="icon"` (default): square circular mark only.
 *   - `variant="horizontal"`: mark + wordmark lockup.
 *   - `monochrome`: single-color version using `currentColor`.
 *   - Pass `src`/`srcSet` to render a raster `<img>` fallback instead.
 *
 * Props:
 *   className  - additional classes (controls size when no width/height given)
 *   width      - explicit width in px (number or string)
 *   height     - explicit height in px (number or string)
 *   variant    - "icon" (default) | "horizontal"
 *   monochrome - boolean -> single-color via currentColor
 *   ariaLabel  - accessible name for the SVG (default "CampusAI")
 *   src        - optional raster fallback src (renders <img>)
 *   srcSet     - optional srcset for the <img> fallback
 *   alt        - alt text for the <img> fallback
 */
export function CampusAiLogo({
  className,
  width,
  height,
  variant = 'icon',
  monochrome = false,
  ariaLabel = 'CampusAI',
  src,
  srcSet,
  alt = 'CampusAI — AI-powered education platform',
  ...rest
}) {
  // Raster fallback
  if (src) {
    return (
      <img
        src={src}
        srcSet={srcSet}
        className={className}
        width={width}
        height={height}
        alt={alt}
        loading="lazy"
        {...rest}
      />
    );
  }

  const isHorizontal = variant === 'horizontal';
  const viewBox = isHorizontal ? '0 0 560 200' : '0 0 200 200';
  const gradId = 'campusai-ai-grad';

  const navy = monochrome ? 'currentColor' : '#0E4E93';
  const ring = monochrome ? 'currentColor' : '#1F6DB8';
  const button = monochrome ? 'currentColor' : '#7CAFE5';
  const tasselDot = monochrome ? 'currentColor' : '#F59E0B';
  const back = monochrome ? 'none' : '#EAF4FF';
  const sp1 = monochrome ? 'currentColor' : '#1F6DB8';
  const sp2 = monochrome ? 'currentColor' : '#7CAFE5';
  const sp3 = monochrome ? 'currentColor' : '#5F9FDD';
  const wordColor = monochrome ? 'currentColor' : '#0E4E93';
  const aiFill = monochrome ? 'currentColor' : `url(#${gradId})`;

  const r = isHorizontal ? 78 : 90;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      role="img"
      aria-label={ariaLabel}
      className={className}
      width={width}
      height={height}
      {...rest}
    >
      <title>{ariaLabel}</title>
      <desc id="campusai-desc">Circular mortarboard mark with three sparkles and the CampusAI wordmark.</desc>
      {!monochrome && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0A6BFF" />
            <stop offset="1" stopColor="#39C1FF" />
          </linearGradient>
        </defs>
      )}

      {/* Circular mark */}
      <circle cx="100" cy="100" r={r} fill={back} />
      <circle cx="100" cy="100" r={r} fill="none" stroke={ring} strokeWidth="8" />

      {/* Mortarboard */}
      <g transform="translate(100 100)">
        <path d="M-52 8 L0 -22 L52 8 L0 38 Z" fill={navy} />
        <circle cx="0" cy="8" r="5" fill={button} />
        <path d="M0 8 L0 26 M0 8 L18 18" stroke={navy} strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="22" cy="21" r="5" fill={tasselDot} />
        <path d="M-10 22 L-10 36 Q0 44 10 36 L10 22" fill="none" stroke={navy} strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Sparkles */}
      <g transform="translate(150 40)" fill={sp1}>
        <path d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" />
      </g>
      <g transform="translate(166 62)" fill={sp2}>
        <path d="M0 -6.5 L1.6 -1.6 L6.5 0 L1.6 1.6 L0 6.5 L-1.6 1.6 L-6.5 0 L-1.6 -1.6 Z" />
      </g>
      <g transform="translate(158 88)" fill={sp3}>
        <path d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z" />
      </g>

      {/* Wordmark (horizontal only) */}
      {isHorizontal && (
        <g fontFamily="'Poppins','Montserrat',-apple-system,'Segoe UI',sans-serif" fontSize="72" fontWeight="600" letterSpacing="-1">
          <text x="210" y="132" fill={wordColor}>Campus</text>
          <text x="480" y="132" fill={aiFill}>AI</text>
        </g>
      )}
    </svg>
  );
}

export default CampusAiLogo;
