import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

// Mirrors the design system's responsive breakpoints (mobile < 760, tablet < 1040).
export function useViewport() {
  const { width } = useWindowSize()
  const isMobile = computed(() => width.value < 760)
  const isTablet = computed(() => width.value >= 760 && width.value < 1040)
  return { width, isMobile, isTablet }
}
