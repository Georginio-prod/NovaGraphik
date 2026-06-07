<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import NButton from '@/components/base/NButton.vue'
import NIcon from '@/components/base/NIcon.vue'

// In-browser crop / reframe + downscale. The user pans and zooms to frame the
// subject (e.g. a face), then we render the visible region to a canvas and emit
// a downscaled JPEG Blob — which also keeps uploads well under the server limit.
const props = withDefaults(
  defineProps<{ src: string; aspect?: number; round?: boolean }>(),
  { round: false },
)
const emit = defineEmits<{ (e: 'confirm', blob: Blob): void; (e: 'cancel'): void }>()

const VIEW_W = 320
const OUTPUT_LONG = 1000 // capped output long-edge → small files, sharp avatars

const imgEl = ref<HTMLImageElement | null>(null)
const nat = reactive({ w: 0, h: 0 })
const scale = ref(1)
const minScale = ref(1)
const tx = ref(0)
const ty = ref(0)
const ready = ref(false)
const working = ref(false)

const effAspect = computed(() =>
  props.aspect && props.aspect > 0 ? props.aspect : nat.w && nat.h ? nat.w / nat.h : 1,
)
const viewH = computed(() => Math.round(VIEW_W / effAspect.value))
const maxScale = computed(() => minScale.value * 4)

function clamp() {
  tx.value = Math.min(0, Math.max(VIEW_W - nat.w * scale.value, tx.value))
  ty.value = Math.min(0, Math.max(viewH.value - nat.h * scale.value, ty.value))
}

function onImgLoad() {
  const im = imgEl.value!
  nat.w = im.naturalWidth
  nat.h = im.naturalHeight
  minScale.value = Math.max(VIEW_W / nat.w, viewH.value / nat.h)
  scale.value = minScale.value
  tx.value = (VIEW_W - nat.w * scale.value) / 2
  ty.value = (viewH.value - nat.h * scale.value) / 2
  ready.value = true
}

function setZoom(v: number) {
  // Keep the viewport centre anchored while zooming.
  const cx = VIEW_W / 2
  const cy = viewH.value / 2
  const ix = (cx - tx.value) / scale.value
  const iy = (cy - ty.value) / scale.value
  scale.value = Math.min(maxScale.value, Math.max(minScale.value, v))
  tx.value = cx - ix * scale.value
  ty.value = cy - iy * scale.value
  clamp()
}
function onSlider(e: Event) {
  setZoom(Number((e.target as HTMLInputElement).value))
}
function onWheel(e: WheelEvent) {
  e.preventDefault()
  setZoom(scale.value * (e.deltaY < 0 ? 1.08 : 1 / 1.08))
}

let dragging = false
let lastX = 0
let lastY = 0
function onDown(e: PointerEvent) {
  dragging = true
  lastX = e.clientX
  lastY = e.clientY
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onMove(e: PointerEvent) {
  if (!dragging) return
  tx.value += e.clientX - lastX
  ty.value += e.clientY - lastY
  lastX = e.clientX
  lastY = e.clientY
  clamp()
}
function onUp() {
  dragging = false
}

const imgStyle = computed(() => ({
  transform: `translate(${tx.value}px, ${ty.value}px) scale(${scale.value})`,
  transformOrigin: '0 0',
}))

function confirm() {
  if (!imgEl.value || working.value) return
  working.value = true
  const sx = -tx.value / scale.value
  const sy = -ty.value / scale.value
  const sw = VIEW_W / scale.value
  const sh = viewH.value / scale.value
  const outW = effAspect.value >= 1 ? OUTPUT_LONG : Math.round(OUTPUT_LONG * effAspect.value)
  const outH = effAspect.value >= 1 ? Math.round(OUTPUT_LONG / effAspect.value) : OUTPUT_LONG
  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    working.value = false
    return
  }
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(imgEl.value, sx, sy, sw, sh, 0, 0, outW, outH)
  canvas.toBlob(
    (b) => {
      working.value = false
      if (b) emit('confirm', b)
    },
    'image/jpeg',
    0.9,
  )
}
</script>

<template>
  <div class="fixed inset-0 z-[80] grid place-items-center bg-black/55 p-4" @pointerup="onUp">
    <div class="w-full max-w-[380px] rounded-xl bg-nova-surface p-5 shadow-nova-lg">
      <h3 class="mb-1 font-display text-lg font-semibold text-fg-1">Ajuster l'image</h3>
      <p class="mb-4 text-[12.5px] leading-snug text-fg-3">
        Glissez pour déplacer, utilisez le curseur pour zoomer et cadrer le visage.
      </p>

      <!-- viewport -->
      <div
        class="relative mx-auto touch-none overflow-hidden rounded-md bg-nova-fog select-none"
        :style="{ width: VIEW_W + 'px', height: viewH + 'px', cursor: dragging ? 'grabbing' : 'grab' }"
        @pointerdown="onDown"
        @pointermove="onMove"
        @pointerup="onUp"
        @wheel="onWheel"
      >
        <img
          ref="imgEl"
          :src="src"
          alt=""
          class="pointer-events-none absolute left-0 top-0 max-w-none"
          :style="imgStyle"
          @load="onImgLoad"
        />
        <!-- circular guide for avatars -->
        <div
          v-if="round && ready"
          class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-white/70"
          :style="{
            width: Math.min(VIEW_W, viewH) + 'px',
            height: Math.min(VIEW_W, viewH) + 'px',
            boxShadow: '0 0 0 9999px rgba(2,28,37,0.45)',
          }"
        />
      </div>

      <!-- zoom -->
      <div class="mt-4 flex items-center gap-3">
        <NIcon name="image" :size="15" class="text-fg-3" />
        <input
          type="range"
          :min="minScale"
          :max="maxScale"
          :step="(maxScale - minScale) / 100 || 0.01"
          :value="scale"
          class="h-1 flex-1 cursor-pointer accent-nova-teal"
          @input="onSlider"
        />
        <NIcon name="plus" :size="15" class="text-fg-3" />
      </div>

      <div class="mt-5 flex justify-end gap-2.5">
        <button
          type="button"
          class="rounded-sm px-4 py-2.5 text-[13px] font-semibold text-fg-2 hover:bg-nova-fog"
          @click="emit('cancel')"
        >
          Annuler
        </button>
        <NButton variant="accent" size="sm" icon="check" :disabled="!ready || working" @click="confirm">
          {{ working ? 'Traitement…' : 'Valider' }}
        </NButton>
      </div>
    </div>
  </div>
</template>
