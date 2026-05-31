<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useViewport } from '@/composables/useViewport'
import { useArticles } from '@/composables/useEditable'
import type { Article } from '@/lib/api'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NPlaceholder from '@/components/base/NPlaceholder.vue'
import PageBanner from '@/components/sections/PageBanner.vue'
import CtaBand from '@/components/sections/CtaBand.vue'

const { isMobile } = useViewport()

const FALLBACK_ARTICLES: Article[] = [
  { id: -1, title: 'Pourquoi un portfolio web est essentiel', slug: '', category: 'Web', excerpt: "Dans le monde numérique d'aujourd'hui, un site portfolio est essentiel pour toute agence de communication…", body: '', cover_image: '', date: '12 mai 2026', position: 0, visible: 1 },
  { id: -2, title: "L'art du motion design court", slug: '', category: 'Motion', excerpt: "Comment capter l'attention en moins de 30 secondes sur les réseaux sociaux.", body: '', cover_image: '', date: '04 mai 2026', position: 1, visible: 1 },
  { id: -3, title: 'Construire une identité de marque forte', slug: '', category: 'Branding', excerpt: "Couleurs, typographies, déclinaisons : les fondations d'une charte graphique réussie.", body: '', cover_image: '', date: '28 avr. 2026', position: 2, visible: 1 },
  { id: -4, title: '5 tendances design 2026', slug: '', category: 'Tendances', excerpt: '', body: '', cover_image: '', date: '20 avr. 2026', position: 3, visible: 1 },
  { id: -5, title: 'Réussir son shooting produit', slug: '', category: 'Photo', excerpt: '', body: '', cover_image: '', date: '11 avr. 2026', position: 4, visible: 1 },
  { id: -6, title: 'La 3D au service du packaging', slug: '', category: '3D', excerpt: '', body: '', cover_image: '', date: '02 avr. 2026', position: 5, visible: 1 },
  { id: -7, title: 'Email marketing qui convertit', slug: '', category: 'Digital', excerpt: '', body: '', cover_image: '', date: '25 mars 2026', position: 6, visible: 1 },
]
const { items: liveArticles, loaded, load } = useArticles()
onMounted(load)
const all = computed<Article[]>(() => (loaded.value && liveArticles.value.length ? liveArticles.value : FALLBACK_ARTICLES))
// First → featured. Next 2 → "big" cards. Rest → small cards (up to 4).
const featured = computed<Article | undefined>(() => all.value[0])
const ARTICLES = computed<Article[]>(() => all.value.slice(0, 3))
const ARTICLES_SM = computed<Article[]>(() => all.value.slice(3, 7))
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
          v-if="featured"
          class="grid bg-nova-surface border border-line rounded-xl overflow-hidden shadow-nova-sm mb-12"
          :class="isMobile ? 'grid-cols-1 gap-0' : 'grid-cols-[1.2fr_1fr] gap-8'"
        >
          <NPlaceholder :idx="0" :height="isMobile ? 200 : 320" radius="rounded-none" :src="featured.cover_image || undefined" label="À la une" />
          <div class="self-center" :class="isMobile ? 'p-6' : 'py-10 pr-10 pl-2'">
            <NEyebrow>{{ featured.category }} · {{ featured.date }}</NEyebrow>
            <h2 class="font-display text-[34px] font-semibold leading-tight tracking-tight my-3.5 text-fg-1">
              {{ featured.title }}
            </h2>
            <p class="text-[15px] leading-relaxed text-fg-2 m-0 mb-[22px]">{{ featured.excerpt }}</p>
            <NButton variant="ghost" icon="arrow-right">Lire l'article</NButton>
          </div>
        </article>

        <div
          v-if="ARTICLES.length > 1"
          class="grid gap-[22px] mb-[22px]"
          :class="isMobile ? 'grid-cols-1' : 'grid-cols-2'"
        >
          <article
            v-for="(a, i) in ARTICLES.slice(1)"
            :key="a.id"
            v-reveal="i * 80"
            class="bg-nova-surface border border-line rounded-lg overflow-hidden cursor-pointer shadow-nova-xs transition-all duration-nova ease-nova hover:shadow-nova-md hover:-translate-y-[3px]"
          >
            <NPlaceholder :idx="i + 3" :height="180" radius="rounded-none" :src="a.cover_image || undefined" />
            <div class="p-5 px-[22px]">
              <NEyebrow class="text-[10px]">{{ a.category }} · {{ a.date }}</NEyebrow>
              <h3 class="font-display text-[23px] font-semibold my-2 leading-tight text-fg-1">{{ a.title }}</h3>
              <p class="text-[13.5px] leading-snug text-fg-3 m-0">{{ a.excerpt }}</p>
            </div>
          </article>
        </div>

        <div
          v-if="ARTICLES_SM.length"
          class="grid gap-[22px]"
          :class="isMobile ? 'grid-cols-2' : 'grid-cols-4'"
        >
          <article
            v-for="(a, i) in ARTICLES_SM"
            :key="a.id"
            v-reveal="i * 70"
            class="group cursor-pointer transition-transform duration-nova hover:-translate-y-0.5"
          >
            <NPlaceholder :idx="i + 1" :height="120" :src="a.cover_image || undefined" />
            <div class="pt-3">
              <NEyebrow class="text-[9.5px]">{{ a.category }} · {{ a.date }}</NEyebrow>
              <h4 class="font-sans text-[14.5px] font-semibold mt-1.5 mb-0 leading-snug text-fg-1 transition-colors duration-nova group-hover:text-nova-teal">
                {{ a.title }}
              </h4>
            </div>
          </article>
        </div>
      </NContainer>
    </section>
    <CtaBand />
  </div>
</template>
