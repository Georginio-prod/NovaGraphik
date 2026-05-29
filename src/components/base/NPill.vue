<script setup lang="ts">
withDefaults(defineProps<{ active?: boolean; accent?: boolean }>(), {
  active: false,
  accent: false,
})
</script>

<template>
  <button class="n-pill" :class="{ active, accent }">
    <slot />
  </button>
</template>

<style scoped>
.n-pill {
  font-family: var(--font-sans);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 7px 15px;
  border-radius: 999px;
  cursor: pointer;
  transition: all var(--dur) var(--ease-out);
  border: 1px solid var(--border-2);
  background: #fff;
  color: var(--fg-2);
}
.n-pill:hover { border-color: var(--nova-teal-300); }
.n-pill.active {
  border-color: transparent;
  background: var(--nova-navy);
  color: #fff;
}
.n-pill.accent {
  border-color: transparent;
  background: var(--nova-lime);
  color: #042b16;
}
</style>
