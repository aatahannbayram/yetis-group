/**
 * Corporate / storefront motion tokens.
 * Panel workspace uses its own restrained motion; do not import this there.
 */

export const MOTION = {
  ease: [0.16, 1, 0.3, 1] as const,
  fast: 200,
  normal: 400,
  slow: 700,
  stagger: 60,
  revealY: 20,
  hoverY: -4,
  hoverScale: 1.05,
  heroScale: { from: 1.08, ms: 1400 },
  /** md+ only; mobile must stay 0 */
  parallaxHeroPx: 40,
  counterMs: 1200,
  faqMs: 300,
} as const;

export type MotionTokens = typeof MOTION;
