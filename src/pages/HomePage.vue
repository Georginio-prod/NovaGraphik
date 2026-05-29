<script setup lang="ts">
import { computed } from 'vue'
import { useViewport } from '@/composables/useViewport'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NSectionHeader from '@/components/base/NSectionHeader.vue'
import NPlaceholder from '@/components/base/NPlaceholder.vue'
import ServiceCard from '@/components/sections/ServiceCard.vue'
import CtaBand from '@/components/sections/CtaBand.vue'

const { isMobile, isTablet } = useViewport()

const SERVICES: [string, string, string][] = [
  ['palette', 'Identité visuelle', 'Logos, charte graphique & rebranding sur mesure.'],
  ['printer', 'Supports imprimés', 'Cartes, flyers, brochures, bannières & roll-ups.'],
  ['share-2', 'Réseaux sociaux', 'Visuels & packs cohérents pour vos campagnes.'],
  ['clapperboard', 'Motion design', 'Animations, teasers & montage vidéo.'],
  ['box', '3D / 2D', 'Modélisation et création 3D & 2D.'],
  ['camera', 'Photo & reportage', 'Photographie pro & reportage audiovisuel.'],
  ['monitor', 'Web & UX/UI', 'Maquettes de sites vitrine & e-commerce.'],
  ['mail', 'Email marketing', 'Design de campagnes & signatures mail.'],
]
const TEAM: [string, string, number][] = [
  ['AMEGNAGLO K.S', 'Graphiste Designer', 0],
  ['TAMEGNON K.K', 'Monteur vidéo · YouTube', 1],
  ['GEORGE', 'Web designer', 2],
]

const servicesCols = computed(() =>
  isMobile.value || isTablet.value ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
)
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="hero">
      <img src="/assets/compass-mark-white.png" alt="" class="hero-mark" />
      <NContainer>
        <div class="hero-inner" :class="{ 'is-mobile': isMobile }">
          <NEyebrow on-dark style="margin-bottom: 22px;">Agence créative · Communication visuelle</NEyebrow>
          <h1 class="hero-title">
            L'essence du<br /><span class="accent">raffinement</span> visuel.
          </h1>
          <p class="hero-sub">
            Nous accompagnons les entreprises, marques et particuliers dans la création
            d'une communication visuelle forte, moderne et impactante.
          </p>
          <div class="hero-cta">
            <NButton variant="accent" size="lg" icon="arrow-right" to="/contact">Demander un devis</NButton>
            <NButton variant="ghostDark" size="lg" to="/portfolios">Découvrir nos services</NButton>
          </div>
        </div>
      </NContainer>
    </section>

    <!-- SERVICES -->
    <section class="sec services">
      <NContainer>
        <NSectionHeader
          eyebrow="Nos services"
          title="Tout ce qui est lié au digital"
          intro="De l'identité de marque au motion design, nous couvrons l'ensemble de votre communication visuelle."
        />
        <div class="svc-grid" :style="{ gridTemplateColumns: servicesCols }">
          <ServiceCard
            v-for="s in SERVICES"
            :key="s[1]"
            v-reveal
            :icon="s[0]"
            :title="s[1]"
            :desc="s[2]"
          />
        </div>
      </NContainer>
    </section>

    <!-- PORTFOLIO TEASER -->
    <section class="sec teaser">
      <NContainer>
        <div class="teaser-head">
          <NSectionHeader eyebrow="Portfolios" title="Notre univers créatif" />
          <NButton v-if="!isMobile" variant="ghost" icon="arrow-right" to="/portfolios">Voir tout</NButton>
        </div>
        <div class="mosaic" :class="{ 'is-mobile': isMobile }">
          <div class="span2"><NPlaceholder label="Branding — Visiosphere" :idx="0" :height="isMobile ? 200 : '100%'" /></div>
          <NPlaceholder label="Logo" :idx="2" :height="isMobile ? 160 : '100%'" />
          <NPlaceholder label="Motion design" :idx="3" :height="isMobile ? 160 : '100%'" />
          <NPlaceholder label="Photographie" :idx="4" :height="isMobile ? 160 : '100%'" />
          <NPlaceholder label="3D" :idx="1" :height="isMobile ? 160 : '100%'" />
        </div>
        <NButton
          v-if="isMobile"
          variant="ghost"
          icon="arrow-right"
          to="/portfolios"
          block
          style="margin-top: 22px;"
        >Voir tout le portfolio</NButton>
      </NContainer>
    </section>

    <!-- TEAM -->
    <section class="sec team">
      <NContainer>
        <NSectionHeader
          eyebrow="Qui sommes-nous"
          title="L'équipe Nova"
          align="center"
          intro="Une équipe passionnée qui met sa créativité et son sens du détail au service de votre réussite."
        />
        <div class="team-grid" :class="{ 'is-mobile': isMobile }">
          <div v-for="t in TEAM" :key="t[0]" v-reveal class="member">
            <NPlaceholder :idx="t[2]" :height="260" radius="var(--r-lg)" />
            <h3 class="m-name">{{ t[0] }}</h3>
            <NEyebrow style="font-size: 11px;">{{ t[1] }}</NEyebrow>
          </div>
        </div>
      </NContainer>
    </section>

    <CtaBand />
  </div>
</template>

<style scoped>
.hero {
  background: linear-gradient(150deg, #022c3d 0%, #034159 45%, #025951 100%);
  position: relative;
  overflow: hidden;
}
.hero-mark {
  position: absolute;
  right: -120px;
  top: 50%;
  transform: translateY(-50%);
  width: 620px;
  opacity: 0.07;
  pointer-events: none;
}
.hero-inner { padding: 110px 0 120px; position: relative; }
.hero-inner.is-mobile { padding: 64px 0 72px; }
.hero-title {
  font-family: var(--font-display);
  font-weight: 600;
  color: #fff;
  font-size: clamp(44px, 7vw, 84px);
  line-height: 0.98;
  letter-spacing: -0.025em;
  margin: 0;
  max-width: 900px;
}
.hero-title .accent { font-style: italic; color: var(--nova-lime); }
.hero-sub {
  font-size: 19px;
  line-height: 1.6;
  color: var(--fg-on-dark-2);
  max-width: 560px;
  margin: 28px 0 40px;
}
.hero-cta { display: flex; gap: 14px; flex-wrap: wrap; }

.sec { padding: 96px 0; }
.services { background: var(--nova-paper); }
.svc-grid { display: grid; gap: 18px; margin-top: 48px; }

.teaser { padding: 0 0 96px; background: var(--nova-paper); }
.teaser-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
}
.mosaic {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  grid-template-rows: 200px 200px;
  gap: 18px;
}
.mosaic .span2 { grid-row: span 2; }
.mosaic.is-mobile {
  grid-template-columns: 1fr;
  grid-template-rows: none;
}
.mosaic.is-mobile .span2 { grid-row: auto; }

.team { background: var(--nova-fog); }
.team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
.team-grid.is-mobile { grid-template-columns: 1fr; }
.member { text-align: center; }
.m-name {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  margin: 18px 0 4px;
  color: var(--fg-1);
}

@media (max-width: 759px) {
  .sec { padding: 64px 0; }
  .svc-grid { gap: 12px; margin-top: 32px; }
  .team-grid { margin-top: 32px; }
}
</style>
