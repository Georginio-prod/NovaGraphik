<script setup lang="ts">
import { ref, computed } from 'vue'
import { posterSrc } from '@/lib/media'
import NIcon from './NIcon.vue'

// Compatibility-first video player: explicit <source type>, inline playback,
// poster frame, and a graceful fallback (open externally) when the browser
// can't decode the codec — so a clip plays wherever it can, and degrades nicely
// where it can't (e.g. HEVC/.mov in Chrome).
const props = withDefaults(
  defineProps<{
    src: string
    autoplay?: boolean
    poster?: boolean
    videoClass?: string
  }>(),
  { autoplay: false, poster: true, videoClass: 'h-full w-full object-contain' },
)

const failed = ref(false)

// Clean file path (no query/fragment) for type detection + the external link.
const path = computed(() => props.src.split('#')[0].split('?')[0])
const mime = computed(() => {
  const ext = path.value.split('.').pop()?.toLowerCase()
  if (ext === 'webm') return 'video/webm'
  if (ext === 'ogg') return 'video/ogg'
  return 'video/mp4' // mp4 / mov / m4v → mp4 for the widest acceptance
})
// Poster frame only when not autoplaying (a poster is pointless mid-autoplay).
const videoSrc = computed(() => (props.poster && !props.autoplay ? posterSrc(props.src) : props.src))
</script>

<template>
  <div class="relative">
    <video
      v-if="!failed"
      :key="videoSrc"
      controls
      playsinline
      preload="metadata"
      :autoplay="autoplay"
      :class="videoClass"
      @error="failed = true"
    >
      <source :src="videoSrc" :type="mime" />
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
