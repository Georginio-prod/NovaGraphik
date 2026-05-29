<script setup lang="ts">
withDefaults(defineProps<{ onDark?: boolean }>(), { onDark: false })
</script>

<template>
  <div class="n-eyebrow" :class="{ 'on-dark': onDark }">
    <slot />
  </div>
</template>

<style scoped>
.n-eyebrow {
  font-family: var(--font-glyphic);
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--nova-teal);
}
.n-eyebrow.on-dark {
  color: var(--nova-lime);
}
</style>
