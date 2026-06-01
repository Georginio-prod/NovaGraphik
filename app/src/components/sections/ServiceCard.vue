<script setup lang="ts">
import NIcon from '@/components/base/NIcon.vue'
defineProps<{ icon: string; title: string; desc: string }>()
</script>

<template>
  <div
    class="group bg-nova-surface rounded-lg px-[22px] py-[26px] border border-line shadow-nova-xs transition-all duration-nova ease-nova hover:border-nova-teal-300 hover:shadow-nova-md hover:-translate-y-[3px]"
  >
    <div
      class="w-[46px] h-[46px] rounded-md bg-nova-fog grid place-items-center text-nova-teal transition-[background,color] duration-nova group-hover:bg-nova-lime group-hover:text-[#042b16]"
    >
      <NIcon :name="icon" :size="22" />
    </div>
    <h3 class="font-sans text-base font-semibold my-[18px_6px] text-fg-1 tracking-tight">{{ title }}</h3>
    <p class="text-[13px] leading-snug text-fg-3 m-0">{{ desc }}</p>
  </div>
</template>
