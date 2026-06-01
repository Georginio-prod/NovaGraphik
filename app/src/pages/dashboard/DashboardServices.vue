<script setup lang="ts">
import EntityListEditor from '@/components/dashboard/EntityListEditor.vue'
</script>

<template>
  <EntityListEditor
    endpoint="services"
    title="Services"
    subtitle="Les 8 cartes services affichées sur l'accueil (« Tout ce qui est lié au digital »)."
    add-label="Ajouter un service"
    :fields="[
      { key: 'icon', label: 'Icône', type: 'icon' },
      { key: 'title', label: 'Titre', placeholder: 'Ex. Identité visuelle' },
      { key: 'description', label: 'Description', type: 'textarea', rows: 3, placeholder: 'Quelques mots sur ce service' },
    ]"
    :item-label="(it) => it.title"
    :item-sub-label="(it) => it.description"
    :new-defaults="{ icon: 'sparkles', title: 'Nouveau service', description: '' }"
  />
</template>
