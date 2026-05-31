<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useViewport } from '@/composables/useViewport'
import { useSiteContent } from '@/composables/useSiteContent'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NSectionHeader from '@/components/base/NSectionHeader.vue'
import NPlaceholder from '@/components/base/NPlaceholder.vue'
import ServiceCard from '@/components/sections/ServiceCard.vue'
import CtaBand from '@/components/sections/CtaBand.vue'
import { RouterLink } from 'vue-router'
import CmsContentSection from '@/components/sections/CmsContentSection.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import TeamOrgChart from '@/components/sections/TeamOrgChart.vue'
import { useTeam } from '@/composables/useTeam'
import { usePortfolio } from '@/composables/usePortfolio'

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

const servicesCols = computed(() =>
  isMobile.value || isTablet.value ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
)

const site = useSiteContent('home')
const { customSections } = site
const { members: teamMembers, load: loadTeam } = useTeam()
const { items: portfolioItems, load: loadPortfolio } = usePortfolio()
onMounted(() => {
  site.load()
  loadTeam()
  loadPortfolio()
})

// Distinct categories with the first item's cover as the category card image —
// these become the home portfolio teaser cards.
const categoryCovers = computed(() => {
  const seen = new Set<string>()
  const out: { category: string; cover: string }[] = []
  for (const it of portfolioItems.value) {
    if (it.category && !seen.has(it.category)) {
      seen.add(it.category)
      out.push({ category: it.category, cover: it.cover_image || '' })
    }
  }
  return out
})

// The "Qui sommes-nous" section is rendered right after the Hero, in a fixed
// narrative slot — all other custom CMS sections still render after the team.
const ABOUT_TYPE = 'Qui sommes-nous'
const aboutSection = computed(() => customSections.value.find((s) => s.type === ABOUT_TYPE))
const trailingSections = computed(() => customSections.value.filter((s) => s.type !== ABOUT_TYPE))

const HERO_TITLE_DEFAULT = "L'essence du raffinement visuel."
const HERO_SUB_DEFAULT =
  "Nous accompagnons les entreprises, marques et particuliers dans la création d'une communication visuelle forte, moderne et impactante."
const SERVICES_TITLE_DEFAULT = 'Tout ce qui est lié au digital'
const SERVICES_INTRO_DEFAULT =
  "De l'identité de marque au motion design, nous couvrons l'ensemble de votre communication visuelle."
const PORTFOLIO_TITLE_DEFAULT = 'Notre univers créatif'
const TEAM_TITLE_DEFAULT = "L'équipe Nova"
const TEAM_INTRO_DEFAULT =
  'Une équipe passionnée qui met sa créativité et son sens du détail au service de votre réussite.'

const heroParts = computed(() => {
  const t = site.title('Hero', HERO_TITLE_DEFAULT)
  const m = t.match(/raffinement/i)
  if (!m || m.index === undefined) return { before: t, accent: '', after: '' }
  return {
    before: t.slice(0, m.index),
    accent: t.slice(m.index, m.index + m[0].length),
    after: t.slice(m.index + m[0].length),
  }
})
</script>

<template>
  <div>
    <section class="bg-gradient-to-br from-nova-navy-900 from-0% via-nova-navy via-45% to-nova-teal-deep relative overflow-hidden">
      <img
        src="/assets/compass-mark-white.png"
        alt=""
        class="absolute -right-[120px] top-1/2 -translate-y-1/2 w-[620px] opacity-[0.07] pointer-events-none"
      />
      <NContainer>
        <div class="relative" :class="isMobile ? 'py-16 pb-[72px]' : 'py-[110px] pb-[120px]'">
          <NEyebrow on-dark class="nova-enter nova-enter-1 mb-[22px]">Agence créative · Communication visuelle</NEyebrow>
          <h1
            class="font-display font-semibold text-white text-[clamp(44px,7vw,84px)] leading-[0.98] tracking-tight m-0 max-w-[900px] nova-enter nova-enter-2"
          >
            <template v-if="heroParts.accent">{{ heroParts.before }}<br /><span class="italic text-nova-lime">{{ heroParts.accent }}</span>{{ heroParts.after }}</template>
            <template v-else>{{ heroParts.before }}</template>
          </h1>
          <p class="text-[19px] leading-relaxed text-fg-on-dark-2 max-w-[560px] my-7 mb-10 nova-enter nova-enter-3">
            {{ site.body('Hero', HERO_SUB_DEFAULT) }}
          </p>
          <div class="flex gap-3.5 flex-wrap nova-enter nova-enter-4">
            <NButton variant="accent" size="lg" icon="arrow-right" to="/contact">Demander un devis</NButton>
            <NButton variant="ghostDark" size="lg" to="/portfolios">Découvrir nos services</NButton>
          </div>
        </div>
      </NContainer>
    </section>

    <!-- Qui sommes-nous (after Hero, before Services) -->
    <AboutSection v-if="aboutSection" :section="aboutSection" :team-count="teamMembers.length" />

    <section class="py-16 tab:py-24 bg-nova-paper">
      <NContainer>
        <NSectionHeader
          eyebrow="Nos services"
          :title="site.title('Services', SERVICES_TITLE_DEFAULT)"
          :intro="site.body('Services', SERVICES_INTRO_DEFAULT)"
        />
        <div class="grid gap-[18px] mt-8 tab:mt-12" :style="{ gridTemplateColumns: servicesCols }">
          <ServiceCard
            v-for="(s, i) in SERVICES"
            :key="s[1]"
            v-reveal="i * 60"
            :icon="s[0]"
            :title="s[1]"
            :desc="s[2]"
          />
        </div>
      </NContainer>
    </section>

    <section class="pb-16 tab:pb-24 bg-nova-paper">
      <NContainer>
        <div class="flex justify-between items-end mb-10">
          <NSectionHeader eyebrow="Portfolios" :title="site.title('Portfolios', PORTFOLIO_TITLE_DEFAULT)" />
          <NButton v-if="!isMobile" variant="ghost" icon="arrow-right" to="/portfolios">Voir tout</NButton>
        </div>
        <!-- Asymmetric mosaic: 1 big + 4 small. 2 cells get a real cover photo,
             the other 3 stay as branded placeholders until more visuals come. -->
        <div
          class="grid gap-[18px]"
          :class="isMobile ? 'grid-cols-1' : 'grid-cols-[1.5fr_1fr_1fr] grid-rows-[200px_200px]'"
        >
          <template v-for="(cell, i) in categoryCovers.slice(0, 5)" :key="cell.category">
            <RouterLink
              :to="`/portfolios?cat=${encodeURIComponent(cell.category)}`"
              v-reveal="(i % 3) * 70"
              class="relative block rounded-lg overflow-hidden no-underline group"
              :class="!isMobile && i === 0 && 'row-span-2'"
              :style="{ height: isMobile ? (i === 0 ? '240px' : '180px') : '100%' }"
            >
              <!-- Only the first 2 cells show their actual cover image -->
              <template v-if="i < 2 && cell.cover">
                <img
                  :src="cell.cover"
                  :alt="cell.category"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-nova-slow ease-nova group-hover:scale-105"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-nova-navy-900/85 via-nova-navy-900/30 to-transparent" />
              </template>
              <NPlaceholder v-else :idx="i + 1" :height="'100%'" radius="rounded-none" />
              <div class="absolute inset-x-0 bottom-0 p-5 z-10">
                <div
                  class="font-display text-white font-semibold leading-tight"
                  :class="!isMobile && i === 0 ? 'text-[clamp(24px,2.5vw,34px)]' : 'text-[clamp(18px,1.8vw,24px)]'"
                >{{ cell.category }}</div>
                <div class="flex items-center gap-2 text-nova-lime text-[10px] font-glyphic tracking-[0.18em] uppercase mt-1.5 opacity-90">
                  Voir plusieurs réalisations →
                </div>
              </div>
            </RouterLink>
          </template>
        </div>
        <NButton
          v-if="isMobile"
          variant="ghost"
          icon="arrow-right"
          to="/portfolios"
          block
          class="mt-[22px]"
        >Voir tout le portfolio</NButton>
      </NContainer>
    </section>

    <section v-if="site.has('Équipe') && teamMembers.length" id="equipe" class="py-16 tab:py-24 bg-nova-fog scroll-mt-20">
      <NContainer>
        <NSectionHeader
          eyebrow="Notre équipe"
          :title="site.title('Équipe', TEAM_TITLE_DEFAULT)"
          align="center"
          :intro="site.body('Équipe', TEAM_INTRO_DEFAULT)"
        />

        <TeamOrgChart :members="teamMembers" />
      </NContainer>
    </section>

    <CmsContentSection
      v-for="(s, i) in trailingSections"
      :key="s.id"
      :section="s"
      :alt="i % 2 === 1"
    />

    <CtaBand />
  </div>
</template>
