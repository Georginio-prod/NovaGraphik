<script setup lang="ts">
defineProps<{ active?: boolean; accent?: boolean }>()
</script>

<template>
  <button
    class="font-sans text-[11.5px] font-semibold tracking-wider uppercase px-[15px] py-[7px] rounded-full cursor-pointer transition-all duration-nova ease-nova border"
    :class="
      accent
        ? 'border-transparent bg-nova-lime text-[#042b16]'
        : active
          ? 'border-transparent bg-nova-navy text-white'
          : 'border-line-strong bg-nova-surface text-fg-2 hover:border-nova-teal-300'
    "
  >
    <slot />
  </button>
</template>
