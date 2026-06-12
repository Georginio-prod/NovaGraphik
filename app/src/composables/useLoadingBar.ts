import { ref } from 'vue'

// Global top progress bar (NProgress-style). Any async flow can bracket itself
// with start()/done(); nested calls are reference-counted so the bar only
// finishes once everything settles. The router uses it on every navigation, so
// every page/section transition shows a loading indicator.
const progress = ref(0)
const visible = ref(false)
let active = 0
let trickle: ReturnType<typeof setInterval> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

function stopTrickle() {
  if (trickle) {
    clearInterval(trickle)
    trickle = null
  }
}

export function startLoading() {
  active++
  if (active > 1) return
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  visible.value = true
  progress.value = 8
  stopTrickle()
  // Ease toward 90% so the bar always feels alive without ever completing early.
  trickle = setInterval(() => {
    const remaining = 90 - progress.value
    if (remaining > 0) progress.value += Math.max(0.4, remaining * 0.08)
  }, 200)
}

export function doneLoading() {
  active = Math.max(0, active - 1)
  if (active > 0) return
  stopTrickle()
  progress.value = 100
  hideTimer = setTimeout(() => {
    visible.value = false
    progress.value = 0
  }, 280)
}

export function useLoadingBar() {
  return { progress, visible, startLoading, doneLoading }
}
