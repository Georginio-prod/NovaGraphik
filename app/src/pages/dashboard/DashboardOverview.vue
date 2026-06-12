<script setup lang="ts">
import { RouterLink } from 'vue-router'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NIcon from '@/components/base/NIcon.vue'

const CARDS: [string, string, string, string][] = [
  ['file-text', 'Pages', 'Sections de la page d’accueil', '/admin/pages'],
  ['image', 'Portfolios', 'Réalisations & catégories', '/admin/portfolio'],
  ['users', 'Équipe', 'Membres & organigramme', '/admin/team'],
  ['megaphone', 'Promotions', 'Publications mises en avant', '/admin/promotions'],
  ['inbox', 'Commandes', 'Commandes via code promo', '/admin/commandes'],
  ['settings', 'Réglages', 'Contact & réseaux sociaux', '/admin/settings'],
]
</script>

<template>
  <NEyebrow>Tableau de bord</NEyebrow>
  <h1 class="font-display text-[32px] font-semibold mt-1.5 mb-1 text-fg-1">Vue d'ensemble</h1>
  <p class="text-[13.5px] text-fg-3 mb-7">Gérez le contenu de votre site Nova Graphik.</p>

  <div class="grid grid-cols-1 tab:grid-cols-2 gap-4 max-w-[680px]">
    <RouterLink
      v-for="[ic, title, desc, to] in CARDS"
      :key="to"
      :to="to"
      class="flex items-center gap-4 bg-nova-surface border border-line rounded-lg p-5 no-underline transition-[border-color,box-shadow,transform] duration-nova hover:border-nova-teal hover:shadow-nova-sm hover:-translate-y-0.5"
    >
      <div class="w-12 h-12 rounded-md bg-nova-fog grid place-items-center text-nova-teal shrink-0">
        <NIcon :name="ic" :size="22" />
      </div>
      <div>
        <div class="font-semibold text-fg-1">{{ title }}</div>
        <div class="text-[13px] text-fg-3">{{ desc }}</div>
      </div>
    </RouterLink>
  </div>
</template>
