<script setup lang="ts">
import { useViewport } from '@/composables/useViewport'
import { novaGrad } from '@/lib/gradients'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NIcon from '@/components/base/NIcon.vue'
import NSectionHeader from '@/components/base/NSectionHeader.vue'
import PageBanner from '@/components/sections/PageBanner.vue'
import CtaBand from '@/components/sections/CtaBand.vue'

const { isMobile } = useViewport()

const PARTNERS = ['Visiosphere', 'Atelier Sahel', 'Téranga', 'Sat Media', 'Lomé Co', 'Kara Digital']
const TESTIMONIALS: [string, string, string][] = [
  ['Grâce à Nova Graphik, notre image de marque a pris vie avec des visuels qui racontent vraiment notre histoire.', 'Studio Visiosphere', 'Direction marketing'],
  ['Un sens du détail remarquable. Le rebranding a transformé notre perception sur le marché.', 'Atelier Sahel', 'Fondatrice'],
  ["Réactifs, créatifs et professionnels. Nos campagnes social media n'ont jamais été aussi cohérentes.", 'Maison Téranga', 'Responsable com'],
]
</script>

<template>
  <div>
    <PageBanner
      eyebrow="Partenaires clés"
      title="Des collaborations qui donnent vie à chaque projet"
      intro="Nous travaillons main dans la main avec des marques ambitieuses, avec passion et exigence."
    />

    <section class="py-11 tab:py-16 bg-nova-paper">
      <NContainer>
        <div
          class="grid gap-4"
          :class="isMobile ? 'grid-cols-2' : 'grid-cols-6'"
        >
          <div
            v-for="p in PARTNERS"
            :key="p"
            class="h-24 border border-line rounded-md bg-nova-surface grid place-items-center text-fg-3 font-glyphic text-[13px] tracking-widest uppercase text-center px-2"
          >{{ p }}</div>
        </div>
      </NContainer>
    </section>

    <section class="pt-6 tab:pt-10 pb-16 tab:pb-24 bg-nova-fog">
      <NContainer>
        <NSectionHeader eyebrow="Avis clients" title="Ce que disent nos clients" align="center" />
        <div
          class="grid gap-6 mt-8 tab:mt-12"
          :class="isMobile ? 'grid-cols-1' : 'grid-cols-3'"
        >
          <div
            v-for="(t, i) in TESTIMONIALS"
            :key="i"
            v-reveal="i * 80"
            class="bg-nova-surface border border-line rounded-lg p-8 shadow-nova-sm flex flex-col gap-5"
          >
            <NIcon name="quote" :size="30" color="#0cf25d" />
            <p class="font-display text-xl leading-snug italic text-fg-1 m-0 flex-1">« {{ t[0] }} »</p>
            <div class="flex items-center gap-3 border-t border-line pt-[18px]">
              <div class="w-[42px] h-[42px] rounded-full shrink-0" :style="{ background: novaGrad(i) }" />
              <div>
                <div class="font-semibold text-sm text-fg-1">{{ t[1] }}</div>
                <div class="text-xs text-fg-3">{{ t[2] }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center mt-14">
          <NEyebrow class="mb-4">Rejoignez-nous</NEyebrow>
          <NButton variant="primary" size="lg" icon="arrow-right" to="/contact">Devenir partenaire</NButton>
        </div>
      </NContainer>
    </section>

    <CtaBand />
  </div>
</template>
