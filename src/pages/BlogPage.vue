<script setup lang="ts">
import { useViewport } from '@/composables/useViewport'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NPlaceholder from '@/components/base/NPlaceholder.vue'
import PageBanner from '@/components/sections/PageBanner.vue'
import CtaBand from '@/components/sections/CtaBand.vue'

const { isMobile } = useViewport()

// [title, excerpt, category, date, gradientIdx]
const ARTICLES: [string, string, string, string, number][] = [
  ['Pourquoi un portfolio web est essentiel', "Dans le monde numérique d'aujourd'hui, un site portfolio est essentiel pour toute agence de communication…", 'Web', '12 mai 2026', 0],
  ["L'art du motion design court", "Comment capter l'attention en moins de 30 secondes sur les réseaux sociaux.", 'Motion', '04 mai 2026', 3],
  ['Construire une identité de marque forte', "Couleurs, typographies, déclinaisons : les fondations d'une charte graphique réussie.", 'Branding', '28 avr. 2026', 1],
]
// [title, category, date, gradientIdx]
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
    <section class="sec">
      <NContainer>
        <!-- Featured -->
        <article class="featured" :class="{ 'is-mobile': isMobile }">
          <NPlaceholder :idx="0" :height="isMobile ? 200 : 320" radius="0" label="À la une" />
          <div class="feat-body">
            <NEyebrow>{{ ARTICLES[0][2] }} · {{ ARTICLES[0][3] }}</NEyebrow>
            <h2>{{ ARTICLES[0][0] }}</h2>
            <p>{{ ARTICLES[0][1] }}</p>
            <NButton variant="ghost" icon="arrow-right">Lire l'article</NButton>
          </div>
        </article>

        <!-- 2-up big cards -->
        <div class="grid-2" :class="{ 'is-mobile': isMobile }">
          <article v-for="(a, i) in ARTICLES.slice(1)" :key="a[0]" v-reveal="i * 80" class="art-card">
            <NPlaceholder :idx="a[4]" :height="180" radius="0" />
            <div class="ac-body">
              <NEyebrow style="font-size: 10px;">{{ a[2] }} · {{ a[3] }}</NEyebrow>
              <h3>{{ a[0] }}</h3>
              <p>{{ a[1] }}</p>
            </div>
          </article>
        </div>

        <!-- 4-up small cards -->
        <div class="grid-4" :class="{ 'is-mobile': isMobile }">
          <article v-for="(a, i) in ARTICLES_SM" :key="a[0]" v-reveal="i * 70" class="art-sm">
            <NPlaceholder :idx="a[3]" :height="120" />
            <div class="as-body">
              <NEyebrow style="font-size: 9.5px;">{{ a[1] }} · {{ a[2] }}</NEyebrow>
              <h4>{{ a[0] }}</h4>
            </div>
          </article>
        </div>
      </NContainer>
    </section>
    <CtaBand />
  </div>
</template>

<style scoped>
.sec { padding: 56px 0 96px; background: var(--nova-paper); }

.featured {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 32px;
  background: #fff;
  border: 1px solid var(--border-1);
  border-radius: var(--r-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  margin-bottom: 48px;
}
.featured.is-mobile { grid-template-columns: 1fr; gap: 0; }
.feat-body { padding: 40px 40px 40px 8px; align-self: center; }
.featured.is-mobile .feat-body { padding: 28px 24px; }
.feat-body h2 {
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 14px 0 12px;
  color: var(--fg-1);
}
.feat-body p { font-size: 15px; line-height: 1.6; color: var(--fg-2); margin: 0 0 22px; }

.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; margin-bottom: 22px; }
.grid-2.is-mobile { grid-template-columns: 1fr; }
.art-card {
  background: #fff;
  border: 1px solid var(--border-1);
  border-radius: var(--r-lg);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-xs);
  transition: all var(--dur) var(--ease-out);
}
.art-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
.ac-body { padding: 20px 22px; }
.ac-body h3 {
  font-family: var(--font-display);
  font-size: 23px;
  font-weight: 600;
  margin: 8px 0;
  line-height: 1.15;
  color: var(--fg-1);
}
.ac-body p { font-size: 13.5px; line-height: 1.55; color: var(--fg-3); margin: 0; }

.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; }
.grid-4.is-mobile { grid-template-columns: repeat(2, 1fr); }
.art-sm { cursor: pointer; transition: transform var(--dur); }
.art-sm:hover { transform: translateY(-2px); }
.as-body { padding-top: 12px; }
.as-body h4 {
  font-family: var(--font-sans);
  font-size: 14.5px;
  font-weight: 600;
  margin: 6px 0 0;
  line-height: 1.3;
  color: var(--fg-1);
  transition: color var(--dur);
}
.art-sm:hover h4 { color: var(--nova-teal); }

@media (max-width: 759px) { .sec { padding: 40px 0 64px; } }
</style>
