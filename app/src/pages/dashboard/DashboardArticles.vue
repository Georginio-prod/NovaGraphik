<script setup lang="ts">
import EntityListEditor from '@/components/dashboard/EntityListEditor.vue'
</script>

<template>
  <EntityListEditor
    endpoint="articles"
    title="Blogs"
    subtitle="Articles affichés sur la page Blogs. Le premier est mis en avant comme « à la une », les suivants en grille."
    add-label="Ajouter un article"
    :fields="[
      { key: 'cover_image', label: 'Image de couverture', type: 'image' },
      { key: 'title', label: 'Titre', placeholder: 'Titre de l’article' },
      { key: 'category', label: 'Catégorie', placeholder: 'Ex. Branding' },
      { key: 'date', label: 'Date', placeholder: 'Ex. 12 mai 2026' },
      { key: 'excerpt', label: 'Extrait', type: 'textarea', rows: 3, placeholder: 'Phrase d’accroche' },
      { key: 'body', label: 'Contenu', type: 'textarea', rows: 6, placeholder: 'Article complet (optionnel)' },
    ]"
    :item-label="(it) => it.title"
    :item-sub-label="(it) => `${it.category} · ${it.date}`"
    :new-defaults="{ title: 'Nouvel article', category: '', excerpt: '', body: '', date: '' }"
  />
</template>
