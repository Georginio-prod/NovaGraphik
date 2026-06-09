<script setup lang="ts">
import { ref } from 'vue'
import { CONTENT_ICONS } from '@/lib/icons'
import NIcon from '@/components/base/NIcon.vue'

const model = defineModel<string>({ default: '' })
const open = ref(false)

function pick(name: string) {
  model.value = name
  open.value = false
}
</script>

<template>
  <div class="relative inline-block">
    <button
      type="button"
      class="w-12 h-12 rounded-md border border-line-strong bg-nova-paper grid place-items-center text-nova-teal hover:border-nova-teal"
      @click="open = !open"
    >
      <NIcon :name="model || 'sparkles'" :size="22" />
    </button>
    <div
      v-if="open"
      class="absolute z-30 mt-2 w-[min(300px,calc(100vw-2rem))] max-h-[260px] overflow-auto bg-nova-surface border border-line rounded-md shadow-nova-md p-2 grid grid-cols-7 gap-1"
    >
      <button
        v-for="ic in CONTENT_ICONS"
        :key="ic"
        type="button"
        class="w-9 h-9 grid place-items-center rounded hover:bg-nova-fog"
        :class="model === ic && 'bg-nova-lime/20 text-nova-teal'"
        @click="pick(ic)"
      >
        <NIcon :name="ic" :size="18" />
      </button>
    </div>
  </div>
</template>
