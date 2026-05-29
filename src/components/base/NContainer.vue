<script setup lang="ts">
import { useViewport } from '@/composables/useViewport'
const { isMobile } = useViewport()
</script>

<template>
  <div class="n-container" :class="{ 'is-mobile': isMobile }">
    <slot />
  </div>
</template>

<style scoped>
.n-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}
.n-container.is-mobile {
  padding: 0 20px;
}
</style>
