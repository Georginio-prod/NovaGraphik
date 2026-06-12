<script setup lang="ts">
import { ref, computed } from 'vue'
import { uploadImage } from '@/composables/useUpload'
import { fetchImageBlobUrl } from '@/lib/imageCrop'
import { isVideoUrl, getMediaMeta, withRatio, ratioCss, aspectCss, VIDEO_FORMATS, DEFAULT_VIDEO_FORMAT } from '@/lib/media'
import NIcon from '@/components/base/NIcon.vue'
import ImageCropper from './ImageCropper.vue'
import MediaLightbox from '@/components/base/MediaLightbox.vue'
import VideoPlayer from '@/components/base/VideoPlayer.vue'

// Like ImageField but accepts videos too. Images go through the cropper +
// downscale; videos upload as-is and preview in a <video>. Videos also get a
// display-format selector (9:16, 4:5, 1:1, 1.91:1, 16:9) stored in the URL.
const model = defineModel<string>({ default: '' })
const props = withDefaults(defineProps<{ height?: number }>(), { height: 140 })

const busy = ref(false)
const err = ref('')
const input = ref<HTMLInputElement | null>(null)

const isVideo = computed(() => isVideoUrl(model.value))
const ratioCode = computed(() => getMediaMeta(model.value).ratio || DEFAULT_VIDEO_FORMAT)
// Videos size by their chosen aspect ratio; images by the format they were
// cropped to (carried on the URL as `?ar=`). Both fall back to the fixed height.
const previewStyle = computed(() => {
  if (isVideo.value)
    return { aspectRatio: ratioCss(ratioCode.value), maxHeight: '260px', margin: '0 auto' }
  const ar = aspectCss(model.value)
  return ar
    ? { height: `${props.height}px`, aspectRatio: ar, width: 'auto', margin: '0 auto' }
    : { height: `${props.height}px` }
})
function onFormat(e: Event) {
  model.value = withRatio(model.value, (e.target as HTMLSelectElement).value)
}

const lightbox = ref(false)

const cropSrc = ref<string | null>(null)
let objectUrl: string | null = null

function pickFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.type.startsWith('video/')) {
    uploadDirect(file)
    return
  }
  releaseUrl()
  objectUrl = URL.createObjectURL(file)
  cropSrc.value = objectUrl
}

async function adjustExisting() {
  if (!model.value || isVideo.value) return
  err.value = ''
  try {
    releaseUrl()
    objectUrl = await fetchImageBlobUrl(model.value)
    cropSrc.value = objectUrl
  } catch (e) {
    err.value = e instanceof Error ? e.message : 'Impossible d’ouvrir l’image pour ajustement'
  }
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

async function uploadDirect(file: File | Blob, filename = 'media') {
  busy.value = true
  err.value = ''
  try {
    model.value = await uploadImage(file, filename)
  } catch (e) {
    err.value = e instanceof Error ? e.message : 'Échec de l’envoi'
  } finally {
    busy.value = false
    if (input.value) input.value.value = ''
  }
}

async function onCropConfirm(blob: Blob, ar: string) {
  cropSrc.value = null
  releaseUrl()
  busy.value = true
  err.value = ''
  const previous = model.value
  const preview = URL.createObjectURL(blob)
  model.value = preview
  try {
    const url = await uploadImage(blob, 'photo.jpg')
    URL.revokeObjectURL(preview)
    model.value = withRatio(url, ar)
  } catch (e) {
    URL.revokeObjectURL(preview)
    model.value = previous
    err.value = e instanceof Error ? e.message : 'Échec de l’envoi'
  } finally {
    busy.value = false
    if (input.value) input.value.value = ''
  }
}
</script>

<template>
  <div>
    <div class="rounded-md border border-line overflow-hidden bg-nova-fog relative" :style="previewStyle">
      <VideoPlayer v-if="model && isVideo" :src="model" class="h-full w-full" />
      <img v-else-if="model" :key="model" :src="model" alt="" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full grid place-items-center text-fg-3"><NIcon name="image" :size="24" /></div>
      <div v-if="busy" class="absolute inset-0 grid place-items-center bg-black/40 text-white text-[12px]">Envoi…</div>
    </div>

    <!-- Display format (videos only) -->
    <div v-if="model && isVideo" class="mt-2">
      <label class="block text-[10px] font-semibold tracking-wider uppercase text-fg-3 mb-1">Format d'affichage</label>
      <select
        :value="ratioCode"
        class="w-full box-border text-[12px] text-fg-1 bg-nova-paper border border-line-strong rounded-sm px-2.5 py-2 outline-none focus:border-nova-lime"
        @change="onFormat"
      >
        <option v-for="f in VIDEO_FORMATS" :key="f.code" :value="f.code">{{ f.label }}</option>
      </select>
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
        v-if="model && !isVideo"
        type="button"
        class="text-[12px] font-semibold text-nova-teal inline-flex items-center gap-1.5 hover:underline"
        @click="adjustExisting"
      >
        <NIcon name="image" :size="14" /> Ajuster
      </button>
      <button
        v-if="model"
        type="button"
        class="text-[12px] font-semibold text-nova-teal inline-flex items-center gap-1.5 hover:underline"
        @click="lightbox = true"
      >
        <NIcon name="arrow-up-right" :size="14" /> Agrandir
      </button>
      <button v-if="model" type="button" class="text-[12px] text-fg-3 hover:text-err" @click="model = ''">Retirer</button>
    </div>
    <input ref="input" type="file" accept="image/*,video/*" class="hidden" @change="pickFile" />
    <p v-if="err" class="text-err text-[12px] mt-1">{{ err }}</p>

    <ImageCropper
      v-if="cropSrc"
      :src="cropSrc"
      @confirm="onCropConfirm"
      @cancel="closeCropper"
    />
    <MediaLightbox v-if="lightbox && model" :src="model" @close="lightbox = false" />
  </div>
</template>
