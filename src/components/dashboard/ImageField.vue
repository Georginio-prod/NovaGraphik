<script setup lang="ts">
import { ref } from 'vue'
import { uploadImage } from '@/composables/useUpload'
import NIcon from '@/components/base/NIcon.vue'

const model = defineModel<string>({ default: '' })
withDefaults(defineProps<{ height?: number }>(), { height: 140 })

const busy = ref(false)
const err = ref('')
const input = ref<HTMLInputElement | null>(null)

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  busy.value = true
  err.value = ''
  try {
    model.value = await uploadImage(file)
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
    <div class="flex gap-3 mt-2 items-center">
      <button
        type="button"
        class="text-[12px] font-semibold text-nova-teal inline-flex items-center gap-1.5 hover:underline"
        @click="input?.click()"
      >
        <NIcon name="plus" :size="14" /> {{ model ? 'Remplacer' : 'Téléverser' }}
      </button>
      <button v-if="model" type="button" class="text-[12px] text-fg-3 hover:text-err" @click="model = ''">Retirer</button>
    </div>
    <input ref="input" type="file" accept="image/*" class="hidden" @change="onFile" />
    <p v-if="err" class="text-err text-[12px] mt-1">{{ err }}</p>
  </div>
</template>
