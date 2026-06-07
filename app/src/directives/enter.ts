import type { Directive } from 'vue'
import { gsap, NOVA, prefersReducedMotion } from '@/lib/gsap'

// Above-the-fold entrance: a clear rise + slight scale the moment the element
// mounts (no scroll trigger). Use on hero/banner content visible on load.
// The binding value is a 0-based order index used to stagger the sequence
// (e.g. v-enter="0", v-enter="1" …). Respects prefers-reduced-motion.
type EnterValue = number | undefined

const STAGGER = 0.1 // seconds between successive items

export const vEnter: Directive<HTMLElement, EnterValue> = {
  mounted(el, binding) {
    if (prefersReducedMotion) return

    const order = typeof binding.value === 'number' ? binding.value : 0

    gsap.from(el, {
      opacity: 0,
      y: 28,
      scale: 0.98,
      duration: 0.72,
      delay: order * STAGGER,
      ease: NOVA.ease,
      clearProps: 'transform,opacity',
    })
  },
}
