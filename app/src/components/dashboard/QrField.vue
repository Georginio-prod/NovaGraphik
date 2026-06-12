<script setup lang="ts">
import { ref, watch } from 'vue'
import { qrDataUrl } from '@/lib/qr'
import NIcon from '@/components/base/NIcon.vue'

// Dashboard field: the admin types the URL/text the QR should encode, sees a live
// QR preview, and can download it as a PNG. The encoded value is persisted in the
// promotion row (qr_target) and re-rendered client-side in the public section.
const model = defineModel<string>({ default: '' })
const props = withDefaults(defineProps<{ placeholder?: string; downloadName?: string }>(), {
  placeholder: 'https://… (lien encodé dans le QR code)',
  downloadName: 'qr-code',
})

const inputClass =
  'w-full box-border font-sans text-fg-1 bg-nova-paper border border-line-strong rounded-sm px-3.5 py-3 outline-none transition-[border-color,box-shadow,background] duration-nova focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)] focus:bg-nova-surface'

const dataUrl = ref('')
watch(
  model,
  async (v) => {
    try {
      dataUrl.value = await qrDataUrl(v || '', 220)
    } catch {
      dataUrl.value = ''
    }
  },
  { immediate: true },
)

function download() {
  if (!dataUrl.value) return
  const a = document.createElement('a')
  a.href = dataUrl.value
  a.download = `${props.downloadName}.png`
  a.click()
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <input v-model="model" type="url" :class="inputClass" :placeholder="placeholder" />
    <div class="flex items-center gap-4">
      <img
        v-if="dataUrl"
        :src="dataUrl"
        alt="Aperçu QR code"
        class="w-[130px] h-[130px] rounded-md border border-line bg-white shrink-0"
      />
      <div v-else class="w-[130px] h-[130px] rounded-md border border-dashed border-line-strong grid place-items-center text-[11px] text-fg-3 text-center px-2 shrink-0">
        Saisissez un lien pour générer le QR
      </div>
      <button
        type="button"
        :disabled="!dataUrl"
        class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-nova-teal hover:underline disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
        @click="download"
      >
        <NIcon name="download" :size="15" /> Télécharger le QR (PNG)
      </button>
    </div>
  </div>
</template>
