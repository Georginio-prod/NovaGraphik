<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import NIcon from '@/components/base/NIcon.vue'

const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    class="w-[38px] h-[38px] rounded-sm border border-line-strong bg-nova-surface cursor-pointer grid place-items-center text-nova-navy transition-[border-color,background-color] duration-nova hover:border-nova-navy dark:text-nova-lime dark:hover:border-nova-lime"
    :aria-label="isDark ? 'Passer au thème clair' : 'Passer au thème sombre'"
    :title="isDark ? 'Thème clair' : 'Thème sombre'"
    @click="toggle"
  >
    <NIcon :name="isDark ? 'sun' : 'moon'" :size="17" />
  </button>
</template>
