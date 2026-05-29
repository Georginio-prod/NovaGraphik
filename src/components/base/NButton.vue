<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import NIcon from './NIcon.vue'

const props = withDefaults(defineProps<{
  variant?: 'accent' | 'primary' | 'ghost' | 'ghostDark' | 'white'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  caps?: boolean
  to?: string
  block?: boolean
}>(), {
  variant: 'accent',
  size: 'md',
  caps: false,
  block: false,
})

const iconSize = computed(() => (props.size === 'lg' ? 18 : 15))
const tag = computed(() => (props.to ? RouterLink : 'button'))
</script>

<template>
  <component
    :is="tag"
    :to="to"
    class="n-btn"
    :class="[`v-${variant}`, `s-${size}`, { caps, block }]"
  >
    <slot />
    <NIcon v-if="icon" :name="icon" :size="iconSize" />
  </component>
</template>

<style scoped>
.n-btn {
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: var(--r-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.04em;
  text-transform: none;
  white-space: nowrap;
  text-decoration: none;
  transition: all var(--dur) var(--ease-out);
}
.n-btn.caps {
  font-family: var(--font-glyphic);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.n-btn.block { width: 100%; }

/* sizes */
.s-md { font-size: 13px; padding: 12px 24px; }
.s-lg { font-size: 15px; padding: 15px 30px; }
.s-sm { font-size: 12px; padding: 8px 16px; }

/* variants */
.v-accent { background: var(--nova-lime); color: #042b16; box-shadow: var(--shadow-lime); }
.v-accent:hover { filter: brightness(1.05); transform: translateY(-1px); }

.v-primary { background: var(--nova-navy); color: #fff; }
.v-primary:hover { background: var(--brand-hover); }

.v-ghost { background: transparent; color: var(--nova-navy); border-color: var(--border-2); }
.v-ghost:hover { border-color: var(--nova-navy); }

.v-ghostDark { background: transparent; color: #fff; border-color: rgba(255,255,255,.28); }
.v-ghostDark:hover { border-color: #fff; background: rgba(255,255,255,.08); }

.v-white { background: #fff; color: var(--nova-navy); }
.v-white:hover { background: var(--nova-paper); }

.n-btn:active { transform: scale(.98); }
</style>
