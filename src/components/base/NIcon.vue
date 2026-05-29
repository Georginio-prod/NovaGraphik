<script setup lang="ts">
import { computed } from 'vue'
import { ICONS } from '@/lib/icons'

const props = withDefaults(defineProps<{
  name: string
  size?: number
  color?: string
  strokeWidth?: number
}>(), {
  size: 18,
  strokeWidth: 1.75,
})

const cmp = computed(() => ICONS[props.name])
</script>

<template>
  <component
    :is="cmp"
    v-if="cmp"
    :size="size"
    :color="color"
    :stroke-width="strokeWidth"
    :absolute-stroke-width="true"
    style="display: inline-block; flex: none;"
  />
</template>
