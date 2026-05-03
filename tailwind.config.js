/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        zoeing: {
          // ── 1. PRIMARY: Deep Teal ─────────────────────────────
          primary:         '#0D4C6A',
          'primary-light': '#1A6B8A',
          'primary-dark':  '#0A3A52',
          'primary-50':    '#EFF7FC',

          // ── 2. ACCENT: Warm Amber ─────────────────────────────
          accent:          '#D97706',
          'accent-light':  '#F59E0B',
          'accent-dark':   '#B45309',
          'accent-50':     '#FFFBEB',

          // ── 3. NEUTRAL surface ────────────────────────────────
          fog:             '#EFF7FC',

          // ── Legacy aliases (all resolve to same 2 brand colors) ──
          navy:            '#0D4C6A',
          'navy-light':    '#1A6B8A',
          'navy-dark':     '#0A3A52',
          gold:            '#D97706',
          'gold-light':    '#F59E0B',
          'gold-dark':     '#B45309',
          // blue was previously #2563EB — merged into primary for consistency
          blue:            '#0D4C6A',
          'blue-light':    '#1A6B8A',
          'blue-dark':     '#0A3A52',
          // secondary is the accent (amber CTA color)
          secondary:          '#D97706',
          'secondary-light':  '#F59E0B',
          'secondary-dark':   '#B45309',

          // ── Status (minimal, standard shades) ─────────────────
          success: '#059669',
        },

        // brand-* aliases keep existing component code working unchanged
        brand: {
          blue:         '#0D4C6A',
          'blue-light': '#1A6B8A',
          'blue-dark':  '#0A3A52',
          yellow:       '#D97706',
          'yellow-dark':'#B45309',
          dark:         '#171717',
        },
      },
      fontFamily: {
        sans:    ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        display: ['Barlow Condensed', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
      },
      screens: {
        xs: '375px', sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px',
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeSlideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        carouselFade: {
          '0%':   { opacity: '0', transform: 'scale(1.03)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        gentlePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%':      { transform: 'scale(1.05)', opacity: '0.7' },
        },
      },
      animation: {
        ticker:          'ticker 35s linear infinite',
        'fade-slide-down': 'fadeSlideDown 0.25s ease-out',
        'carousel-fade': 'carouselFade 0.5s ease-out',
        'float-y':       'floatY 6s ease-in-out infinite',
        'gentle-pulse':  'gentlePulse 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
