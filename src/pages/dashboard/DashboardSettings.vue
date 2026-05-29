<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import { useSettings } from '@/composables/useSettings'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NIcon from '@/components/base/NIcon.vue'

const inputClass =
  'w-full box-border font-sans text-fg-1 bg-nova-paper border border-line-strong rounded-sm px-3.5 py-3 outline-none mt-2 transition-[border-color,box-shadow,background] duration-nova focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)] focus:bg-nova-surface'
const labelClass = 'block text-[11px] font-semibold tracking-wider uppercase text-fg-2 mt-4'

const FIELDS: [string, string, string][] = [
  ['site_title', 'Nom du site', 'Nova Graphik'],
  ['tagline', 'Slogan', "L'essence du raffinement"],
  ['contact_email', 'E-mail de contact', 'contact@…'],
  ['contact_phone', 'Téléphone', '+228 …'],
  ['contact_location', 'Localisation', 'Lomé, Togo'],
  ['social_instagram', 'Lien Instagram', 'https://instagram.com/…'],
  ['social_facebook', 'Lien Facebook', 'https://facebook.com/…'],
  ['social_youtube', 'Lien YouTube', 'https://youtube.com/…'],
  ['social_tiktok', 'Lien TikTok', 'https://tiktok.com/@…'],
]

const form = ref<Record<string, string>>({})
const loading = ref(true)
const saving = ref(false)
const flash = ref('')
const error = ref('')
const { load: reloadPublic } = useSettings()

onMounted(async () => {
  try {
    const data = await api.get<{ settings: Record<string, string> }>('/settings')
    const f: Record<string, string> = {}
    for (const [key] of FIELDS) f[key] = data.settings[key] ?? ''
    form.value = f
  } catch {
    error.value = 'Impossible de charger les réglages.'
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  error.value = ''
  try {
    await api.put('/admin/settings', { settings: form.value })
    await reloadPublic(true)
    flash.value = 'Réglages enregistrés'
    setTimeout(() => (flash.value = ''), 2400)
  } catch {
    error.value = 'Échec de l’enregistrement.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex justify-between items-center mb-1.5 gap-4">
    <div>
      <NEyebrow>Tableau de bord</NEyebrow>
      <h1 class="font-display text-[32px] font-semibold mt-1.5 mb-0 text-fg-1">Réglages</h1>
    </div>
    <div class="flex gap-2.5 items-center">
      <transition
        enter-active-class="transition-opacity duration-nova"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-nova"
        leave-to-class="opacity-0"
      >
        <span v-if="flash" class="inline-flex items-center gap-1.5 text-xs text-ok font-semibold">
          <NIcon name="check" :size="14" /> {{ flash }}
        </span>
      </transition>
      <NButton variant="accent" size="sm" icon="save" @click="save">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</NButton>
    </div>
  </div>
  <p class="text-[13.5px] text-fg-3 my-1 mb-[26px]">
    Coordonnées et réseaux affichés dans le pied de page et la page Contact.
  </p>

  <p v-if="error" class="text-err text-[13px] mb-4">{{ error }}</p>

  <div v-if="!loading" class="max-w-[560px] bg-nova-surface border border-line rounded-lg p-[26px] shadow-nova-xs">
    <template v-for="[key, label, ph] in FIELDS" :key="key">
      <label :class="labelClass">{{ label }}</label>
      <input v-model="form[key]" :class="inputClass" :placeholder="ph" />
    </template>
  </div>
  <p v-else class="text-fg-3">Chargement…</p>
</template>
