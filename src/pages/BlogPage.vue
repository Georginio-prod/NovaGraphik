<script setup lang="ts">
import { useViewport } from '@/composables/useViewport'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NPlaceholder from '@/components/base/NPlaceholder.vue'
import PageBanner from '@/components/sections/PageBanner.vue'
import CtaBand from '@/components/sections/CtaBand.vue'

const { isMobile } = useViewport()

const ARTICLES: [string, string, string, string, number][] = [
  ['Pourquoi un portfolio web est essentiel', "Dans le monde numérique d'aujourd'hui, un site portfolio est essentiel pour toute agence de communication…", 'Web', '12 mai 2026', 0],
  ["L'art du motion design court", "Comment capter l'attention en moins de 30 secondes sur les réseaux sociaux.", 'Motion', '04 mai 2026', 3],
  ['Construire une identité de marque forte', "Couleurs, typographies, déclinaisons : les fondations d'une charte graphique réussie.", 'Branding', '28 avr. 2026', 1],
]
const ARTICLES_SM: [string, string, string, number][] = [
  ['5 tendances design 2026', 'Tendances', '20 avr. 2026', 4],
  ['Réussir son shooting produit', 'Photo', '11 avr. 2026', 5],
  ['La 3D au service du packaging', '3D', '02 avr. 2026', 2],
  ['Email marketing qui convertit', 'Digital', '25 mars 2026', 0],
]
</script>

<template>
  <div>
    <PageBanner
      eyebrow="Blogs · Nos articles"
      title="Idées & inspirations"
      intro="Conseils, coulisses et tendances autour du design graphique et de la communication visuelle."
    />
    <section class="py-10 tab:py-14 pb-16 tab:pb-24 bg-nova-paper">
      <NContainer>
        <article
          class="grid bg-nova-surface border border-line rounded-xl overflow-hidden shadow-nova-sm mb-12"
          :class="isMobile ? 'grid-cols-1 gap-0' : 'grid-cols-[1.2fr_1fr] gap-8'"
        >
          <NPlaceholder :idx="0" :height="isMobile ? 200 : 320" radius="rounded-none" label="À la une" />
          <div class="self-center" :class="isMobile ? 'p-6' : 'py-10 pr-10 pl-2'">
            <NEyebrow>{{ ARTICLES[0][2] }} · {{ ARTICLES[0][3] }}</NEyebrow>
            <h2 class="font-display text-[34px] font-semibold leading-tight tracking-tight my-3.5 text-fg-1">
              {{ ARTICLES[0][0] }}
            </h2>
            <p class="text-[15px] leading-relaxed text-fg-2 m-0 mb-[22px]">{{ ARTICLES[0][1] }}</p>
            <NButton variant="ghost" icon="arrow-right">Lire l'article</NButton>
          </div>
        </article>

        <div
          class="grid gap-[22px] mb-[22px]"
          :class="isMobile ? 'grid-cols-1' : 'grid-cols-2'"
        >
          <article
            v-for="(a, i) in ARTICLES.slice(1)"
            :key="a[0]"
            v-reveal="i * 80"
            class="bg-nova-surface border border-line rounded-lg overflow-hidden cursor-pointer shadow-nova-xs transition-all duration-nova ease-nova hover:shadow-nova-md hover:-translate-y-[3px]"
          >
            <NPlaceholder :idx="a[4]" :height="180" radius="rounded-none" />
            <div class="p-5 px-[22px]">
              <NEyebrow class="text-[10px]">{{ a[2] }} · {{ a[3] }}</NEyebrow>
              <h3 class="font-display text-[23px] font-semibold my-2 leading-tight text-fg-1">{{ a[0] }}</h3>
              <p class="text-[13.5px] leading-snug text-fg-3 m-0">{{ a[1] }}</p>
            </div>
          </article>
        </div>

        <div
          class="grid gap-[22px]"
          :class="isMobile ? 'grid-cols-2' : 'grid-cols-4'"
        >
          <article
            v-for="(a, i) in ARTICLES_SM"
            :key="a[0]"
            v-reveal="i * 70"
            class="group cursor-pointer transition-transform duration-nova hover:-translate-y-0.5"
          >
            <NPlaceholder :idx="a[3]" :height="120" />
            <div class="pt-3">
              <NEyebrow class="text-[9.5px]">{{ a[1] }} · {{ a[2] }}</NEyebrow>
              <h4 class="font-sans text-[14.5px] font-semibold mt-1.5 mb-0 leading-snug text-fg-1 transition-colors duration-nova group-hover:text-nova-teal">
                {{ a[0] }}
              </h4>
            </div>
          </article>
        </div>
      </NContainer>
    </section>
    <CtaBand />
  </div>
</template>
