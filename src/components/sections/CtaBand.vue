<script setup lang="ts">
import NButton from '@/components/base/NButton.vue'
</script>

<template>
  <section class="cta">
    <img src="/assets/compass-mark-white.png" alt="" class="mark" />
    <div class="inner">
      <h2 class="title">Donnons vie à votre marque.</h2>
      <p class="lead">
        Parlons de votre projet — nous répondons sous 24 h avec une proposition sur mesure.
      </p>
      <div class="row">
        <NButton variant="accent" size="lg" icon="arrow-right" to="/contact">Demander un devis</NButton>
        <NButton variant="ghostDark" size="lg" to="/grille-tarifaire">Voir la grille tarifaire</NButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta {
  background: linear-gradient(120deg, #034159, #02735e 70%, #038c3e);
  position: relative;
  overflow: hidden;
}
.mark {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 480px;
  opacity: 0.08;
  pointer-events: none;
}
.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 88px 32px;
  text-align: center;
  position: relative;
}
.title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(30px, 4.5vw, 52px);
  color: #fff;
  margin: 0;
  letter-spacing: -0.02em;
}
.lead {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.85);
  max-width: 520px;
  margin: 18px auto 32px;
}
.row {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
