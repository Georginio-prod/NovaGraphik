<script setup lang="ts">
import EntityListEditor from '@/components/dashboard/EntityListEditor.vue'
import { PROMO_ANIMATION_OPTIONS } from '@/lib/promoAnimations'

// Types de publication proposés (la « catégorie » d'une promotion).
const PUBLICATION_TYPES = [
  { value: 'Flyer', label: 'Flyer' },
  { value: 'Affiche', label: 'Affiche' },
  { value: 'Story', label: 'Story' },
  { value: 'Post réseaux', label: 'Post réseaux' },
  { value: 'Bannière', label: 'Bannière' },
  { value: 'Carte de visite', label: 'Carte de visite' },
  { value: 'Packaging', label: 'Packaging' },
  { value: 'Autre', label: 'Autre' },
]
</script>

<template>
  <EntityListEditor
    endpoint="promotions"
    title="Promotions"
    subtitle="Vos publications mises en avant sur la page Promotions : une promo « vedette » en grand, les autres en carrousel défilant. Choisissez un format d'image et une animation prédéfinie par publication."
    add-label="Ajouter une promotion"
    :fields="[
      { key: 'image', label: 'Visuel de la publication', type: 'image' },
      { key: 'title', label: 'Titre', placeholder: 'Ex. Offre de rentrée -20%' },
      { key: 'subtitle', label: 'Sous-titre', placeholder: 'Accroche affichée sur la page détail' },
      { key: 'category', label: 'Type de publication', type: 'select', options: PUBLICATION_TYPES },
      { key: 'animation', label: 'Animation', type: 'select', options: PROMO_ANIMATION_OPTIONS },
      { key: 'featured', label: 'Mettre en avant (grand format)', type: 'bool', placeholder: 'Afficher en vedette' },
      { key: 'body', label: 'Description courte', type: 'textarea', rows: 2, placeholder: 'Résumé affiché sur les cartes' },
      { key: 'details', label: 'Détails de la promotion', type: 'textarea', rows: 5, placeholder: 'Texte complet affiché sur la page détail' },
      { key: 'codes', label: 'Codes promo / offres', type: 'codes' },
      { key: 'conditions', label: 'Conditions', type: 'textarea', rows: 3, placeholder: 'Mentions, dates de validité, restrictions…' },
      { key: 'valid_until', label: 'Valable jusqu\'au', placeholder: 'Ex. 30 septembre 2026' },
      { key: 'merchant_name', label: 'Commerçant / marque concerné', placeholder: 'Ex. Restaurant Kenov' },
      { key: 'merchant_email', label: 'E-mail du commerçant (reçoit les commandes)', placeholder: 'commerce@exemple.com' },
      { key: 'link_url', label: 'Lien externe (optionnel)', type: 'url' },
      { key: 'qr_target', label: 'QR code', type: 'qr', placeholder: 'Laissez vide pour pointer vers la page de la promo sur novagraphikvisu.com' },
    ]"
    :item-label="(it) => it.title || 'Sans titre'"
    :item-sub-label="(it) => it.category"
    :new-defaults="{ image: '', title: 'Nouvelle promotion', subtitle: '', category: 'Flyer', animation: 'fade', featured: 0, body: '', details: '', codes: [], conditions: '', valid_until: '', merchant_name: '', merchant_email: '', link_url: '', qr_target: '' }"
  />
</template>
