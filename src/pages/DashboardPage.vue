<script setup lang="ts">
import { RouterLink } from 'vue-router'
import NIcon from '@/components/base/NIcon.vue'
</script>

<template>
  <div class="dash-stub">
    <img src="/assets/logo-nova-mark-white.png" alt="Nova Graphik" class="logo" />
    <p class="eyebrow">Tableau de bord</p>
    <h1>Espace d'administration</h1>
    <p class="lead">
      L'éditeur de contenu (sections, titres, menus) arrive sur la branche dédiée,
      protégé par authentification.
    </p>
    <RouterLink to="/" class="back">
      <NIcon name="arrow-left" :size="16" /> Retour au site
    </RouterLink>
  </div>
</template>

<style scoped>
.dash-stub {
  min-height: 100vh;
  background: var(--nova-navy-900);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}
.logo { width: 150px; margin-bottom: 32px; }
.eyebrow {
  font-family: var(--font-glyphic);
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--nova-lime);
  margin: 0 0 10px;
}
h1 {
  font-family: var(--font-display);
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 600;
  margin: 0 0 16px;
  color: #fff;
}
.lead { color: var(--fg-on-dark-2); max-width: 440px; margin: 0 0 32px; }
.back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--fg-on-dark-2);
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--r-sm);
  padding: 11px 18px;
  font-size: 13px;
}
.back:hover { color: #fff; border-color: rgba(255, 255, 255, 0.4); }
</style>
