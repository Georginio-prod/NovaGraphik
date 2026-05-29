<script setup lang="ts">
import { ref, computed } from 'vue'
import { useViewport } from '@/composables/useViewport'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NPill from '@/components/base/NPill.vue'
import NPlaceholder from '@/components/base/NPlaceholder.vue'
import NIcon from '@/components/base/NIcon.vue'
import PageBanner from '@/components/sections/PageBanner.vue'
import CtaBand from '@/components/sections/CtaBand.vue'

const { isMobile } = useViewport()

const PF_CATS = ['Tout', 'Logo', 'Flyers', 'Motion design', '3D', '2D', 'Photographie', 'UX/UI Web', 'Reportage', 'Montage vidéo']
const PF_ITEMS: [string, string, number][] = [
  ['Charte Visiosphere', 'Logo', 0], ['Affiche événement', 'Flyers', 2], ['Teaser produit', 'Motion design', 3],
  ['Packaging 3D', '3D', 1], ['Illustration 2D', '2D', 4], ['Shooting corporate', 'Photographie', 5],
  ['Site vitrine', 'UX/UI Web', 0], ['Reportage Sat', 'Reportage', 2], ['Court-métrage', 'Montage vidéo', 3],
  ['Logo restaurant', 'Logo', 4], ['Flyer promo', 'Flyers', 1], ['Animation logo', 'Motion design', 5],
]

const cat = ref('Tout')
const items = computed(() => (cat.value === 'Tout' ? PF_ITEMS : PF_ITEMS.filter((i) => i[1] === cat.value)))
</script>

<template>
  <div>
    <PageBanner
      eyebrow="Portfolios Graphik"
      title="Plongez dans nos projets"
      intro="Laissez-vous inspirer par notre univers créatif — chaque réalisation raconte une histoire de marque."
    />
    <section class="sec">
      <NContainer>
        <div class="pills">
          <NPill
            v-for="c in PF_CATS"
            :key="c"
            :active="cat === c && c !== 'Tout'"
            :accent="cat === c && c === 'Tout'"
            @click="cat = c"
          >{{ c }}</NPill>
        </div>
        <div class="pf-grid" :class="{ 'is-mobile': isMobile }">
          <div v-for="it in items" :key="it[0]" v-reveal class="pf-card">
            <div class="img">
              <NPlaceholder :idx="it[2]" :height="230" radius="0" />
              <div class="overlay">
                <span class="see">Voir le projet <NIcon name="arrow-up-right" :size="16" color="var(--nova-lime)" /></span>
              </div>
            </div>
            <div class="meta">
              <NEyebrow style="font-size: 10px;">{{ it[1] }}</NEyebrow>
              <h3>{{ it[0] }}</h3>
            </div>
          </div>
        </div>
      </NContainer>
    </section>
    <CtaBand />
  </div>
</template>

<style scoped>
.sec { padding: 56px 0 96px; background: var(--nova-paper); }
.pills { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 36px; }
.pf-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.pf-grid.is-mobile { grid-template-columns: 1fr; }

.pf-card {
  border-radius: var(--r-lg);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--dur) var(--ease-out);
  background: #fff;
  border: 1px solid var(--border-1);
}
.pf-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-4px); }
.img { position: relative; overflow: hidden; }
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(2, 44, 61, 0.55);
  display: grid;
  place-items: center;
  opacity: 0;
  transition: opacity var(--dur);
}
.pf-card:hover .overlay { opacity: 1; }
.see {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-family: var(--font-glyphic);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.meta { padding: 16px 18px; }
.meta h3 {
  font-family: var(--font-display);
  font-size: 21px;
  font-weight: 600;
  margin: 6px 0 0;
  color: var(--fg-1);
}
@media (max-width: 759px) { .sec { padding: 40px 0 64px; } }
</style>
