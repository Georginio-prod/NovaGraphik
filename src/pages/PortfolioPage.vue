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
    <section class="py-10 tab:py-14 pb-16 tab:pb-24 bg-nova-paper">
      <NContainer>
        <div class="flex gap-2.5 flex-wrap mb-9">
          <NPill
            v-for="c in PF_CATS"
            :key="c"
            :active="cat === c && c !== 'Tout'"
            :accent="cat === c && c === 'Tout'"
            @click="cat = c"
          >{{ c }}</NPill>
        </div>
        <div
          class="grid gap-[22px]"
          :class="isMobile ? 'grid-cols-1' : 'grid-cols-3'"
        >
          <div
            v-for="(it, i) in items"
            :key="it[0]"
            v-reveal="(i % 3) * 70"
            class="group rounded-lg overflow-hidden cursor-pointer shadow-nova-sm transition-all duration-nova ease-nova bg-nova-surface border border-line hover:shadow-nova-lg hover:-translate-y-1"
          >
            <div class="relative overflow-hidden">
              <NPlaceholder :idx="it[2]" :height="230" radius="rounded-none" />
              <div
                class="absolute inset-0 bg-[rgba(2,44,61,0.55)] grid place-items-center opacity-0 transition-opacity duration-nova group-hover:opacity-100"
              >
                <span class="inline-flex items-center gap-2 text-white font-glyphic text-xs tracking-[0.18em] uppercase">
                  Voir le projet <NIcon name="arrow-up-right" :size="16" color="#0cf25d" />
                </span>
              </div>
            </div>
            <div class="px-[18px] py-4">
              <NEyebrow class="text-[10px]">{{ it[1] }}</NEyebrow>
              <h3 class="font-display text-[21px] font-semibold mt-1.5 mb-0 text-fg-1">{{ it[0] }}</h3>
            </div>
          </div>
        </div>
      </NContainer>
    </section>
    <CtaBand />
  </div>
</template>
