<script setup lang="ts">
import EntityListEditor from '@/components/dashboard/EntityListEditor.vue'
</script>

<template>
  <EntityListEditor
    endpoint="nav"
    title="Navigation"
    subtitle="Les éléments de la barre de menu publique. Cachez ce que vous ne voulez pas montrer aux clients, réordonnez à la souris."
    add-label="Ajouter un menu"
    :fields="[
      { key: 'label', label: 'Libellé', placeholder: 'Ex. Portfolios' },
      { key: 'path', label: 'Chemin', placeholder: '/portfolios' },
    ]"
    :item-label="(it) => it.label"
    :item-sub-label="(it) => it.path"
    :new-defaults="{ label: 'Nouveau menu', path: '/' }"
  />
</template>
