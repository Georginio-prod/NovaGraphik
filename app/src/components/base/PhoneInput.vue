<script setup lang="ts">
import { ref, watch } from 'vue'

// Phone field with an international dialing-code selector (Togo by default).
// v-model exposes the full number, e.g. "+228 90 12 34 56" (empty until a local
// number is typed, so `required` validation behaves correctly).
defineProps<{ label?: string; error?: string; placeholder?: string }>()
const model = defineModel<string>()

// flag · country · dial code — West/Central Africa first, then the rest.
const COUNTRIES: { f: string; n: string; d: string }[] = [
  { f: '🇹🇬', n: 'Togo', d: '+228' },
  { f: '🇧🇯', n: 'Bénin', d: '+229' },
  { f: '🇨🇮', n: "Côte d'Ivoire", d: '+225' },
  { f: '🇧🇫', n: 'Burkina Faso', d: '+226' },
  { f: '🇬🇭', n: 'Ghana', d: '+233' },
  { f: '🇳🇬', n: 'Nigeria', d: '+234' },
  { f: '🇸🇳', n: 'Sénégal', d: '+221' },
  { f: '🇲🇱', n: 'Mali', d: '+223' },
  { f: '🇳🇪', n: 'Niger', d: '+227' },
  { f: '🇬🇳', n: 'Guinée', d: '+224' },
  { f: '🇨🇲', n: 'Cameroun', d: '+237' },
  { f: '🇬🇦', n: 'Gabon', d: '+241' },
  { f: '🇨🇬', n: 'Congo', d: '+242' },
  { f: '🇨🇩', n: 'RD Congo', d: '+243' },
  { f: '🇨🇫', n: 'Centrafrique', d: '+236' },
  { f: '🇹🇩', n: 'Tchad', d: '+235' },
  { f: '🇲🇷', n: 'Mauritanie', d: '+222' },
  { f: '🇬🇲', n: 'Gambie', d: '+220' },
  { f: '🇸🇱', n: 'Sierra Leone', d: '+232' },
  { f: '🇱🇷', n: 'Liberia', d: '+231' },
  { f: '🇨🇻', n: 'Cap-Vert', d: '+238' },
  { f: '🇬🇼', n: 'Guinée-Bissau', d: '+245' },
  { f: '🇲🇦', n: 'Maroc', d: '+212' },
  { f: '🇩🇿', n: 'Algérie', d: '+213' },
  { f: '🇹🇳', n: 'Tunisie', d: '+216' },
  { f: '🇱🇾', n: 'Libye', d: '+218' },
  { f: '🇪🇬', n: 'Égypte', d: '+20' },
  { f: '🇿🇦', n: 'Afrique du Sud', d: '+27' },
  { f: '🇰🇪', n: 'Kenya', d: '+254' },
  { f: '🇷🇼', n: 'Rwanda', d: '+250' },
  { f: '🇫🇷', n: 'France', d: '+33' },
  { f: '🇧🇪', n: 'Belgique', d: '+32' },
  { f: '🇨🇭', n: 'Suisse', d: '+41' },
  { f: '🇩🇪', n: 'Allemagne', d: '+49' },
  { f: '🇪🇸', n: 'Espagne', d: '+34' },
  { f: '🇮🇹', n: 'Italie', d: '+39' },
  { f: '🇵🇹', n: 'Portugal', d: '+351' },
  { f: '🇬🇧', n: 'Royaume-Uni', d: '+44' },
  { f: '🇳🇱', n: 'Pays-Bas', d: '+31' },
  { f: '🇺🇸', n: 'États-Unis / Canada', d: '+1' },
  { f: '🇦🇪', n: 'Émirats arabes unis', d: '+971' },
  { f: '🇸🇦', n: 'Arabie saoudite', d: '+966' },
  { f: '🇹🇷', n: 'Turquie', d: '+90' },
  { f: '🇨🇳', n: 'Chine', d: '+86' },
  { f: '🇮🇳', n: 'Inde', d: '+91' },
  { f: '🇧🇷', n: 'Brésil', d: '+55' },
]

const dial = ref('+228')
const local = ref('')

function sync() {
  model.value = local.value.trim() ? `${dial.value} ${local.value.trim()}` : ''
}
watch([dial, local], sync)

// Reset the visible inputs when the parent clears the model (e.g. after submit).
watch(model, (v) => {
  if (!v) {
    local.value = ''
    dial.value = '+228'
  }
})

const fieldClass =
  'w-full box-border font-sans text-sm text-fg-1 bg-nova-paper border rounded-sm px-3.5 py-3 outline-none transition-[border-color,box-shadow,background] duration-nova focus:bg-nova-surface'
</script>

<template>
  <div>
    <label v-if="label" class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">{{ label }}</label>
    <div class="mt-2 flex gap-2">
      <select
        v-model="dial"
        aria-label="Indicatif pays"
        :class="[fieldClass, 'w-[112px] shrink-0 cursor-pointer', error ? 'border-err' : 'border-line-strong focus:border-nova-lime']"
      >
        <option v-for="(c, i) in COUNTRIES" :key="i" :value="c.d">{{ c.f }} {{ c.d }}</option>
      </select>
      <input
        v-model="local"
        type="tel"
        inputmode="tel"
        :placeholder="placeholder || '90 12 34 56'"
        :aria-invalid="error ? true : undefined"
        :class="[
          fieldClass,
          'flex-1 min-w-0',
          error
            ? 'border-err focus:border-err focus:shadow-[0_0_0_3px_rgba(192,57,43,0.15)]'
            : 'border-line-strong focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)]',
        ]"
      />
    </div>
    <p v-if="error" class="text-err text-[12px] mt-1.5 mb-0">{{ error }}</p>
  </div>
</template>
