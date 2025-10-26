/**
 * TechBridge Learning Brand Theme Tokens
 * These values define the official brand colors and design system
 */

export const brand = {
  colors: {
    primary: "#0C5DBA", // TechBridge Learning blue
    primaryFg: "#ffffff",
    bg: "#ffffff",
    text: "#0F172A",
    muted: "#F1F5F9",
    success: "#16A34A",
    warn: "#D97706",
    danger: "#DC2626",
  },
  radii: {
    card: "1rem",
    pill: "9999px",
  },
  spacing: {
    section: "4rem",
    component: "1.5rem",
  },
  typography: {
    fontFamily: {
      sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
  },
} as const;

/**
 * Accessibility helpers
 */
export const a11y = {
  minTouchTarget: "44px", // WCAG 2.1 AAA minimum
  focusRingWidth: "2px",
  focusRingOffset: "2px",
} as const;

