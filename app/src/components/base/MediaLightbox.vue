<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { isVideoUrl } from '@/lib/media'
import NIcon from '@/components/base/NIcon.vue'

// Fullscreen viewer for a single image or video. Shown at its natural aspect,
// capped to the viewport — so any format (16:9, 9:16, …) can be enlarged.
const props = defineProps<{ src: string }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const isVideo = isVideoUrl(props.src)

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="fixed inset-0 z-[90] grid place-items-center bg-black/90 p-4" @click.self="emit('close')">
    <button
      type="button"
      class="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      aria-label="Fermer"
      @click="emit('close')"
    >
      <NIcon name="x" :size="20" />
    </button>
    <video
      v-if="isVideo"
      :src="src"
      controls
      autoplay
      playsinline
      class="max-h-[88vh] max-w-[94vw] rounded-lg bg-black"
    />
    <img v-else :src="src" alt="" class="max-h-[88vh] max-w-[94vw] rounded-lg object-contain" />
  </div>
</template>
