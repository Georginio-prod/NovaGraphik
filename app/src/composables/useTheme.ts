import { computed, watch } from 'vue'
import { usePreferredDark, useStorage } from '@vueuse/core'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'nova-theme'

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.style.colorScheme = mode
}

/** Restores theme from storage (call once at app startup). */
export function initTheme() {
  let mode: ThemeMode = 'light'
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    if (stored === 'light' || stored === 'dark') {
      mode = stored
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      mode = 'dark'
    }
  } catch {
    /* private browsing */
  }
  applyTheme(mode)
}

export function useTheme() {
  const preferredDark = usePreferredDark()
  const stored = useStorage<ThemeMode | null>(STORAGE_KEY, null)

  const mode = computed<ThemeMode>(() => {
    if (stored.value === 'light' || stored.value === 'dark') return stored.value
    return preferredDark.value ? 'dark' : 'light'
  })

  const isDark = computed(() => mode.value === 'dark')

  watch(
    mode,
    (value) => applyTheme(value),
    { immediate: true },
  )

  function toggle() {
    stored.value = mode.value === 'dark' ? 'light' : 'dark'
  }

  function setTheme(value: ThemeMode) {
    stored.value = value
  }

  return { mode, isDark, toggle, setTheme }
}
