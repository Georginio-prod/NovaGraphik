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

// key, label, placeholder, type ('text' | 'textarea')
const FIELDS: [string, string, string, 'text' | 'textarea'][] = [
  ['footer_description', 'Description (sous le logo)', 'Agence de communication visuelle — identité, print, digital & motion design.', 'textarea'],
  ['footer_newsletter_title', 'Titre du bloc abonnement', "S'abonner", 'text'],
  ['footer_newsletter_text', 'Texte du bloc abonnement', 'Recevez nos derniers projets.', 'text'],
  ['footer_copyright', 'Mention en bas de page', '© 2026 Nova Graphik. Tous droits réservés.', 'text'],
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
    // Pre-fill with the current text (fall back to the live default) so the
    // editor shows what visitors actually see rather than empty fields.
    for (const [key, , def] of FIELDS) f[key] = data.settings[key] || def
    form.value = f
  } catch {
    error.value = 'Impossible de charger le pied de page.'
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
    flash.value = 'Pied de page enregistré'
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
      <h1 class="font-display text-[28px] tab:text-[32px] font-semibold mt-1.5 mb-0 text-fg-1">Pied de page</h1>
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
    Textes du pied de page. Les <strong>coordonnées</strong> et <strong>réseaux sociaux</strong> se modifient dans
    <em>Réglages</em>.
  </p>

  <p v-if="error" class="text-err text-[13px] mb-4">{{ error }}</p>

  <div v-if="!loading" class="max-w-[560px] bg-nova-surface border border-line rounded-lg p-[26px] shadow-nova-xs">
    <template v-for="[key, label, ph, type] in FIELDS" :key="key">
      <label :class="labelClass">{{ label }}</label>
      <textarea
        v-if="type === 'textarea'"
        v-model="form[key]"
        rows="3"
        :class="[inputClass, 'text-sm resize-y']"
        :placeholder="ph"
      />
      <input v-else v-model="form[key]" :class="inputClass" :placeholder="ph" />
    </template>
  </div>
  <p v-else class="text-fg-3">Chargement…</p>
</template>
