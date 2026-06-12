<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import NIcon from '@/components/base/NIcon.vue'
import { generatePromoCode, emptyPromoCode } from '@/lib/promoCodes'
import type { PromoCode } from '@/lib/api'

// Repeater for a promotion's promo codes (stored as a JSONB array on the row).
// Built for the "10 promos, each with several tariffs" case: each offer is one
// code, branded NOVA-…, with a label, a discount and conditions. Auto-generate
// keeps codes unique and on-brand; everything stays editable.
const model = defineModel<PromoCode[]>({ default: () => [] })
const props = defineProps<{ seed?: string }>()

const inputClass =
  'w-full box-border font-sans text-[13px] text-fg-1 bg-nova-paper border border-line-strong rounded-sm px-3 py-2 outline-none transition-[border-color,box-shadow,background] duration-nova focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)] focus:bg-nova-surface'

function list(): PromoCode[] {
  if (!Array.isArray(model.value)) model.value = []
  return model.value
}
function touch() {
  // Reassign so defineModel emits and the parent autosaves.
  model.value = [...list()]
}
function addCode() {
  list().push(emptyPromoCode(props.seed))
  touch()
}
function removeCode(i: number) {
  list().splice(i, 1)
  touch()
}
function regen(i: number) {
  list()[i].code = generatePromoCode(list()[i].label || props.seed)
  touch()
}

// ── Régénération automatique ─────────────────────────────────────────────────
// Toutes les 5 min, on rafraîchit le code de chaque offre sur place (intitulé,
// réduction et conditions conservés) pour que la promotion affiche toujours des
// codes NOVA- frais et uniques sans intervention. Le bouton « Générer » de chaque
// offre et « Tout régénérer » restent disponibles à tout moment.
const AUTO_INTERVAL_MS = 5 * 60 * 1000
const autoGen = ref(true)
const lastGen = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

function regenAll() {
  const arr = list()
  if (!arr.length) return
  for (const c of arr) c.code = generatePromoCode(c.label || props.seed)
  lastGen.value = Date.now()
  touch()
}
function startTimer() {
  stopTimer()
  if (autoGen.value) timer = setInterval(regenAll, AUTO_INTERVAL_MS)
}
function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
function toggleAuto() {
  autoGen.value = !autoGen.value
  startTimer()
}
function lastGenLabel(ts: number): string {
  return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
onMounted(startTimer)
onBeforeUnmount(stopTimer)
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Bandeau régénération auto (toujours accompagné de l'action manuelle) -->
    <div
      v-if="(model || []).length"
      class="flex items-center justify-between gap-3 rounded-md border border-line bg-nova-fog px-3.5 py-2.5"
    >
      <div class="flex items-center gap-2.5">
        <NIcon name="refresh-cw" :size="15" class="text-nova-teal" />
        <div>
          <div class="text-[12px] font-semibold text-fg-1">Régénération automatique</div>
          <div class="text-[10.5px] text-fg-3">
            Nouveaux codes toutes les 5 min<template v-if="lastGen"> · dernière à {{ lastGenLabel(lastGen) }}</template>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-sm border border-line-strong px-2.5 py-1.5 text-[12px] font-semibold text-nova-teal hover:border-nova-teal"
          title="Régénérer tous les codes maintenant"
          @click="regenAll"
        >
          <NIcon name="refresh-cw" :size="13" /> Tout régénérer
        </button>
        <button
          type="button"
          role="switch"
          :aria-checked="autoGen"
          :title="autoGen ? 'Désactiver la régénération auto' : 'Activer la régénération auto'"
          class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-nova"
          :class="autoGen ? 'bg-nova-teal' : 'bg-line-strong'"
          @click="toggleAuto"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-nova"
            :class="autoGen ? 'translate-x-4' : 'translate-x-0.5'"
          />
        </button>
      </div>
    </div>

    <div
      v-for="(c, i) in (model || [])"
      :key="i"
      class="rounded-md border border-line bg-nova-surface p-3.5"
    >
      <div class="flex items-center justify-between gap-2 mb-2.5">
        <span class="text-[11px] font-semibold tracking-wider uppercase text-fg-3">Offre {{ i + 1 }}</span>
        <button type="button" class="p-1 text-fg-3 hover:text-err" title="Supprimer cette offre" @click="removeCode(i)">
          <NIcon name="trash-2" :size="14" />
        </button>
      </div>

      <label class="block text-[10.5px] font-semibold tracking-wider uppercase text-fg-3 mb-1">Code promo</label>
      <div class="flex gap-2">
        <input
          v-model="c.code"
          :class="[inputClass, 'font-mono tracking-wide !text-nova-teal font-semibold']"
          placeholder="NOVA-…"
          @input="touch"
        />
        <button
          type="button"
          class="shrink-0 inline-flex items-center gap-1.5 rounded-sm border border-line-strong px-2.5 text-[12px] font-semibold text-nova-teal hover:border-nova-teal"
          title="Générer un nouveau code"
          @click="regen(i)"
        >
          <NIcon name="refresh-cw" :size="13" /> Générer
        </button>
      </div>

      <div class="grid grid-cols-1 tab:grid-cols-[1fr_120px] gap-2 mt-2.5">
        <div>
          <label class="block text-[10.5px] font-semibold tracking-wider uppercase text-fg-3 mb-1">Intitulé de l'offre</label>
          <input v-model="c.label" :class="inputClass" placeholder="Ex. -20% sur l'addition" @input="touch" />
        </div>
        <div>
          <label class="block text-[10.5px] font-semibold tracking-wider uppercase text-fg-3 mb-1">Réduction</label>
          <input v-model="c.discount" :class="inputClass" placeholder="-20%" @input="touch" />
        </div>
      </div>

      <label class="block text-[10.5px] font-semibold tracking-wider uppercase text-fg-3 mb-1 mt-2.5">Conditions</label>
      <input v-model="c.description" :class="inputClass" placeholder="Ex. Hors boissons, sur place uniquement" @input="touch" />
    </div>

    <button
      type="button"
      class="flex items-center justify-center gap-2 p-2.5 rounded-md border border-dashed border-line-strong text-nova-teal text-[12.5px] font-semibold hover:border-nova-teal"
      @click="addCode"
    >
      <NIcon name="plus" :size="15" /> Ajouter une offre / un code promo
    </button>
  </div>
</template>
