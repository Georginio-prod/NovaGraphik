<script setup lang="ts">
import { ref } from 'vue'
import { uploadImage } from '@/composables/useUpload'
import NIcon from '@/components/base/NIcon.vue'
import ImageCropper from './ImageCropper.vue'

const model = defineModel<string>({ default: '' })
withDefaults(defineProps<{ height?: number; aspect?: number; round?: boolean; lockFormat?: boolean }>(), {
  height: 140,
  round: false,
  lockFormat: false,
})

const busy = ref(false)
const err = ref('')
const input = ref<HTMLInputElement | null>(null)

// Crop flow: a picked file (or the current image) is opened in the cropper, and
// only the framed + downscaled result gets uploaded.
const cropSrc = ref<string | null>(null)
let objectUrl: string | null = null

function pickFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  releaseUrl()
  objectUrl = URL.createObjectURL(file)
  cropSrc.value = objectUrl
}

function adjustExisting() {
  if (model.value) cropSrc.value = model.value
}

function releaseUrl() {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
}

function closeCropper() {
  cropSrc.value = null
  releaseUrl()
  if (input.value) input.value.value = ''
}

async function onCropConfirm(blob: Blob) {
  cropSrc.value = null
  releaseUrl()
  busy.value = true
  err.value = ''
  try {
    model.value = await uploadImage(blob, 'photo.jpg')
  } catch (e) {
    err.value = e instanceof Error ? e.message : 'Échec de l’envoi'
  } finally {
    busy.value = false
    if (input.value) input.value.value = ''
  }
}
</script>

<template>
  <div>
    <div class="rounded-md border border-line overflow-hidden bg-nova-fog relative" :style="{ height: height + 'px' }">
      <img v-if="model" :src="model" alt="" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full grid place-items-center text-fg-3"><NIcon name="image" :size="24" /></div>
      <div v-if="busy" class="absolute inset-0 grid place-items-center bg-black/30 text-white text-[12px]">Envoi…</div>
    </div>
    <div class="flex gap-3 mt-2 items-center flex-wrap">
      <button
        type="button"
        class="text-[12px] font-semibold text-nova-teal inline-flex items-center gap-1.5 hover:underline"
        @click="input?.click()"
      >
        <NIcon name="plus" :size="14" /> {{ model ? 'Remplacer' : 'Téléverser' }}
      </button>
      <button
        v-if="model"
        type="button"
        class="text-[12px] font-semibold text-nova-teal inline-flex items-center gap-1.5 hover:underline"
        @click="adjustExisting"
      >
        <NIcon name="image" :size="14" /> Ajuster
      </button>
      <button v-if="model" type="button" class="text-[12px] text-fg-3 hover:text-err" @click="model = ''">Retirer</button>
    </div>
    <input ref="input" type="file" accept="image/*" class="hidden" @change="pickFile" />
    <p v-if="err" class="text-err text-[12px] mt-1">{{ err }}</p>

    <ImageCropper
      v-if="cropSrc"
      :src="cropSrc"
      :aspect="aspect"
      :round="round"
      :lock-format="lockFormat"
      @confirm="onCropConfirm"
      @cancel="closeCropper"
    />
  </div>
</template>
