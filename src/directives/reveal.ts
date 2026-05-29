import type { Directive } from 'vue'

// Scroll-reveal: gentle fade + upward motion as elements enter the viewport.
// Restrained per the brand spec (ease-out, ~420ms, no bounce). A numeric binding
// value sets a stagger delay in ms (e.g. v-reveal="i * 60"). Respects
// prefers-reduced-motion by leaving content fully visible.
type RevealValue = number | { delay?: number } | undefined

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const OBS = Symbol('revealObserver')

export const vReveal: Directive<HTMLElement & { [OBS]?: IntersectionObserver }, RevealValue> = {
  mounted(el, binding) {
    if (prefersReduced) return

    const delay =
      typeof binding.value === 'number' ? binding.value : binding.value?.delay ?? 0
    if (delay) el.style.transitionDelay = `${delay}ms`

    el.classList.add('reveal-init')

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('reveal-in')
            obs.unobserve(el)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    el[OBS] = observer
  },
  unmounted(el) {
    el[OBS]?.disconnect()
  },
}
