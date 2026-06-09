<script setup lang="ts">
import NButton from '@/components/base/NButton.vue'
</script>

<template>
  <section class="bg-gradient-to-b from-nova-green from-[-10%] via-nova-teal to-nova-navy relative overflow-hidden">
    <img
      src="/assets/compass-mark-white.png"
      alt=""
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] opacity-[0.08] pointer-events-none"
    />
    <div class="mx-auto max-w-[1200px] px-8 py-[88px] text-center relative">
      <h2 class="font-display font-semibold text-[clamp(30px,4.5vw,52px)] text-white m-0 tracking-tight">
        Donnons vie à votre marque.
      </h2>
      <p class="text-[17px] text-white/85 max-w-[520px] mx-auto my-[18px] mb-8">
        Parlons de votre projet — nous répondons sous 24 h avec une proposition sur mesure.
      </p>
      <div class="flex gap-3.5 justify-center flex-wrap">
        <NButton variant="accent" size="lg" icon="arrow-right" to="/contact">Demander un devis</NButton>
        <NButton variant="ghostDark" size="lg" to="/grille-tarifaire">Voir la grille tarifaire</NButton>
      </div>
    </div>
  </section>
</template>
