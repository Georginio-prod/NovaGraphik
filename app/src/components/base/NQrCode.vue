<script setup lang="ts">
import { ref, watch } from 'vue'
import { qrDataUrl } from '@/lib/qr'

// Renders a QR code <img> generated from `value`. Used both in the dashboard
// (live preview while editing) and on the public page (client-facing section).
const props = withDefaults(defineProps<{ value: string; size?: number }>(), { size: 240 })

const dataUrl = ref('')
const error = ref(false)

async function regen() {
  error.value = false
  try {
    dataUrl.value = await qrDataUrl(props.value, props.size)
  } catch {
    dataUrl.value = ''
    error.value = true
  }
}

watch(() => [props.value, props.size], regen, { immediate: true })

defineExpose({ dataUrl })
</script>

<template>
  <img
    v-if="dataUrl"
    :src="dataUrl"
    alt="QR code"
    :width="size"
    :height="size"
    class="block rounded-md bg-white"
    :style="{ width: size + 'px', height: size + 'px' }"
  />
  <div
    v-else
    class="grid place-items-center rounded-md bg-nova-fog text-[11px] text-fg-3"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    {{ error ? 'Erreur QR' : 'Aucun lien à encoder' }}
  </div>
</template>
