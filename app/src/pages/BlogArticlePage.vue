<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { api, type Article } from '@/lib/api'
import { novaGrad } from '@/lib/gradients'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NIcon from '@/components/base/NIcon.vue'
import CtaBand from '@/components/sections/CtaBand.vue'

const route = useRoute()
const article = ref<Article | null>(null)
const loading = ref(true)
const notFound = ref(false)

const paragraphs = computed(() =>
  (article.value?.body || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
)

async function load(slug: string) {
  loading.value = true
  notFound.value = false
  article.value = null
  try {
    const d = await api.get<{ item: Article }>(`/articles/${slug}`)
    article.value = d.item
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
    <section v-if="article" class="bg-nova-paper">
      <!-- header -->
      <div class="bg-gradient-to-b from-nova-navy-900 to-nova-navy text-white">
        <NContainer>
          <div class="py-14 tab:py-[88px] max-w-[760px]">
            <RouterLink to="/blogs" class="inline-flex items-center gap-1.5 text-fg-on-dark-2 text-[13px] no-underline hover:text-white mb-6">
              <NIcon name="arrow-left" :size="15" /> Tous les articles
            </RouterLink>
            <NEyebrow on-dark>{{ article.category }} · {{ article.date }}</NEyebrow>
            <h1 class="font-display text-[clamp(30px,5vw,52px)] font-semibold leading-tight tracking-tight mt-3 mb-0">
              {{ article.title }}
            </h1>
            <p v-if="article.excerpt" class="text-[17px] text-fg-on-dark-2 leading-relaxed mt-5 mb-0">
              {{ article.excerpt }}
            </p>
          </div>
        </NContainer>
      </div>

      <NContainer>
        <div class="max-w-[760px] py-12 tab:py-16">
          <div
            class="aspect-[16/7] w-full rounded-xl overflow-hidden mb-10"
            :style="{ background: novaGrad(article.id) }"
          >
            <img
              v-if="article.cover_image"
              :src="article.cover_image"
              :alt="article.title"
              class="w-full h-full object-cover"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
          </div>
          <article class="flex flex-col gap-5">
            <p v-for="(p, i) in paragraphs" :key="i" class="text-[16.5px] leading-relaxed text-fg-2 m-0">{{ p }}</p>
            <p v-if="!paragraphs.length" class="text-fg-3 m-0">Article à venir.</p>
          </article>
          <div class="mt-10 pt-8 border-t border-line flex flex-wrap gap-3 items-center justify-between">
            <RouterLink to="/blogs" class="inline-flex items-center gap-1.5 text-nova-teal text-[14px] font-semibold no-underline hover:text-nova-navy">
              <NIcon name="arrow-left" :size="16" /> Tous les articles
            </RouterLink>
            <NButton variant="accent" icon="arrow-right" to="/contact">Demander un devis</NButton>
          </div>
        </div>
      </NContainer>
    </section>

    <section v-else-if="loading" class="bg-nova-paper">
      <NContainer><p class="py-24 text-center text-fg-3">Chargement…</p></NContainer>
    </section>

    <section v-else class="bg-nova-paper">
      <NContainer>
        <div class="py-24 text-center">
          <h1 class="font-display text-3xl font-semibold text-fg-1 mb-3">Article introuvable</h1>
          <p class="text-fg-3 mb-6">Cet article n'existe pas ou a été retiré.</p>
          <NButton variant="ghost" icon="arrow-left" to="/blogs">Retour aux articles</NButton>
        </div>
      </NContainer>
    </section>

    <CtaBand />
  </div>
</template>
