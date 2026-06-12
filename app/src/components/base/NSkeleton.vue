<script setup lang="ts">
// Reusable shimmer placeholder. Drop in wherever async content lands to show a
// loading state instead of empty space (or flashing fallback). Honors
// prefers-reduced-motion via the .nova-skeleton CSS (animation neutralised).
withDefaults(
  defineProps<{ width?: string; height?: string; radius?: string; class?: string }>(),
  { width: '100%', height: '1rem', radius: 'rounded-md' },
)
</script>

<template>
  <div class="nova-skeleton" :class="[radius, $props.class]" :style="{ width, height }" />
</template>
