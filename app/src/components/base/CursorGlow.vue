<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { prefersReducedMotion } from '@/lib/gsap'

// A soft green ring that trails the cursor with smooth easing and grows over
// interactive elements. Disabled on touch devices and when the user prefers
// reduced motion. Purely decorative — never intercepts clicks.
const ring = ref<HTMLElement | null>(null)
let raf = 0
let enabled = false
let visible = false
const target = { x: -100, y: -100 }
const pos = { x: -100, y: -100 }

function move(e: MouseEvent) {
  target.x = e.clientX
  target.y = e.clientY
  if (!visible) {
    visible = true
    ring.value?.classList.add('is-visible')
  }
}
function leaveWindow() {
  visible = false
  ring.value?.classList.remove('is-visible')
}
function over(e: MouseEvent) {
  const el = e.target as HTMLElement
  const interactive = !!el.closest?.('a, button, [role="button"], input, select, textarea, label')
  ring.value?.classList.toggle('is-grow', interactive)
}
function down() { ring.value?.classList.add('is-press') }
function up() { ring.value?.classList.remove('is-press') }

function loop() {
  pos.x += (target.x - pos.x) * 0.2
  pos.y += (target.y - pos.y) * 0.2
  if (ring.value) ring.value.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  if (prefersReducedMotion) return
  if (window.matchMedia('(pointer: coarse)').matches) return
  enabled = true
  window.addEventListener('mousemove', move, { passive: true })
  document.addEventListener('mouseover', over, { passive: true })
  document.addEventListener('mousedown', down, { passive: true })
  document.addEventListener('mouseup', up, { passive: true })
  document.documentElement.addEventListener('mouseleave', leaveWindow)
  loop()
})
onBeforeUnmount(() => {
  if (!enabled) return
  cancelAnimationFrame(raf)
  window.removeEventListener('mousemove', move)
  document.removeEventListener('mouseover', over)
  document.removeEventListener('mousedown', down)
  document.removeEventListener('mouseup', up)
  document.documentElement.removeEventListener('mouseleave', leaveWindow)
})
</script>

<template>
  <div ref="ring" class="cursor-glow" aria-hidden="true" />
</template>

<style scoped>
.cursor-glow {
  position: fixed;
  top: 0;
  left: 0;
  width: 26px;
  height: 26px;
  border-radius: 9999px;
  border: 1.5px solid #0cf25d;
  background: radial-gradient(circle, rgba(12, 242, 93, 0.18), transparent 68%);
  box-shadow: 0 0 14px rgba(12, 242, 93, 0.4);
  pointer-events: none;
  z-index: 9999;
  opacity: 0;
  transition:
    opacity 0.25s ease,
    width 0.2s ease,
    height 0.2s ease,
    background 0.2s ease;
  will-change: transform;
}
.cursor-glow.is-visible {
  opacity: 1;
}
.cursor-glow.is-grow {
  width: 46px;
  height: 46px;
  background: radial-gradient(circle, rgba(12, 242, 93, 0.26), transparent 68%);
}
.cursor-glow.is-press {
  width: 20px;
  height: 20px;
}
/* No custom cursor on touch screens. */
@media (pointer: coarse) {
  .cursor-glow {
    display: none;
  }
}
</style>
