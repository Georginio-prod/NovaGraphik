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
  <section class="banner">
    <img src="/assets/compass-mark-white.png" alt="" class="mark" />
    <div class="inner" :class="{ 'is-mobile': isMobile }">
      <NEyebrow on-dark style="margin-bottom: 18px;">{{ eyebrow }}</NEyebrow>
      <h1 class="title">{{ title }}</h1>
      <p v-if="intro" class="intro">{{ intro }}</p>
    </div>
  </section>
</template>

<style scoped>
.banner {
  background: var(--nova-navy-900);
  position: relative;
  overflow: hidden;
}
.mark {
  position: absolute;
  right: -60px;
  top: -60px;
  width: 320px;
  opacity: 0.08;
  pointer-events: none;
}
.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 88px 32px 72px;
  position: relative;
}
.inner.is-mobile { padding: 56px 20px 48px; }
.title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(38px, 5.5vw, 64px);
  line-height: 1.02;
  letter-spacing: -0.025em;
  color: #fff;
  margin: 0;
  max-width: 760px;
}
.intro {
  font-size: 17px;
  line-height: 1.6;
  color: var(--fg-on-dark-2);
  max-width: 580px;
  margin: 22px 0 0;
}
</style>
