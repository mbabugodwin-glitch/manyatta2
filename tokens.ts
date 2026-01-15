/**
 * Design Tokens
 * Centralized typography, spacing, colors, and breakpoints
 */

// ============ TYPOGRAPHY ============
export const TYPOGRAPHY = {
  fontFamily: {
    serif: '"Playfair Display", serif',
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ============ SPACING ============
export const SPACING = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  7: '1.75rem',  // 28px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  14: '3.5rem',  // 56px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
} as const;

// ============ COLORS ============
export const COLORS = {
  // Primary
  primary: '#d4492f',
  primaryLight: '#e65a3a',
  primaryDark: '#b8391f',
  primaryBg: '#f5f1ed',

  // Neutral
  dark: '#1a1a1a',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  white: '#ffffff',
  black: '#000000',

  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Backgrounds
  bgDark: '#0f172a',
  bgLight: '#f8f9fa',
} as const;

// ============ BREAKPOINTS ============
export const BREAKPOINTS = {
  xs: '0px',      // Mobile
  sm: '640px',    // Small mobile
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Large desktop
  '2xl': '1536px', // Extra large
} as const;

export const MEDIA_QUERIES = {
  xs: '(min-width: 0px)',
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const;

// ============ SHADOWS ============
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '3xl': '0 35px 60px -15px rgb(0 0 0 / 0.3)',
} as const;

// ============ BORDER RADIUS ============
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// ============ TRANSITIONS ============
export const TRANSITIONS = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============ Z-INDEX ============
export const Z_INDEX = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  notification: 1070,
} as const;

// ============ COMPONENT PRESETS ============
export const COMPONENT_STYLES = {
  // Button styles
  button: {
    base: 'font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
    primary: 'bg-primary hover:bg-primaryDark text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    ghost: 'text-gray-700 hover:bg-gray-100',
  },

  // Input styles
  input: {
    base: 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors',
    error: 'border-error focus:ring-error/20',
  },

  // Card styles
  card: {
    base: 'bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow',
    dark: 'bg-dark rounded-2xl border border-gray-700 shadow-lg',
  },

  // Container
  container: {
    max: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  },
} as const;

// ============ IMAGE RESPONSIVE SIZES ============
export const IMAGE_SIZES = {
  hero: '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw',
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  thumbnail: '(max-width: 640px) 100vw, (max-width: 1024px) 25vw, 20vw',
  logo: '(max-width: 640px) 80px, 120px',
  icon: '40px',
} as const;

// ============ DEVICE SIZES (for image optimization) ============
export const DEVICE_SIZES = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
  ultrawide: 1920,
} as const;
