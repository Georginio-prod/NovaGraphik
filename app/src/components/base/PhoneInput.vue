<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Phone field with an international dialing-code selector (Togo by default).
// v-model exposes the full number, e.g. "+228 90 12 34 56" (empty until a local
// number is typed, so `required` validation behaves correctly).
defineProps<{ label?: string; error?: string; placeholder?: string }>()
const model = defineModel<string>()

// flag · country · dial code · local-format example (hints digit count).
const COUNTRIES: { f: string; n: string; d: string; ex: string }[] = [
  { f: '🇹🇬', n: 'Togo', d: '+228', ex: '90 12 34 56' },
  { f: '🇧🇯', n: 'Bénin', d: '+229', ex: '90 12 34 56' },
  { f: '🇨🇮', n: "Côte d'Ivoire", d: '+225', ex: '01 23 45 67 89' },
  { f: '🇧🇫', n: 'Burkina Faso', d: '+226', ex: '70 12 34 56' },
  { f: '🇬🇭', n: 'Ghana', d: '+233', ex: '24 123 4567' },
  { f: '🇳🇬', n: 'Nigeria', d: '+234', ex: '802 123 4567' },
  { f: '🇸🇳', n: 'Sénégal', d: '+221', ex: '77 123 45 67' },
  { f: '🇲🇱', n: 'Mali', d: '+223', ex: '70 12 34 56' },
  { f: '🇳🇪', n: 'Niger', d: '+227', ex: '90 12 34 56' },
  { f: '🇬🇳', n: 'Guinée', d: '+224', ex: '620 12 34 56' },
  { f: '🇨🇲', n: 'Cameroun', d: '+237', ex: '6 71 23 45 67' },
  { f: '🇬🇦', n: 'Gabon', d: '+241', ex: '06 03 12 34' },
  { f: '🇨🇬', n: 'Congo', d: '+242', ex: '06 123 4567' },
  { f: '🇨🇩', n: 'RD Congo', d: '+243', ex: '81 234 5678' },
  { f: '🇨🇫', n: 'Centrafrique', d: '+236', ex: '70 12 34 56' },
  { f: '🇹🇩', n: 'Tchad', d: '+235', ex: '63 12 34 56' },
  { f: '🇲🇷', n: 'Mauritanie', d: '+222', ex: '22 12 34 56' },
  { f: '🇬🇲', n: 'Gambie', d: '+220', ex: '301 2345' },
  { f: '🇸🇱', n: 'Sierra Leone', d: '+232', ex: '25 123456' },
  { f: '🇱🇷', n: 'Liberia', d: '+231', ex: '77 012 3456' },
  { f: '🇨🇻', n: 'Cap-Vert', d: '+238', ex: '991 12 34' },
  { f: '🇬🇼', n: 'Guinée-Bissau', d: '+245', ex: '955 012 345' },
  { f: '🇲🇦', n: 'Maroc', d: '+212', ex: '6 12 34 56 78' },
  { f: '🇩🇿', n: 'Algérie', d: '+213', ex: '551 23 45 67' },
  { f: '🇹🇳', n: 'Tunisie', d: '+216', ex: '20 123 456' },
  { f: '🇱🇾', n: 'Libye', d: '+218', ex: '91 234 5678' },
  { f: '🇪🇬', n: 'Égypte', d: '+20', ex: '100 123 4567' },
  { f: '🇿🇦', n: 'Afrique du Sud', d: '+27', ex: '71 123 4567' },
  { f: '🇰🇪', n: 'Kenya', d: '+254', ex: '712 123456' },
  { f: '🇷🇼', n: 'Rwanda', d: '+250', ex: '72 123 4567' },
  { f: '🇫🇷', n: 'France', d: '+33', ex: '6 12 34 56 78' },
  { f: '🇧🇪', n: 'Belgique', d: '+32', ex: '470 12 34 56' },
  { f: '🇨🇭', n: 'Suisse', d: '+41', ex: '78 123 45 67' },
  { f: '🇩🇪', n: 'Allemagne', d: '+49', ex: '151 2345 6789' },
  { f: '🇪🇸', n: 'Espagne', d: '+34', ex: '612 34 56 78' },
  { f: '🇮🇹', n: 'Italie', d: '+39', ex: '312 345 6789' },
  { f: '🇵🇹', n: 'Portugal', d: '+351', ex: '912 345 678' },
  { f: '🇬🇧', n: 'Royaume-Uni', d: '+44', ex: '7400 123456' },
  { f: '🇳🇱', n: 'Pays-Bas', d: '+31', ex: '6 1234 5678' },
  { f: '🇺🇸', n: 'États-Unis / Canada', d: '+1', ex: '234 567 8900' },
  { f: '🇦🇪', n: 'Émirats arabes unis', d: '+971', ex: '50 123 4567' },
  { f: '🇸🇦', n: 'Arabie saoudite', d: '+966', ex: '50 123 4567' },
  { f: '🇹🇷', n: 'Turquie', d: '+90', ex: '501 234 56 78' },
  { f: '🇨🇳', n: 'Chine', d: '+86', ex: '131 2345 6789' },
  { f: '🇮🇳', n: 'Inde', d: '+91', ex: '98765 43210' },
  { f: '🇧🇷', n: 'Brésil', d: '+55', ex: '11 91234 5678' },
]

const dial = ref('+228')
const local = ref('')
// Placeholder follows the selected country's local format (digit count hint).
const example = computed(() => COUNTRIES.find((c) => c.d === dial.value)?.ex || '90 12 34 56')

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

// NB: no `w-full` here — width is set per element (the select is fixed-width,
// the input flexes to fill the rest). A shared w-full would override w-[...].
const fieldBase =
  'box-border font-sans text-sm text-fg-1 bg-nova-paper border rounded-sm py-3 outline-none transition-[border-color,box-shadow,background] duration-nova focus:bg-nova-surface'
const okBorder = 'border-line-strong focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)]'
const errBorder = 'border-err focus:border-err focus:shadow-[0_0_0_3px_rgba(192,57,43,0.15)]'
</script>

<template>
  <div>
    <label v-if="label" class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">{{ label }}</label>
    <div class="mt-2 flex gap-2">
      <select
        v-model="dial"
        aria-label="Indicatif pays"
        :class="[fieldBase, 'w-[150px] shrink-0 cursor-pointer pl-3 pr-2', error ? errBorder : okBorder]"
      >
        <option v-for="(c, i) in COUNTRIES" :key="i" :value="c.d">{{ c.f }} {{ c.n }} ({{ c.d }})</option>
      </select>
      <input
        v-model="local"
        type="tel"
        inputmode="tel"
        :placeholder="placeholder || example"
        :aria-invalid="error ? true : undefined"
        :class="[fieldBase, 'flex-1 min-w-0 px-3.5', error ? errBorder : okBorder]"
      />
    </div>
    <p v-if="error" class="text-err text-[12px] mt-1.5 mb-0">{{ error }}</p>
  </div>
</template>
