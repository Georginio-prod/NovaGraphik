<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useViewport } from '@/composables/useViewport'
import { usePortfolio } from '@/composables/usePortfolio'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NPill from '@/components/base/NPill.vue'
import NPlaceholder from '@/components/base/NPlaceholder.vue'
import NIcon from '@/components/base/NIcon.vue'
import PageBanner from '@/components/sections/PageBanner.vue'
import CtaBand from '@/components/sections/CtaBand.vue'

const { isMobile } = useViewport()
const { items, categories, load } = usePortfolio()
const route = useRoute()
const router = useRouter()
onMounted(load)

// `cat` is kept in sync with the ?cat=… URL query so deep links from the
// home teaser ("Voir plusieurs réalisations") preselect the right filter.
function readCatFromUrl(): string {
  const q = route.query.cat
  return typeof q === 'string' && q ? q : 'Tout'
}
const cat = ref(readCatFromUrl())
watch(() => route.query.cat, () => { cat.value = readCatFromUrl() })

function setCat(c: string) {
  cat.value = c
  router.replace({ query: { ...route.query, cat: c === 'Tout' ? undefined : c } })
}

const cats = computed(() => ['Tout', ...categories.value])
const filtered = computed(() => (cat.value === 'Tout' ? items.value : items.value.filter((i) => i.category === cat.value)))
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
        <div v-if="cats.length > 1" class="flex gap-2.5 flex-wrap mb-9">
          <NPill
            v-for="c in cats"
            :key="c"
            :active="cat === c && c !== 'Tout'"
            :accent="cat === c && c === 'Tout'"
            @click="setCat(c)"
          >{{ c }}</NPill>
        </div>

        <div v-if="filtered.length" class="grid gap-[22px]" :class="isMobile ? 'grid-cols-1' : 'grid-cols-3'">
          <RouterLink
            v-for="(it, i) in filtered"
            :key="it.id"
            :to="`/portfolio/${it.slug}`"
            v-reveal="(i % 3) * 70"
            class="group rounded-lg overflow-hidden cursor-pointer shadow-nova-sm transition-all duration-nova ease-nova bg-nova-surface border border-line hover:shadow-nova-lg hover:-translate-y-1 no-underline block"
          >
            <div class="relative overflow-hidden">
              <img v-if="it.cover_image" :src="it.cover_image" :alt="it.title" class="w-full h-[230px] object-cover block" />
              <NPlaceholder v-else :idx="i" :height="230" radius="rounded-none" />
              <div
                class="absolute inset-0 bg-[rgba(2,44,61,0.55)] grid place-items-center opacity-0 transition-opacity duration-nova group-hover:opacity-100"
              >
                <span class="inline-flex items-center gap-2 text-white font-glyphic text-xs tracking-[0.18em] uppercase">
                  Voir le projet <NIcon name="arrow-up-right" :size="16" color="#0cf25d" />
                </span>
              </div>
            </div>
            <div class="px-[18px] py-4">
              <NEyebrow class="text-[10px]">{{ it.category }}</NEyebrow>
              <h3 class="font-display text-[21px] font-semibold mt-1.5 mb-0 text-fg-1">{{ it.title }}</h3>
            </div>
          </RouterLink>
        </div>
        <p v-else class="text-fg-3">Aucune réalisation pour le moment.</p>
      </NContainer>
    </section>
    <CtaBand />
  </div>
</template>
