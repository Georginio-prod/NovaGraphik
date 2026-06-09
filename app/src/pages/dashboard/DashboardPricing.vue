<script setup lang="ts">
import { ref } from 'vue'
import EntityListEditor from '@/components/dashboard/EntityListEditor.vue'
import PricingGroupsEditor from '@/components/dashboard/PricingGroupsEditor.vue'

const tab = ref<'formulas' | 'items'>('formulas')
</script>

<template>
  <div class="flex gap-2 mb-6">
    <button
      class="px-4 py-2 rounded-sm text-[13px] font-semibold border transition-colors duration-nova"
      :class="tab === 'formulas' ? 'bg-nova-navy text-white border-nova-navy' : 'bg-nova-surface text-fg-2 border-line-strong hover:border-nova-navy'"
      @click="tab = 'formulas'"
    >
      Formules (3 cartes)
    </button>
    <button
      class="px-4 py-2 rounded-sm text-[13px] font-semibold border transition-colors duration-nova"
      :class="tab === 'items' ? 'bg-nova-navy text-white border-nova-navy' : 'bg-nova-surface text-fg-2 border-line-strong hover:border-nova-navy'"
      @click="tab = 'items'"
    >
      Grille tarifaire détaillée
    </button>
  </div>

  <EntityListEditor
    v-if="tab === 'formulas'"
    endpoint="pricing-formulas"
    title="Formules"
    subtitle="Les 3 formules mises en avant en haut de la page tarifs (Basique, Standard, Premium)."
    add-label="Ajouter une formule"
    :fields="[
      { key: 'name', label: 'Nom', placeholder: 'Ex. Standard' },
      { key: 'price', label: 'Prix', placeholder: 'Ex. 50 000' },
      { key: 'is_hot', label: 'Mettre en avant (badge « Populaire »)', type: 'bool', placeholder: 'Cette formule est la plus populaire' },
      { key: 'features', label: 'Fonctionnalités incluses', type: 'list', itemLabel: 'une fonctionnalité' },
    ]"
    :item-label="(it) => it.name"
    :item-sub-label="(it) => `${it.price} FCFA`"
    :new-defaults="{ name: 'Nouvelle formule', price: '', features: [], is_hot: 0 }"
  />

  <PricingGroupsEditor v-else />
</template>
