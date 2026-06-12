<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, nextTick, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { usePromotions } from '@/composables/useEditable'
import { animationClass } from '@/lib/promoAnimations'
import type { Promotion } from '@/lib/api'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NIcon from '@/components/base/NIcon.vue'
import NPlaceholder from '@/components/base/NPlaceholder.vue'
import NSkeleton from '@/components/base/NSkeleton.vue'
import PageBanner from '@/components/sections/PageBanner.vue'
import CtaBand from '@/components/sections/CtaBand.vue'

// Démos affichées tant qu'aucune promotion n'a été publiée depuis le dashboard.
const mk = (
  p: Partial<Promotion> & Pick<Promotion, 'id' | 'title' | 'category' | 'animation'>,
): Promotion => ({
  slug: '', body: '', image: '', link_url: '', featured: 0, qr_target: '', subtitle: '',
  details: '', conditions: '', merchant_name: '', merchant_email: '', valid_until: '',
  codes: [], position: 0, visible: 1, ...p,
})
const FALLBACK: Promotion[] = [
  mk({ id: -1, title: 'Offre de rentrée −20%', category: 'Affiche', body: 'Profitez de notre offre spéciale sur toutes nos prestations de communication visuelle.', animation: 'rise', featured: 1, qr_target: 'https://novagraphikvisu.com/', position: 0 }),
  mk({ id: -2, title: 'Nouveau flyer événementiel', category: 'Flyer', animation: 'slide-left', position: 1 }),
  mk({ id: -3, title: 'Story Instagram animée', category: 'Story', animation: 'zoom', position: 2 }),
  mk({ id: -4, title: 'Bannière web responsive', category: 'Bannière', animation: 'slide-right', position: 3 }),
  mk({ id: -5, title: 'Packaging premium', category: 'Packaging', animation: 'pop', position: 4 }),
  mk({ id: -6, title: 'Carte de visite élégante', category: 'Carte de visite', animation: 'flip', position: 5 }),
  mk({ id: -7, title: 'Post réseaux sociaux', category: 'Post réseaux', animation: 'fade', position: 6 }),
]

const { items: live, loaded, load } = usePromotions()

function onVisible() {
  if (document.visibilityState === 'visible' && loaded.value) void load()
}

onMounted(async () => {
  await load()
  await nextTick()
  setupReveal()
  document.addEventListener('visibilitychange', onVisible)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('visibilitychange', onVisible)
})

// First visit with an empty cache → show shimmer skeletons instead of flashing
// the demo fallback while the real promotions load.
const showSkeleton = computed(() => !loaded.value && !live.value.length)
const all = computed<Promotion[]>(() => (loaded.value && live.value.length ? live.value : FALLBACK))
const featured = computed<Promotion>(() => all.value.find((p) => p.featured) ?? all.value[0])
const rest = computed<Promotion[]>(() => all.value.filter((p) => p.id !== featured.value?.id))

// Constant, slow speed: scale the loop duration with the item count so adding
// more publications never makes the marquee faster.
const marqueeStyle = computed(() => ({
  '--promo-marquee-duration': `${Math.max(24, rest.value.length * 7)}s`,
}))

// Entrance animations: each card starts hidden (CSS) and plays its predefined
// keyframes the first time it scrolls into view. One-shot — never re-hidden.
const root = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
function setupReveal() {
  const els = root.value?.querySelectorAll<HTMLElement>('[data-anim]')
  if (!els) return
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'))
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          observer?.unobserve(e.target)
        }
      }
    },
    { threshold: 0.15 },
  )
  els.forEach((el) => observer!.observe(el))
}
</script>

<template>
  <div ref="root">
    <PageBanner
      eyebrow="Promotions · Nos publications"
      title="Promotions"
      intro="Découvrez nos dernières créations et offres mises en avant : flyers, affiches, stories et bien plus."
    />

    <section class="py-10 tab:py-14 pb-16 tab:pb-24 bg-nova-paper">
      <NContainer>
        <!-- Skeleton (premier chargement, cache vide) -->
        <template v-if="showSkeleton">
          <div class="grid grid-cols-1 tab:grid-cols-[1.25fr_1fr] gap-0 tab:gap-8 bg-nova-surface border border-line rounded-xl overflow-hidden shadow-nova-sm mb-12">
            <NSkeleton height="360px" radius="rounded-none" />
            <div class="p-6 tab:py-10 tab:pr-10 tab:pl-2 flex flex-col gap-3 self-center">
              <NSkeleton width="120px" height="14px" />
              <NSkeleton width="80%" height="34px" />
              <NSkeleton width="100%" height="16px" />
              <NSkeleton width="60%" height="16px" />
            </div>
          </div>
          <NSkeleton width="180px" height="14px" class="mb-4" />
          <div class="flex gap-5 overflow-hidden">
            <div v-for="i in 4" :key="i" class="w-[260px] shrink-0 bg-nova-surface border border-line rounded-lg overflow-hidden">
              <NSkeleton height="170px" radius="rounded-none" />
              <div class="p-4 flex flex-col gap-2">
                <NSkeleton width="70px" height="11px" />
                <NSkeleton width="85%" height="20px" />
              </div>
            </div>
          </div>
        </template>

        <!-- Promo vedette (grand format) -->
        <component
          :is="featured?.slug ? RouterLink : 'div'"
          v-if="featured && !showSkeleton"
          :to="featured.slug ? `/promotions/${featured.slug}` : undefined"
          data-anim
          :class="[
            animationClass(featured.animation),
            'group grid bg-nova-surface border border-line rounded-xl overflow-hidden shadow-nova-sm mb-12 grid-cols-1 gap-0 tab:grid-cols-[1.25fr_1fr] tab:gap-8 no-underline transition-shadow duration-nova hover:shadow-nova-md',
          ]"
        >
          <NPlaceholder :idx="0" :height="360" radius="rounded-none" :src="featured.image || undefined" label="À la une" />
          <div class="self-center p-6 tab:py-10 tab:pr-10 tab:pl-2">
            <NEyebrow>{{ featured.category }}</NEyebrow>
            <h2 class="font-display text-[34px] font-semibold leading-tight tracking-tight my-3.5 text-fg-1 transition-colors duration-nova group-hover:text-nova-teal">
              {{ featured.title }}
            </h2>
            <p v-if="featured.body" class="text-[15px] leading-relaxed text-fg-2 m-0 mb-[22px]">{{ featured.body }}</p>
            <span class="inline-flex items-center gap-2 text-nova-teal font-semibold text-[14px]">
              Voir la promotion <NIcon name="arrow-right" :size="16" />
            </span>
          </div>
        </component>

        <!-- Carrousel auto-défilant des autres promotions -->
        <div v-if="rest.length && !showSkeleton" class="mt-4">
          <NEyebrow class="mb-4 block">Autres publications</NEyebrow>
          <div class="promo-marquee -mx-4 px-4" :style="marqueeStyle">
            <div class="promo-marquee__track gap-5">
              <!-- deux copies pour un défilement en boucle sans couture -->
              <template v-for="copy in 2" :key="copy">
                <component
                  :is="p.slug ? RouterLink : 'div'"
                  v-for="p in rest"
                  :key="`${copy}-${p.id}`"
                  :to="p.slug ? `/promotions/${p.slug}` : undefined"
                  :aria-hidden="copy === 2 ? 'true' : undefined"
                  :data-anim="copy === 1 ? '' : undefined"
                  :class="[
                    copy === 1 ? animationClass(p.animation) : '',
                    'group block w-[260px] shrink-0 no-underline bg-nova-surface border border-line rounded-lg overflow-hidden shadow-nova-xs transition-all duration-nova ease-nova hover:shadow-nova-md hover:-translate-y-[3px]',
                  ]"
                >
                  <NPlaceholder :idx="p.position + 1" :height="170" radius="rounded-none" :src="p.image || undefined" />
                  <div class="p-4">
                    <NEyebrow class="text-[10px]">{{ p.category }}</NEyebrow>
                    <h3 class="font-display text-[20px] font-semibold my-1.5 leading-tight text-fg-1 transition-colors duration-nova group-hover:text-nova-teal">
                      {{ p.title }}
                    </h3>
                    <p v-if="p.body" class="text-[13px] leading-snug text-fg-3 m-0 line-clamp-2">{{ p.body }}</p>
                  </div>
                </component>
              </template>
            </div>
          </div>
        </div>
      </NContainer>
    </section>

    <CtaBand />
  </div>
</template>
