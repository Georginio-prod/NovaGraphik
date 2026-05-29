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
// [quote, name, role]
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

    <section class="logos-sec">
      <NContainer>
        <div class="logos" :class="{ 'is-mobile': isMobile }">
          <div v-for="p in PARTNERS" :key="p" class="logo-box">{{ p }}</div>
        </div>
      </NContainer>
    </section>

    <section class="testi-sec">
      <NContainer>
        <NSectionHeader eyebrow="Avis clients" title="Ce que disent nos clients" align="center" />
        <div class="testi-grid" :class="{ 'is-mobile': isMobile }">
          <div v-for="(t, i) in TESTIMONIALS" :key="i" v-reveal class="testi">
            <NIcon name="quote" :size="30" color="var(--nova-lime)" />
            <p class="quote">« {{ t[0] }} »</p>
            <div class="who">
              <div class="avatar" :style="{ background: novaGrad(i) }" />
              <div>
                <div class="name">{{ t[1] }}</div>
                <div class="role">{{ t[2] }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="join">
          <NEyebrow style="margin-bottom: 16px;">Rejoignez-nous</NEyebrow>
          <NButton variant="primary" size="lg" icon="arrow-right" to="/contact">Devenir partenaire</NButton>
        </div>
      </NContainer>
    </section>

    <CtaBand />
  </div>
</template>

<style scoped>
.logos-sec { padding: 64px 0; background: var(--nova-paper); }
.logos { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
.logos.is-mobile { grid-template-columns: repeat(2, 1fr); }
.logo-box {
  height: 96px;
  border: 1px solid var(--border-1);
  border-radius: var(--r-md);
  background: #fff;
  display: grid;
  place-items: center;
  color: var(--fg-3);
  font-family: var(--font-glyphic);
  font-size: 13px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-align: center;
  padding: 0 8px;
}

.testi-sec { padding: 40px 0 96px; background: var(--nova-fog); }
.testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
.testi-grid.is-mobile { grid-template-columns: 1fr; }
.testi {
  background: #fff;
  border: 1px solid var(--border-1);
  border-radius: var(--r-lg);
  padding: 32px 28px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.quote {
  font-family: var(--font-display);
  font-size: 20px;
  line-height: 1.4;
  font-style: italic;
  color: var(--fg-1);
  margin: 0;
  flex: 1;
}
.who { display: flex; align-items: center; gap: 12px; border-top: 1px solid var(--border-1); padding-top: 18px; }
.avatar { width: 42px; height: 42px; border-radius: 50%; flex: none; }
.name { font-weight: 600; font-size: 14px; color: var(--fg-1); }
.role { font-size: 12px; color: var(--fg-3); }
.join { text-align: center; margin-top: 56px; }

@media (max-width: 759px) {
  .logos-sec { padding: 44px 0; }
  .testi-sec { padding: 24px 0 64px; }
}
</style>
