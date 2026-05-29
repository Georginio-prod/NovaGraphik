<script setup lang="ts">
import { useViewport } from '@/composables/useViewport'
const { isMobile } = useViewport()
</script>

<template>
  <div class="mx-auto max-w-[1200px]" :class="isMobile ? 'px-5' : 'px-8'">
    <slot />
  </div>
</template>
