import type { Directive, DirectiveBinding } from 'vue'
import { gsap, ScrollTrigger, NOVA, prefersReducedMotion } from '@/lib/gsap'

// Scroll-reveal driven by GSAP ScrollTrigger, with several motion variants so
// sections feel distinct as you scroll. The directive ARG picks the effect:
//   v-reveal            → rise up (default)
//   v-reveal:left       → slide in from the left
//   v-reveal:right      → slide in from the right
//   v-reveal:scale      → scale + fade in
//   v-reveal:down       → drop down
//   v-reveal:fade       → opacity only
// The binding VALUE is a stagger delay in ms (e.g. v-reveal:left="i * 80"),
// or an object { delay, distance }. Respects prefers-reduced-motion.
type RevealValue = number | { delay?: number; distance?: number } | undefined
type RevealEl = HTMLElement & { [TWEEN]?: gsap.core.Tween }

const TWEEN = Symbol('revealTween')

function fromVars(arg: string | undefined, distance: number): gsap.TweenVars {
  switch (arg) {
    case 'left':
      return { opacity: 0, x: -distance }
    case 'right':
      return { opacity: 0, x: distance }
    case 'down':
      return { opacity: 0, y: -distance }
    case 'scale':
      return { opacity: 0, scale: 0.9 }
    case 'fade':
      return { opacity: 0 }
    case 'up':
    default:
      return { opacity: 0, y: distance }
  }
}

function build(el: RevealEl, binding: DirectiveBinding<RevealValue>) {
  if (prefersReducedMotion) return

  const v = binding.value
  const delayMs = typeof v === 'number' ? v : v?.delay ?? 0
  const distance = (typeof v === 'object' && v?.distance) || 42

  el[TWEEN] = gsap.from(el, {
    ...fromVars(binding.arg, distance),
    duration: 0.62,
    delay: delayMs / 1000,
    ease: NOVA.ease,
    clearProps: 'transform,opacity',
    scrollTrigger: {
      trigger: el,
      start: 'top 88%',
      once: true,
    },
  })
}

function teardown(el: RevealEl) {
  el[TWEEN]?.scrollTrigger?.kill()
  el[TWEEN]?.kill()
  ScrollTrigger.getAll()
    .filter((t) => t.trigger === el)
    .forEach((t) => t.kill())
}

export const vReveal: Directive<RevealEl, RevealValue> = {
  mounted: build,
  unmounted: teardown,
}
