<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useViewport } from '@/composables/useViewport'
import { usePartners, useTestimonials } from '@/composables/useEditable'
import { novaGrad } from '@/lib/gradients'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NIcon from '@/components/base/NIcon.vue'
import NSectionHeader from '@/components/base/NSectionHeader.vue'
import PageBanner from '@/components/sections/PageBanner.vue'
import CtaBand from '@/components/sections/CtaBand.vue'

const { isMobile } = useViewport()

const FALLBACK_PARTNERS = [
  { id: -1, name: 'Visiosphere', logo_url: '' },
  { id: -2, name: 'Atelier Sahel', logo_url: '' },
  { id: -3, name: 'Téranga', logo_url: '' },
  { id: -4, name: 'Sat Media', logo_url: '' },
  { id: -5, name: 'Lomé Co', logo_url: '' },
  { id: -6, name: 'Kara Digital', logo_url: '' },
]
const FALLBACK_TESTIMONIALS = [
  { id: -1, quote: 'Grâce à Nova Graphik, notre image de marque a pris vie avec des visuels qui racontent vraiment notre histoire.', author_name: 'Studio Visiosphere', author_role: 'Direction marketing' },
  { id: -2, quote: 'Un sens du détail remarquable. Le rebranding a transformé notre perception sur le marché.', author_name: 'Atelier Sahel', author_role: 'Fondatrice' },
  { id: -3, quote: "Réactifs, créatifs et professionnels. Nos campagnes social media n'ont jamais été aussi cohérentes.", author_name: 'Maison Téranga', author_role: 'Responsable com' },
]
const { items: livePartners, loaded: pLoaded, load: loadPartners } = usePartners()
const { items: liveTestis, loaded: tLoaded, load: loadTestis } = useTestimonials()
onMounted(() => { loadPartners(); loadTestis() })
const PARTNERS = computed<any[]>(() => (pLoaded.value && livePartners.value.length ? livePartners.value : FALLBACK_PARTNERS))
const TESTIMONIALS = computed<any[]>(() => (tLoaded.value && liveTestis.value.length ? liveTestis.value : FALLBACK_TESTIMONIALS))
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
            :key="p.id ?? p.name"
            class="h-24 border border-line rounded-md bg-nova-surface grid place-items-center text-fg-3 font-glyphic text-[13px] tracking-widest uppercase text-center px-2 overflow-hidden"
          >
            <img v-if="p.logo_url" :src="p.logo_url" :alt="p.name" class="max-w-full max-h-full object-contain" />
            <span v-else>{{ p.name }}</span>
          </div>
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
            :key="t.id ?? i"
            v-reveal="i * 80"
            class="bg-nova-surface border border-line rounded-lg p-8 shadow-nova-sm flex flex-col gap-5"
          >
            <NIcon name="quote" :size="30" color="#0cf25d" />
            <p class="font-display text-xl leading-snug italic text-fg-1 m-0 flex-1">« {{ t.quote }} »</p>
            <div class="flex items-center gap-3 border-t border-line pt-[18px]">
              <div class="w-[42px] h-[42px] rounded-full shrink-0" :style="{ background: novaGrad(i) }" />
              <div>
                <div class="font-semibold text-sm text-fg-1">{{ t.author_name }}</div>
                <div class="text-xs text-fg-3">{{ t.author_role }}</div>
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
