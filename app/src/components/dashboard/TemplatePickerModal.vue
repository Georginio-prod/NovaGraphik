<script setup lang="ts">
import { TEMPLATES } from '@/lib/templates'
import NIcon from '@/components/base/NIcon.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'pick', key: string): void; (e: 'close'): void }>()
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" @click.self="emit('close')">
    <div class="w-full max-w-[640px] bg-nova-surface rounded-xl shadow-nova-lg p-6 max-h-[85vh] overflow-auto">
      <div class="flex justify-between items-center mb-1">
        <h3 class="font-display text-2xl font-semibold text-fg-1 m-0">Choisir un modèle de section</h3>
        <button class="text-fg-3 hover:text-fg-1" @click="emit('close')"><NIcon name="x" :size="20" /></button>
      </div>
      <p class="text-[13px] text-fg-3 mt-0 mb-5">Chaque modèle reprend le design du site.</p>
      <div class="grid grid-cols-1 tab:grid-cols-2 gap-3">
        <button
          v-for="t in TEMPLATES"
          :key="t.key"
          type="button"
          class="text-left border border-line rounded-lg p-4 hover:border-nova-teal hover:shadow-nova-sm transition flex gap-3"
          @click="emit('pick', t.key)"
        >
          <div class="w-10 h-10 rounded-md bg-nova-fog grid place-items-center text-nova-teal shrink-0">
            <NIcon :name="t.previewIcon" :size="20" />
          </div>
          <div>
            <div class="font-semibold text-fg-1 text-[14px]">{{ t.label }}</div>
            <div class="text-[12px] text-fg-3 leading-snug mt-0.5">{{ t.description }}</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
