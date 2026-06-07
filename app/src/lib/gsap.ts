// NOVA GRAPHIK — central GSAP setup.
//
// Single place where GSAP and its plugins are configured so the whole site
// shares one instance, one registered ScrollTrigger, and the exact brand easing.
// The brand spec calls for restrained motion (ease-out, no bounce), so we mirror
// the CSS token `--ease-nova` = cubic-bezier(0.22, 0.61, 0.36, 1) as a CustomEase.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger, CustomEase)

// A cubic-bezier maps 1:1 to an SVG cubic path "M0,0 C{x1},{y1} {x2},{y2} 1,1".
// This reproduces --ease-nova exactly so GSAP and CSS transitions feel identical.
CustomEase.create('nova', 'M0,0 C0.22,0.61 0.36,1 1,1')

// Brand motion tokens (seconds), aligned with the CSS --duration-nova-* scale.
export const NOVA = {
  ease: 'nova',
  durations: { fast: 0.14, base: 0.24, slow: 0.42 },
} as const

export const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export { gsap, ScrollTrigger, CustomEase }
