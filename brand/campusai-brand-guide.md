# CampusAI — Brand Guide (One Page)

> Education product brand system. Tone: professional, optimistic, trustworthy.

---

## 1. Logo

The CampusAI logo is a **circular mark** containing a **mortarboard** graduation cap with **three sparkles**, paired with the wordmark **"Campus"** (navy) + **"AI"** (bright blue gradient).

### Variants
| Variant | File | Use |
|---|---|---|
| Full (mark + wordmark) | `svg/campusai-logo-full.svg` | Master / source |
| Icon / square mark | `svg/campusai-icon.svg` | Favicons, avatars, app icon |
| Horizontal lockup | `svg/campusai-logo-horizontal.svg` | Navbar, headers, sign-in |
| Wordmark only | `svg/campusai-wordmark.svg` | Space-constrained spots |
| Monochrome (single color) | `*-monochrome.svg` | Dark / light low-contrast backgrounds via `color` |

### Geometry
- Circular mark with a clear **circle stroke** (`#1F6DB8`).
- Inner mortarboard in navy `#0E4E93` with light-blue center button `#7CAFE5`.
- Tassel ends with a small warm dot `#F59E0B` (optional small accent).
- Three sparkles to the right of the cap: `#1F6DB8`, `#7CAFE5`, `#5F9FDD`.

---

## 2. Color

| Token | Hex | Usage |
|---|---|---|
| Brand navy (primary) | `#0E4E93` | "Campus" wordmark, primary text on light |
| Brand blue (primary) | `#1F6DB8` | Circle stroke, primary actions |
| Accent light blue | `#7CAFE5` | Secondary accents, highlights |
| Accent cyan | `#5F9FDD` | Tertiary accents, sparkles |
| Accent warm | `#F59E0B` | Small optional highlight (tassel) |
| Background soft | `#EAF4FF` | Logo background, soft surfaces |
| AI gradient | `#0A6BFF → #39C1FF` | "AI" wordmark only |

> **Accessibility (contrast):**
> - `<body>` text on light background should use **navy `#0E4E93`** (contrast ≈ 9.5:1 vs white) — passes AA/AAA.
> - `#0A6BFF` on white ≈ **4.5:1** — passes AA for normal text.
> - `#1F6DB8` on white ≈ **5.6:1** — passes AA.
> - Do **not** use light blues (`#7CAFE5`, `#5F9FDD`) for body text — they are for accents/decoration only.

---

## 3. Typography

| Role | Font | Weight | Stack fallback |
|---|---|---|---|
| Brand heading | Poppins SemiBold | 600 | `'Poppins','Montserrat',-apple-system,'Segoe UI',sans-serif` |
| Body | Inter | 400 | `'Inter',-apple-system,'Segoe UI',system-ui,sans-serif` |
| UI copy | Poppins | 400 | `'Poppins',-apple-system,'Segoe UI',sans-serif` |

- Headings: **600** weight, tight tracking (`letter-spacing: -0.01em`).
- Body: **400** weight, `line-height: 1.6`.
- Avoid script/decorative fonts. Use only the licensed webfonts above.

---

## 4. Spacing & Layout

- **Clear space:** minimum **1 × the height of the letter "C"** in the wordmark on all sides of the logo.
- **Minimum sizes:**
  - Horizontal lockup min width: **150 px** (≈ **9.375 rem**).
  - Icon min size: **24 px** (≈ **1.5 rem**).
- **Navbar usage:**
  - Desktop: logo height **32–40 px** (2–2.5 rem).
  - Mobile: logo height **24–28 px** (1.5–1.75 rem).
- Keep the logo on solid brand or neutral backgrounds; never on busy imagery unless given a soft `#EAF4FF` plate.

---

## 5. Logo Usage Rules

- **Do:** use official SVGs; keep clear space; use monochrome on dark.
- **Don't:** stretch, recolor the gradient, rotate, add drop shadows arbitrarily, place on low-contrast backgrounds, or add text to the mark.
- For dark backgrounds, prefer **monochrome white** version.

### Accessibility
- Provide `aria-label="CampusAI"` for interactive SVG logos.
- Provide `alt="CampusAI — AI-powered education platform"` for `<img>` usage.
- Keep minimum touch target of 44×44 px around clickable logo in navbars.

---

## 6. Files Summary

| Category | Files |
|---|---|
| Vector | `campusai-logo-full.svg`, `campusai-icon.svg`, `campusai-logo-horizontal.svg`, `campusai-wordmark.svg`, `*-monochrome.svg` |
| Raster PNG | `campusai-icon-{48,96,144}.png`, `campusai-logo-horizontal-{150,300,450}.png` |
| Raster WebP | same sizes as PNG + `-optimized.webp` |
| Optimized AVIF | `campusai-logo-horizontal-optimized.avif` |
| Favicons | `campusai-favicon-16.png`, `campusai-favicon-32.png`, `campusai-favicon.ico` |

> Raster exports are transparent PNG/WebP (and AVIF). Keep SVGs as the editable source of truth.
