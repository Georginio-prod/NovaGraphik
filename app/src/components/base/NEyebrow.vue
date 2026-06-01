<script setup lang="ts">
withDefaults(defineProps<{ onDark?: boolean }>(), { onDark: false })
</script>

<template>
  <div
    class="font-glyphic text-xs font-semibold tracking-[0.22em] uppercase"
    :class="onDark ? 'text-nova-lime' : 'text-nova-teal'"
  >
    <slot />
  </div>
</template>
