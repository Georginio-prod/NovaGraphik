<script setup lang="ts">
import { useViewport } from '@/composables/useViewport'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NIcon from '@/components/base/NIcon.vue'
import NSectionHeader from '@/components/base/NSectionHeader.vue'
import PageBanner from '@/components/sections/PageBanner.vue'
import CtaBand from '@/components/sections/CtaBand.vue'

const { isMobile } = useViewport()

const FORMULES: [string, string, string[], boolean][] = [
  ['Basique', '25 000', ['Logo simple', '1 proposition', 'Livrables HD'], false],
  ['Standard', '50 000', ['Logo + charte', '2 propositions', 'Fichiers vectoriels', 'Cartes de visite'], true],
  ['Premium', '100 000', ['Identité complète', '3 propositions', 'Pack réseaux sociaux', 'Maquette web'], false],
]

const PRICE_GROUPS: [string, string, [string, string, string][]][] = [
  ['Identité visuelle', 'palette', [
    ['Logo professionnel', 'Création sur mesure (2 à 3 propositions, livrables HD + vectoriels)', '25 000'],
    ['Charte graphique complète', "Couleurs, typographies, déclinaisons du logo, guide d'utilisation", '50 000'],
    ["Rebranding (refonte d'identité)", 'Modernisation complète de votre image visuelle', '30 000'],
  ]],
  ['Supports imprimés', 'printer', [
    ['Carte de visite', 'Conception graphique professionnelle', '5 000'],
    ['Carte de visite + impression', '100 exemplaires – papier premium 300g', '12 000 – 15 000'],
    ['Flyer / Affiche A5 ou A4', 'Design publicitaire événement ou produit', '10 000 – 15 000'],
    ['Brochure / Catalogue', 'Mise en page 4 à 12 pages', '25 000'],
    ['Bannière / Roll-up / Kakemono', 'Création + fichier prêt à imprimer', '15 000'],
  ]],
  ['Supports numériques', 'share-2', [
    ['Visuel réseaux sociaux', 'Post ou bannière (Facebook, Insta, TikTok…)', '5 000'],
    ['Pack réseaux sociaux (10 visuels)', 'Visuels cohérents pour une campagne ou un mois', '40 000'],
    ['Photomontage / Retouche pro', 'Ajustements, détourage, composition créative', '3 000 – 7 000'],
    ['Mini animation / teaser (motion)', 'Animation 10 à 30 secondes', '30 000'],
  ]],
  ['Design web & digital', 'monitor', [
    ['Maquette de site web (UI/UX)', 'Design complet site vitrine ou e-commerce', '50 000 – 100 000'],
    ['Bannière web / publicité digitale', 'Pour site ou campagne sponsorisée', '10 000'],
    ['Email marketing / signature mail', 'Design professionnel et personnalisé', '8 000'],
  ]],
  ['Autres prestations', 'sparkles', [
    ["Carte d'invitation / Menu / Certificat", 'Conception élégante et sur mesure', '8 000'],
    ['Calendrier / Agenda / Planning', 'Conception personnalisée', '15 000'],
    ["Affiche d'événement grand format", 'Pour impression ou projection numérique', 'Sur devis'],
  ]],
]
</script>

<template>
  <div>
    <PageBanner
      eyebrow="Grille tarifaire"
      title="Des tarifs clairs, sans surprise"
      intro="Les tarifs peuvent varier selon la complexité du projet, le délai et les révisions demandées. Tous les prix sont indiqués à partir de, en FCFA."
    />

    <section class="py-11 tab:py-16 pb-10 bg-nova-paper">
      <NContainer>
        <NSectionHeader eyebrow="Formules · Identité visuelle" title="Choisissez votre formule" align="center" />
        <div
          class="grid gap-[22px] mt-8 tab:mt-12 items-stretch"
          :class="isMobile ? 'grid-cols-1' : 'grid-cols-3'"
        >
          <div
            v-for="(f, i) in FORMULES"
            :key="f[0]"
            v-reveal="i * 80"
            class="relative flex flex-col rounded-xl p-[34px_30px] border shadow-nova-sm"
            :class="
              f[3]
                ? 'bg-gradient-to-br from-nova-navy to-nova-teal-deep border-transparent shadow-nova-lg scale-[1.04] max-tab:scale-100'
                : 'bg-nova-surface border-line'
            "
          >
            <span
              v-if="f[3]"
              class="absolute top-[18px] right-[18px] bg-nova-lime text-[#042b16] text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full"
            >Populaire</span>
            <NEyebrow :on-dark="f[3]">Formule</NEyebrow>
            <h3
              class="font-display text-[30px] font-semibold my-2 mb-3.5"
              :class="f[3] ? 'text-white' : 'text-fg-1'"
            >{{ f[0] }}</h3>
            <div class="flex items-baseline gap-1.5 mb-[22px]">
              <span
                class="font-display text-[40px] font-bold"
                :class="f[3] ? 'text-white' : 'text-fg-1'"
              >{{ f[1] }}</span>
              <span class="text-[13px]" :class="f[3] ? 'text-fg-on-dark-2' : 'text-fg-3'">FCFA</span>
            </div>
            <div class="flex flex-col gap-[11px] mb-[26px] flex-1">
              <div
                v-for="feat in f[2]"
                :key="feat"
                class="flex items-center gap-2 text-[13.5px]"
                :class="f[3] ? 'text-fg-on-dark-2' : 'text-fg-2'"
              >
                <NIcon name="check" :size="15" color="#0cf25d" />{{ feat }}
              </div>
            </div>
            <NButton :variant="f[3] ? 'accent' : 'ghost'" to="/contact" block>Demander un devis</NButton>
          </div>
        </div>
      </NContainer>
    </section>

    <section class="pt-10 pb-16 tab:pb-24 bg-nova-paper">
      <NContainer>
        <div v-for="g in PRICE_GROUPS" :key="g[0]" class="mb-10">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-[38px] h-[38px] rounded-md bg-nova-navy grid place-items-center">
              <NIcon :name="g[1]" :size="18" color="#fff" />
            </div>
            <h3 class="font-display text-2xl font-semibold m-0 text-fg-1">{{ g[0] }}</h3>
          </div>
          <div class="bg-nova-surface border border-line rounded-lg overflow-hidden shadow-nova-xs">
            <div
              v-for="r in g[2]"
              :key="r[0]"
              class="border-t border-line first:border-t-0"
              :class="
                isMobile
                  ? 'grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 px-4 py-3.5'
                  : 'grid grid-cols-[1.1fr_1.4fr_auto] gap-4 items-center px-[22px] py-4'
              "
            >
              <div class="font-semibold text-[14.5px] text-fg-1">{{ r[0] }}</div>
              <div v-if="!isMobile" class="text-[13px] text-fg-3 leading-normal">{{ r[1] }}</div>
              <div
                class="font-sans font-bold text-[15px] text-nova-teal whitespace-nowrap text-right"
                :class="isMobile && 'col-start-2 row-span-2 row-start-1'"
              >
                {{ r[2] }}<span v-if="r[2] !== 'Sur devis'" class="text-[11px] font-medium text-fg-3 ml-1">FCFA</span>
              </div>
              <div v-if="isMobile" class="text-xs text-fg-3 leading-snug col-start-1">{{ r[1] }}</div>
            </div>
          </div>
        </div>
      </NContainer>
    </section>

    <CtaBand />
  </div>
</template>
