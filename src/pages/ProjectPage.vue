<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { api, type PortfolioItem } from '@/lib/api'
import { novaGrad } from '@/lib/gradients'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NIcon from '@/components/base/NIcon.vue'
import CtaBand from '@/components/sections/CtaBand.vue'

const route = useRoute()
const item = ref<PortfolioItem | null>(null)
const loading = ref(true)
const notFound = ref(false)

async function load(slug: string) {
  loading.value = true
  notFound.value = false
  item.value = null
  try {
    const d = await api.get<{ item: PortfolioItem }>(`/portfolio/${slug}`)
    item.value = d.item
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}
onMounted(() => load(String(route.params.slug)))
watch(() => route.params.slug, (s) => s && load(String(s)))
</script>

<template>
  <div>
    <section class="bg-nova-navy-900 relative overflow-hidden">
      <img src="/assets/compass-mark-white.png" alt="" class="absolute -right-[60px] -top-[60px] w-[320px] opacity-[0.08] pointer-events-none" />
      <NContainer>
        <div class="py-12 tab:py-16 relative">
          <RouterLink to="/portfolios" class="inline-flex items-center gap-2 text-fg-on-dark-2 hover:text-white text-[13px] no-underline mb-6">
            <NIcon name="arrow-left" :size="15" /> Tous les projets
          </RouterLink>
          <template v-if="item">
            <NEyebrow on-dark class="mb-3">{{ item.category }}</NEyebrow>
            <h1 class="font-display font-semibold text-white text-[clamp(36px,5vw,64px)] leading-[1.05] m-0 max-w-[760px]">{{ item.title }}</h1>
          </template>
          <h1 v-else-if="!loading" class="font-display text-white text-4xl m-0">Réalisation introuvable</h1>
        </div>
      </NContainer>
    </section>

    <section v-if="item" class="py-12 tab:py-16 bg-nova-paper">
      <NContainer>
        <div class="rounded-xl overflow-hidden border border-line">
          <img v-if="item.cover_image" :src="item.cover_image" :alt="item.title" class="w-full max-h-[520px] object-cover block" />
          <div v-else class="h-[320px]" :style="{ background: novaGrad(item.id) }" />
        </div>

        <p v-if="item.description" class="text-[17px] leading-relaxed text-fg-2 max-w-[760px] mt-10 whitespace-pre-line">
          {{ item.description }}
        </p>

        <div v-if="item.images && item.images.length" class="grid grid-cols-2 tab:grid-cols-3 gap-[18px] mt-10">
          <img
            v-for="(img, i) in item.images"
            :key="i"
            :src="img"
            alt=""
            v-reveal="(i % 3) * 60"
            class="w-full h-[240px] object-cover rounded-lg border border-line"
          />
        </div>

        <div class="mt-12 flex flex-wrap gap-3">
          <a
            v-if="item.external_url"
            :href="item.external_url"
            target="_blank"
            rel="noopener"
            class="font-sans font-semibold cursor-pointer border border-transparent rounded-sm inline-flex items-center justify-center gap-2 tracking-wide whitespace-nowrap no-underline transition-all duration-nova ease-nova active:scale-[0.98] text-[15px] px-[30px] py-[15px] bg-nova-navy text-white hover:bg-nova-navy-700"
          >
            Voir le projet en ligne
            <NIcon name="arrow-up-right" :size="18" />
          </a>
          <NButton variant="accent" icon="arrow-right" to="/contact">Lancer un projet similaire</NButton>
        </div>
      </NContainer>
    </section>

    <CtaBand />
  </div>
</template>
