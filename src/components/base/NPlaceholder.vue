<script setup lang="ts">
import { computed } from 'vue'
import { novaGrad } from '@/lib/gradients'

const props = withDefaults(defineProps<{
  label?: string
  idx?: number
  height?: number | string
  radius?: string
  src?: string
}>(), {
  idx: 0,
  height: 200,
  radius: 'rounded-lg',
})

const heightCss = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height,
)
</script>

<template>
  <div
    class="relative overflow-hidden flex items-end p-4 box-border"
    :class="radius"
    :style="{ height: heightCss, background: novaGrad(idx) }"
  >
    <img v-if="src" :src="src" alt="" class="absolute inset-0 w-full h-full object-cover" />
    <img
      v-else
      src="/assets/compass-mark-white.png"
      alt=""
      class="absolute -right-[30px] -top-[30px] w-[150px] opacity-10 pointer-events-none"
    />
    <span
      v-if="label"
      class="relative font-glyphic text-[11px] tracking-[0.18em] uppercase text-white/90 font-semibold"
    >{{ label }}</span>
    <slot />
  </div>
</template>
