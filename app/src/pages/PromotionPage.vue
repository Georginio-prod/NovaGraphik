<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, nextTick, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { usePromotions } from '@/composables/useEditable'
import { animationClass } from '@/lib/promoAnimations'
import { promoUrl } from '@/lib/site'
import type { Promotion } from '@/lib/api'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NIcon from '@/components/base/NIcon.vue'
import NPlaceholder from '@/components/base/NPlaceholder.vue'
import NQrCode from '@/components/base/NQrCode.vue'
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
onMounted(async () => {
  await load()
  await nextTick()
  setupReveal()
})

const all = computed<Promotion[]>(() => (loaded.value && live.value.length ? live.value : FALLBACK))
const featured = computed<Promotion>(() => all.value.find((p) => p.featured) ?? all.value[0])
const rest = computed<Promotion[]>(() => all.value.filter((p) => p.id !== featured.value?.id))
// Promotions porteuses d'un QR code : lien explicite, ou (à défaut) la page de la
// promo sur le site, pour qu'un scan mène toujours quelque part d'utile.
const withQr = computed<Promotion[]>(() => all.value.filter((p) => p.qr_target?.trim() || p.slug))
const qrFor = (p: Promotion) => p.qr_target?.trim() || promoUrl(p.slug)

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
onBeforeUnmount(() => observer?.disconnect())
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
        <!-- Promo vedette (grand format) -->
        <component
          :is="featured?.slug ? RouterLink : 'div'"
          v-if="featured"
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
        <div v-if="rest.length" class="mt-4">
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

    <!-- Section QR codes — générés côté client à partir du lien de chaque promo -->
    <section v-if="withQr.length" class="py-12 tab:py-16 bg-nova-fog border-t border-line">
      <NContainer>
        <div class="text-center mb-8">
          <NEyebrow class="block">Scannez & découvrez</NEyebrow>
          <h2 class="font-display text-[30px] tab:text-[36px] font-semibold mt-2 text-fg-1">QR codes des promotions</h2>
          <p class="text-[14px] text-fg-3 mt-2 max-w-[560px] mx-auto">
            Scannez un code avec votre téléphone pour accéder directement à l'offre correspondante.
          </p>
        </div>
        <div class="grid gap-6 grid-cols-2 tab:grid-cols-3 desk:grid-cols-4 justify-items-center">
          <div
            v-for="p in withQr"
            :key="`qr-${p.id}`"
            class="flex flex-col items-center text-center bg-nova-surface border border-line rounded-lg p-5 shadow-nova-xs w-full max-w-[220px]"
          >
            <NQrCode :value="qrFor(p)" :size="160" />
            <div class="mt-3.5">
              <NEyebrow class="text-[9.5px]">{{ p.category }}</NEyebrow>
              <h3 class="font-sans text-[14.5px] font-semibold mt-1 leading-snug text-fg-1">{{ p.title }}</h3>
            </div>
          </div>
        </div>
      </NContainer>
    </section>

    <CtaBand />
  </div>
</template>
