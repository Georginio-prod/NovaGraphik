<script setup lang="ts">
import { ref } from 'vue'
import EntityListEditor from '@/components/dashboard/EntityListEditor.vue'

const tab = ref<'partners' | 'testimonials'>('partners')
</script>

<template>
  <div class="flex gap-2 mb-6">
    <button
      class="px-4 py-2 rounded-sm text-[13px] font-semibold border transition-colors duration-nova"
      :class="tab === 'partners' ? 'bg-nova-navy text-white border-nova-navy' : 'bg-nova-surface text-fg-2 border-line-strong hover:border-nova-navy'"
      @click="tab = 'partners'"
    >
      Partenaires
    </button>
    <button
      class="px-4 py-2 rounded-sm text-[13px] font-semibold border transition-colors duration-nova"
      :class="tab === 'testimonials' ? 'bg-nova-navy text-white border-nova-navy' : 'bg-nova-surface text-fg-2 border-line-strong hover:border-nova-navy'"
      @click="tab = 'testimonials'"
    >
      Témoignages clients
    </button>
  </div>

  <EntityListEditor
    v-if="tab === 'partners'"
    endpoint="partners"
    title="Partenaires"
    subtitle="Les marques partenaires affichées sur la page Partenaires."
    add-label="Ajouter un partenaire"
    :fields="[
      { key: 'logo_url', label: 'Logo', type: 'image' },
      { key: 'name', label: 'Nom', placeholder: 'Ex. Visiosphere' },
    ]"
    :item-label="(it) => it.name"
    :new-defaults="{ name: 'Nouveau partenaire', logo_url: '' }"
  />

  <EntityListEditor
    v-else
    endpoint="testimonials"
    title="Témoignages"
    subtitle="Avis clients affichés sous la grille de partenaires."
    add-label="Ajouter un témoignage"
    :fields="[
      { key: 'quote', label: 'Citation', type: 'textarea', rows: 4, placeholder: 'Ce que dit le client…' },
      { key: 'author_name', label: 'Nom du client', placeholder: 'Ex. Studio Visiosphere' },
      { key: 'author_role', label: 'Rôle / fonction', placeholder: 'Ex. Direction marketing' },
    ]"
    :item-label="(it) => it.author_name"
    :item-sub-label="(it) => it.author_role"
    :new-defaults="{ quote: '', author_name: 'Nouveau client', author_role: '' }"
  />
</template>
