import type { Directive } from 'vue'

// Placeholder no-op. The real scroll-reveal (IntersectionObserver + fade/upward
// motion, respecting prefers-reduced-motion) lands on the feat/animations branch.
// Elements stay fully visible until then, so this is a safe fallback.
export const vReveal: Directive = {}
