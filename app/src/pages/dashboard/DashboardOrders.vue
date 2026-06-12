<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOrders } from '@/composables/useOrders'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NIcon from '@/components/base/NIcon.vue'

const { items, loading, error, load, setStatus, remove } = useOrders()
const selectedId = ref<number | null>(null)
onMounted(async () => {
  await load()
  selectedId.value = items.value[0]?.id ?? null
})

const cur = computed(() => items.value.find((o) => o.id === selectedId.value) ?? null)
const STATUSES = [
  { key: 'nouveau', label: 'Nouveau' },
  { key: 'traité', label: 'Traité' },
  { key: 'annulé', label: 'Annulé' },
]
const newCount = computed(() => items.value.filter((o) => o.status === 'nouveau').length)

function badgeClass(status: string) {
  if (status === 'traité') return 'bg-ok/15 text-ok'
  if (status === 'annulé') return 'bg-err/15 text-err'
  return 'bg-nova-lime/20 text-nova-green'
}
function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return s
  }
}
async function del(id: number) {
  if (selectedId.value === id) {
    const idx = items.value.findIndex((o) => o.id === id)
    selectedId.value = items.value[idx + 1]?.id ?? items.value[idx - 1]?.id ?? null
  }
  await remove(id)
}
</script>

<template>
  <div class="flex justify-between items-center mb-1.5 gap-4">
    <div>
      <NEyebrow>Tableau de bord</NEyebrow>
      <h1 class="font-display text-[32px] font-semibold mt-1.5 mb-0 text-fg-1">Commandes</h1>
    </div>
    <span v-if="newCount" class="rounded-full bg-nova-lime/20 text-nova-green text-[12px] font-bold px-3 py-1">
      {{ newCount }} nouvelle{{ newCount > 1 ? 's' : '' }}
    </span>
  </div>
  <p class="text-[13.5px] text-fg-3 my-1 mb-[26px]">
    Chaque commande passée avec un code promo Nova depuis le site. C'est votre preuve de conversion.
  </p>
  <p v-if="error" class="text-err text-[13px] mb-4">{{ error }}</p>

  <p v-if="loading" class="text-fg-3">Chargement…</p>
  <p v-else-if="!items.length" class="text-fg-3 bg-nova-surface border border-line rounded-lg p-8 text-center">
    Aucune commande pour le moment.
  </p>

  <div v-else class="grid grid-cols-1 desk:grid-cols-[360px_1fr] gap-6 items-start">
    <!-- list -->
    <div class="flex flex-col gap-2.5">
      <div
        v-for="o in items"
        :key="o.id"
        class="bg-nova-surface border rounded-md p-3.5 cursor-pointer transition-[border-color,box-shadow] duration-nova"
        :class="selectedId === o.id ? 'border-nova-teal shadow-nova-sm' : 'border-line'"
        @click="selectedId = o.id"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="font-semibold text-fg-1 text-[14px] truncate">{{ o.customer_name || 'Client' }}</span>
          <span class="rounded-full text-[10.5px] font-bold px-2 py-0.5 shrink-0" :class="badgeClass(o.status)">{{ o.status }}</span>
        </div>
        <div class="font-mono text-[12px] text-nova-teal font-semibold mt-1">{{ o.promo_code }}</div>
        <div class="text-[11.5px] text-fg-3 truncate mt-0.5">{{ o.promotion_title }} · {{ fmtDate(o.created_at) }}</div>
      </div>
    </div>

    <!-- detail -->
    <div v-if="cur" class="bg-nova-surface border border-line rounded-lg p-[26px] shadow-nova-xs">
      <div class="flex items-start justify-between gap-3">
        <div>
          <span class="font-mono text-nova-teal font-semibold text-[15px]">{{ cur.promo_code }}</span>
          <h2 class="font-display text-[22px] font-semibold text-fg-1 mt-1 mb-0">{{ cur.customer_name }}</h2>
          <p class="text-[12.5px] text-fg-3 m-0 mt-0.5">{{ fmtDate(cur.created_at) }}</p>
        </div>
        <button class="p-1.5 text-fg-3 hover:text-err" title="Supprimer" @click="del(cur.id)">
          <NIcon name="trash-2" :size="16" />
        </button>
      </div>

      <div class="grid gap-3 mt-5 text-[14px]">
        <div class="flex gap-3"><span class="text-fg-3 w-[110px] shrink-0">Promotion</span><span class="text-fg-1 font-medium">{{ cur.promotion_title }}</span></div>
        <div v-if="cur.offer_label" class="flex gap-3"><span class="text-fg-3 w-[110px] shrink-0">Offre</span><span class="text-fg-1">{{ cur.offer_label }}</span></div>
        <div class="flex gap-3"><span class="text-fg-3 w-[110px] shrink-0">E-mail</span><a :href="`mailto:${cur.customer_email}`" class="text-nova-teal">{{ cur.customer_email }}</a></div>
        <div v-if="cur.customer_phone" class="flex gap-3"><span class="text-fg-3 w-[110px] shrink-0">Téléphone</span><a :href="`tel:${cur.customer_phone}`" class="text-nova-teal">{{ cur.customer_phone }}</a></div>
        <div v-if="cur.message" class="flex gap-3"><span class="text-fg-3 w-[110px] shrink-0">Message</span><span class="text-fg-1 whitespace-pre-line">{{ cur.message }}</span></div>
      </div>

      <div class="mt-6 pt-5 border-t border-line">
        <div class="text-[11px] font-semibold tracking-wider uppercase text-fg-2 mb-2.5">Statut</div>
        <div class="flex gap-2">
          <button
            v-for="s in STATUSES"
            :key="s.key"
            class="rounded-sm border px-3.5 py-2 text-[12.5px] font-semibold transition-[border-color,background,color] duration-nova"
            :class="cur.status === s.key ? 'border-nova-teal bg-nova-teal/10 text-nova-teal' : 'border-line text-fg-2 hover:border-nova-teal/60'"
            @click="setStatus(cur.id, s.key)"
          >
            {{ s.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
