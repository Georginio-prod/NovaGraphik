<script setup lang="ts">
import NEyebrow from './NEyebrow.vue'

withDefaults(defineProps<{
  eyebrow?: string
  title: string
  intro?: string
  onDark?: boolean
  align?: 'left' | 'center'
  max?: number
}>(), {
  onDark: false,
  align: 'left',
  max: 640,
})
</script>

<template>
  <div
    :class="align === 'center' && 'text-center mx-auto'"
    :style="{ maxWidth: align === 'center' ? max + 'px' : undefined }"
  >
    <NEyebrow v-if="eyebrow" :on-dark="onDark" class="mb-3.5">{{ eyebrow }}</NEyebrow>
    <h2
      class="font-display font-semibold text-[clamp(30px,4vw,46px)] leading-[1.08] tracking-tight m-0"
      :class="onDark ? 'text-white' : 'text-fg-1'"
    >{{ title }}</h2>
    <p
      v-if="intro"
      class="text-[17px] leading-relaxed mt-4"
      :class="[
        onDark ? 'text-fg-on-dark-2' : 'text-fg-2',
        align === 'center' && 'mx-auto',
      ]"
      :style="{ maxWidth: max + 'px' }"
    >{{ intro }}</p>
  </div>
</template>
