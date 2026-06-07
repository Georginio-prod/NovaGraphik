<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import NIcon from './NIcon.vue'

// Compatibility-first video player:
//  - explicit <source type> + inline playback for broad browser support
//  - a real thumbnail captured client-side (canvas) so the player isn't a black
//    box before playing
//  - graceful fallback (open externally) when the codec can't be decoded.
const props = withDefaults(
  defineProps<{ src: string; autoplay?: boolean; videoClass?: string }>(),
  { autoplay: false, videoClass: 'h-full w-full object-contain' },
)

const failed = ref(false)
const posterUrl = ref('')

// Clean file path (no query/fragment) for type detection + the external link.
const path = computed(() => props.src.split('#')[0].split('?')[0])
const mime = computed(() => {
  const ext = path.value.split('.').pop()?.toLowerCase()
  if (ext === 'webm') return 'video/webm'
  if (ext === 'ogg') return 'video/ogg'
  return 'video/mp4' // mp4 / mov / m4v → mp4 for the widest acceptance
})

// Grab a frame for the poster (same-origin uploads → canvas isn't tainted).
let temp: HTMLVideoElement | null = null
let timer: ReturnType<typeof setTimeout> | undefined
function cleanupTemp() {
  if (timer) clearTimeout(timer)
  timer = undefined
  if (temp) {
    temp.removeAttribute('src')
    try { temp.load() } catch { /* noop */ }
    temp = null
  }
}
onMounted(() => {
  if (props.autoplay) return // lightbox autoplays — no thumbnail needed
  const v = document.createElement('video')
  temp = v
  v.muted = true
  v.preload = 'auto'
  v.playsInline = true
  v.src = path.value
  v.addEventListener('loadeddata', () => {
    try {
      v.currentTime = Math.min(0.4, (v.duration || 1) / 2)
    } catch {
      cleanupTemp()
    }
  })
  v.addEventListener(
    'seeked',
    () => {
      try {
        if (v.videoWidth) {
          const c = document.createElement('canvas')
          c.width = v.videoWidth
          c.height = v.videoHeight
          c.getContext('2d')?.drawImage(v, 0, 0)
          posterUrl.value = c.toDataURL('image/jpeg', 0.72)
        }
      } catch {
        /* decode/taint issue → leave without poster */
      }
      cleanupTemp()
    },
    { once: true },
  )
  v.addEventListener('error', cleanupTemp, { once: true })
  timer = setTimeout(cleanupTemp, 6000) // bound work for slow/odd files
})
onBeforeUnmount(cleanupTemp)
</script>

<template>
  <div class="relative">
    <video
      v-if="!failed"
      :key="src"
      controls
      playsinline
      preload="metadata"
      :autoplay="autoplay"
      :poster="posterUrl || undefined"
      :class="videoClass"
      @error="failed = true"
    >
      <source :src="src" :type="mime" />
    </video>

    <div v-else class="absolute inset-0 grid place-items-center bg-black/85 p-4 text-center">
      <div>
        <NIcon name="video" :size="26" class="mx-auto text-white/70" />
        <p class="mx-auto mt-2 max-w-[220px] text-[12.5px] leading-snug text-white/80">
          Cette vidéo ne peut pas être lue dans ce navigateur.
        </p>
        <a
          :href="path"
          target="_blank"
          rel="noopener"
          class="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-nova-lime underline"
        >
          Ouvrir la vidéo <NIcon name="arrow-up-right" :size="14" />
        </a>
      </div>
    </div>
  </div>
</template>
