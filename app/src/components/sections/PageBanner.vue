<script setup lang="ts">
import { useViewport } from '@/composables/useViewport'
import NEyebrow from '@/components/base/NEyebrow.vue'

defineProps<{
  eyebrow: string
  title: string
  intro?: string
}>()

const { isMobile } = useViewport()
</script>

<template>
  <section class="bg-nova-navy-900 relative overflow-hidden">
    <img
      src="/assets/compass-mark-white.png"
      alt=""
      class="absolute -right-[60px] -top-[60px] w-80 opacity-[0.08] pointer-events-none"
    />
    <div
      class="mx-auto max-w-[1200px] relative"
      :class="isMobile ? 'px-5 py-14 pb-12' : 'px-8 pt-[88px] pb-[72px]'"
    >
      <NEyebrow on-dark v-enter="0" class="mb-[18px]">{{ eyebrow }}</NEyebrow>
      <h1
        v-enter="1"
        class="font-display font-semibold text-[clamp(38px,5.5vw,64px)] leading-[1.02] tracking-tight text-white m-0 max-w-[760px]"
      >{{ title }}</h1>
      <p
        v-if="intro"
        v-enter="2"
        class="text-[17px] leading-relaxed text-fg-on-dark-2 max-w-[580px] mt-[22px] mb-0"
      >{{ intro }}</p>
    </div>
  </section>
</template>
