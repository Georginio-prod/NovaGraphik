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

const classes = computed(() => {
  const base =
    'font-sans font-semibold cursor-pointer border border-transparent rounded-sm inline-flex items-center justify-center gap-2 tracking-wide whitespace-nowrap no-underline transition-all duration-nova ease-nova active:scale-[0.98]'
  const sizes = {
    sm: 'text-xs px-4 py-2',
    md: 'text-[13px] px-6 py-3',
    lg: 'text-[15px] px-[30px] py-[15px]',
  }
  const variants = {
    accent:
      'bg-nova-lime text-[#042b16] shadow-nova-lime hover:brightness-105 hover:-translate-y-px',
    primary: 'bg-nova-navy text-white hover:bg-nova-navy-700',
    ghost: 'bg-transparent text-nova-navy border-line-strong hover:border-nova-navy',
    ghostDark:
      'bg-transparent text-white border-white/30 hover:border-white hover:bg-white/10',
    white: 'bg-nova-surface text-nova-navy hover:bg-nova-paper',
  }
  return [
    base,
    sizes[props.size],
    variants[props.variant],
    props.caps && 'font-glyphic tracking-[0.18em] uppercase',
    props.block && 'w-full',
  ]
})
</script>

<template>
  <component :is="tag" :to="to" :class="classes">
    <slot />
    <NIcon v-if="icon" :name="icon" :size="iconSize" />
  </component>
</template>
