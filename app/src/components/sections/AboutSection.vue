<script setup lang="ts">
import type { Section } from '@/lib/api'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'

defineProps<{
  section: Section
  /** Used in the stats block — defaults are reasonable but live counts are nicer */
  teamCount?: number
  portfolioCount?: number
}>()

const SERVICE_COUNT = 8
</script>

<template>
  <section class="py-16 tab:py-24 bg-nova-paper relative overflow-hidden">
    <img
      src="/assets/compass-mark.png"
      alt=""
      class="absolute -right-[90px] top-1/2 -translate-y-1/2 w-[560px] opacity-[0.04] pointer-events-none select-none"
    />
    <NContainer>
      <div class="grid grid-cols-1 desk:grid-cols-[1.2fr_1fr] gap-12 desk:gap-20 items-center relative">
        <!-- Left: text -->
        <div v-reveal>
          <NEyebrow class="mb-4">{{ section.type }}</NEyebrow>
          <h2 class="font-display font-semibold text-[clamp(30px,4.2vw,52px)] leading-[1.1] tracking-tight text-fg-1 m-0 mb-6">
            {{ section.title }}
          </h2>
          <p class="text-[17px] leading-relaxed text-fg-2 m-0 mb-8 max-w-[560px]">
            {{ section.body }}
          </p>
          <div class="flex flex-wrap gap-3">
            <NButton variant="primary" icon="arrow-right" to="/#equipe">Découvrir l'équipe</NButton>
            <NButton variant="ghost" icon="arrow-up-right" to="/portfolios">Voir nos réalisations</NButton>
          </div>
        </div>

        <!-- Right: stats grid -->
        <div v-reveal="120" class="grid grid-cols-2 gap-3 tab:gap-4">
          <div class="bg-nova-surface border border-line rounded-lg p-5 tab:p-6 text-center transition-all duration-nova hover:border-nova-teal-300 hover:shadow-nova-sm">
            <div class="font-display text-[clamp(36px,5vw,52px)] font-semibold text-nova-teal leading-none">{{ teamCount ?? 5 }}</div>
            <div class="font-glyphic text-[10px] tracking-[0.18em] uppercase text-fg-3 mt-2">Membres</div>
          </div>
          <div class="bg-nova-surface border border-line rounded-lg p-5 tab:p-6 text-center transition-all duration-nova hover:border-nova-teal-300 hover:shadow-nova-sm">
            <div class="font-display text-[clamp(36px,5vw,52px)] font-semibold text-nova-teal leading-none">{{ portfolioCount ?? 12 }}<span class="text-[24px] tab:text-[28px] align-top">+</span></div>
            <div class="font-glyphic text-[10px] tracking-[0.18em] uppercase text-fg-3 mt-2">Réalisations</div>
          </div>
          <div class="bg-nova-surface border border-line rounded-lg p-5 tab:p-6 text-center transition-all duration-nova hover:border-nova-teal-300 hover:shadow-nova-sm">
            <div class="font-display text-[clamp(36px,5vw,52px)] font-semibold text-nova-teal leading-none">{{ SERVICE_COUNT }}</div>
            <div class="font-glyphic text-[10px] tracking-[0.18em] uppercase text-fg-3 mt-2">Services</div>
          </div>
          <div class="bg-gradient-to-br from-nova-navy via-nova-teal-deep to-nova-green rounded-lg p-5 tab:p-6 text-center text-white shadow-nova-sm flex flex-col justify-center">
            <div class="font-display text-[clamp(18px,2vw,24px)] font-semibold leading-tight italic">L'essence du raffinement</div>
            <div class="font-glyphic text-[9.5px] tracking-[0.18em] uppercase text-white/70 mt-3">Notre signature</div>
          </div>
        </div>
      </div>
    </NContainer>
  </section>
</template>
