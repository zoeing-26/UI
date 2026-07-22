/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        zoeing: {
          // ── 1. PRIMARY: Rig Navy ──────────────────────────────
          primary:         '#0F2A3D',
          'primary-light': '#19475C',
          'primary-dark':  '#0B2330',
          'primary-50':    '#EFF7FC',

          // ── 2. ACCENT: Machine Amber ───────────────────────────
          accent:          '#D9721A',
          'accent-light':  '#F2A251',
          'accent-dark':   '#B05E17',
          'accent-50':     '#FFFBEB',

          // ── 3. NEUTRAL surface ────────────────────────────────
          fog:             '#EFF7FC',
          precision:       '#EDEFF2',
          steel:           '#3A6B8A',
          success:         '#2E7D5B',
          danger:          '#B3401F',

          // ── Legacy aliases (all resolve to the new system palette) ──
          navy:            '#0F2A3D',
          'navy-light':    '#19475C',
          'navy-dark':     '#0B2330',
          gold:            '#D9721A',
          'gold-light':    '#F2A251',
          'gold-dark':     '#B05E17',
          // blue was previously #2563EB — merged into primary for consistency
          blue:            '#0F2A3D',
          'blue-light':    '#19475C',
          'blue-dark':     '#0B2330',
          // secondary is the accent (amber CTA color)
          secondary:          '#D9721A',
          'secondary-light':  '#F2A251',
          'secondary-dark':   '#B05E17',

          // ── Status (minimal, standard shades) ─────────────────
          success: '#2E7D5B',
          danger:  '#B3401F',
        },

        // brand-* aliases keep existing component code working unchanged
        brand: {
          blue:         '#0F2A3D',
          'blue-light': '#19475C',
          'blue-dark':  '#0B2330',
          yellow:       '#D9721A',
          'yellow-dark':'#B05E17',
          dark:         '#171717',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter Tight', 'IBM Plex Sans Condensed', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'JetBrains Mono', 'monospace'],
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
