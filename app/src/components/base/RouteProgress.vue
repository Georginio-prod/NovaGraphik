<script setup lang="ts">
import { useLoadingBar } from '@/composables/useLoadingBar'

// Thin Nova-lime bar pinned to the top of the viewport. Driven by the global
// loading state (router navigations + any wrapped async work).
const { progress, visible } = useLoadingBar()
</script>

<template>
  <Transition name="route-progress">
    <div v-show="visible" class="fixed inset-x-0 top-0 z-[100] h-[3px] pointer-events-none">
      <div
        class="h-full bg-nova-lime shadow-[0_0_10px_rgba(12,242,93,0.7)] transition-[width] duration-200 ease-out"
        :style="{ width: progress + '%' }"
      />
    </div>
  </Transition>
</template>

<style scoped>
.route-progress-enter-active,
.route-progress-leave-active {
  transition: opacity 0.3s ease;
}
.route-progress-enter-from,
.route-progress-leave-to {
  opacity: 0;
}
</style>
