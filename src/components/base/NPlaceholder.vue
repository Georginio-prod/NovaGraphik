<script setup lang="ts">
import { computed } from 'vue'
import { novaGrad } from '@/lib/gradients'

const props = withDefaults(defineProps<{
  label?: string
  idx?: number
  height?: number | string
  radius?: string
  /** optional real image source; when set it fills the surface */
  src?: string
}>(), {
  idx: 0,
  height: 200,
  radius: 'var(--r-lg)',
})

const heightCss = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height,
)
</script>

<template>
  <div
    class="n-ph"
    :style="{ height: heightCss, borderRadius: radius, background: novaGrad(idx) }"
  >
    <img v-if="src" :src="src" alt="" class="real" />
    <img v-else src="/assets/compass-mark-white.png" alt="" class="watermark" />
    <span v-if="label" class="label">{{ label }}</span>
    <slot />
  </div>
</template>

<style scoped>
.n-ph {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: 16px;
  box-sizing: border-box;
}
.watermark {
  position: absolute;
  right: -30px;
  top: -30px;
  width: 150px;
  opacity: 0.1;
  pointer-events: none;
}
.real {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.label {
  position: relative;
  font-family: var(--font-glyphic);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 600;
}
</style>
