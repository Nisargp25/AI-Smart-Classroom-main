# CampusAI — Asset Usage Guide (React + Tailwind)

## 1. Copy assets into your app

Place the SVGs and raster files where your bundler can import them, e.g. `frontend/src/assets/brand/`.

```bash
mkdir -p frontend/src/assets/brand
cp brand/svg/campusai-logo-horizontal.svg frontend/src/assets/brand/
cp brand/svg/campusai-icon.svg frontend/src/assets/brand/
# favicons -> public/
cp brand/favicon/campusai-favicon-32.png frontend/public/
cp brand/favicon/campusai-favicon-16.png frontend/public/
cp brand/favicon/campusai-favicon.ico frontend/public/
```

## 2. React component

Use the `CampusAiLogo` component (in `frontend/src/components/CampusAiLogo.jsx`). It renders inline SVG and accepts `className`, `width`, `height`, `aria-label`, `variant` (`icon` default | `horizontal`), and `monochrome`. It also falls back to an `<img>` with `srcSet` if you pass a `src`.

```jsx
import { CampusAiLogo } from './components/CampusAiLogo';

// Inline SVG — square icon mark (default)
<CampusAiLogo className="h-8 w-8" aria-label="CampusAI" />

// Horizontal lockup (mark + wordmark)
<CampusAiLogo variant="horizontal" className="h-8" aria-label="CampusAI" />

// Monochrome (single color via currentColor) for dark/light backgrounds
<CampusAiLogo variant="horizontal" monochrome className="h-8 text-white" aria-label="CampusAI" />

// Fixed size
<CampusAiLogo width={150} height={50} />

// Raster fallback with srcSet (PNG/WebP)
<CampusAiLogo
  src="/assets/campusai-logo-horizontal-150.png"
  srcSet="/assets/campusai-logo-horizontal-300.png 2x, /assets/campusai-logo-horizontal-450.png 3x"
  alt="CampusAI — AI-powered education platform"
/>
```

## 3. Tailwind tokens

Add brand tokens to `frontend/tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      'brand-primary': {
        DEFAULT: '#1F6DB8',
        navy: '#0E4E93',
        blue: '#1F6DB8',
      },
      'brand-accent': {
        light: '#7CAFE5',
        cyan: '#5F9FDD',
        warm: '#F59E0B',
      },
      'brand-muted': {
        DEFAULT: '#7CAFE5',
        soft: '#EAF4FF',
      },
    },
    borderRadius: {
      brand: '8px', // 'md'
    },
    fontFamily: {
      brand: ["'Poppins'", "'Montserrat'", "sans-serif"],
      body: ["'Inter'", "sans-serif"],
    },
  },
}
```

Then use utilities like `bg-brand-primary`, `text-brand-primary-navy`, `rounded-brand`, `font-brand`.

## 4. Favicons in `public/index.html`

```html
<link rel="icon" type="image/png" sizes="32x32" href="/campusai-favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/campusai-favicon-16.png" />
<link rel="icon" type="image/x-icon" href="/campusai-favicon.ico" />
```

## 5. Navbar sizing

```jsx
<CampusAiLogo className="h-8 w-8 hidden sm:block" />      {/* desktop 32px */}
<CampusAiLogo className="h-6 w-6 block sm:hidden" />     {/* mobile 24px */}
```

## 6. Fonts

Add Google Fonts link for Poppins (600) and Inter (400) in `public/index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400&family=Poppins:wght@400;600&display=swap" rel="stylesheet" />
```

## Recommended commit message

```
chore(brand): add CampusAI logo and brand assets
