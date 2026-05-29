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
    class="n-secthead"
    :class="{ center: align === 'center' }"
    :style="{ maxWidth: align === 'center' ? max + 'px' : 'none' }"
  >
    <NEyebrow v-if="eyebrow" :on-dark="onDark" style="margin-bottom: 14px;">{{ eyebrow }}</NEyebrow>
    <h2 class="title" :class="{ 'on-dark': onDark }">{{ title }}</h2>
    <p
      v-if="intro"
      class="intro"
      :class="{ 'on-dark': onDark }"
      :style="{ maxWidth: max + 'px' }"
    >{{ intro }}</p>
  </div>
</template>

<style scoped>
.n-secthead.center {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
.title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(30px, 4vw, 46px);
  line-height: 1.08;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--fg-1);
}
.title.on-dark { color: #fff; }
.intro {
  font-size: 17px;
  line-height: 1.6;
  margin: 16px 0 0;
  color: var(--fg-2);
}
.intro.on-dark { color: var(--fg-on-dark-2); }
.n-secthead.center .intro { margin-left: auto; margin-right: auto; }
</style>
