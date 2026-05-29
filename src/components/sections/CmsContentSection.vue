<script setup lang="ts">
import { computed } from 'vue'
import type { Section } from '@/lib/api'
import NContainer from '@/components/base/NContainer.vue'
import NSectionHeader from '@/components/base/NSectionHeader.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NIcon from '@/components/base/NIcon.vue'
import NPlaceholder from '@/components/base/NPlaceholder.vue'

const props = defineProps<{ section: Section; alt?: boolean }>()

const tpl = computed(() => props.section.template || 'text')
// `data` is parsed to an object by the API; guard anyway.
const data = computed<Record<string, any>>(() =>
  props.section.data && typeof props.section.data === 'object' ? (props.section.data as any) : {},
)
const items = computed<any[]>(() => (Array.isArray(data.value.items) ? data.value.items : []))
const bg = computed(() => (props.alt ? 'bg-nova-fog' : 'bg-nova-paper'))
</script>

<template>
  <!-- TEXT -->
  <section v-if="tpl === 'text'" class="py-16 tab:py-24" :class="bg">
    <NContainer>
      <NSectionHeader :eyebrow="section.type" :title="section.title" :intro="section.body" align="center" />
    </NContainer>
  </section>

  <!-- FEATURE (icon + title + body) -->
  <section v-else-if="tpl === 'feature'" class="py-16 tab:py-24" :class="bg">
    <NContainer>
      <div v-reveal class="max-w-[680px] mx-auto text-center">
        <div class="w-16 h-16 rounded-lg bg-nova-lime grid place-items-center mx-auto mb-6 text-[#042b16]">
          <NIcon :name="section.icon || 'sparkles'" :size="28" />
        </div>
        <NEyebrow v-if="section.type" class="mb-3">{{ section.type }}</NEyebrow>
        <h2 class="font-display text-[clamp(28px,4vw,42px)] font-semibold tracking-tight text-fg-1 m-0">
          {{ section.title }}
        </h2>
        <p v-if="section.body" class="text-[17px] leading-relaxed text-fg-2 mt-4 whitespace-pre-line">
          {{ section.body }}
        </p>
      </div>
    </NContainer>
  </section>

  <!-- CARDS -->
  <section v-else-if="tpl === 'cards'" class="py-16 tab:py-24" :class="bg">
    <NContainer>
      <NSectionHeader :eyebrow="section.type" :title="section.title" :intro="section.body" align="center" />
      <div class="grid grid-cols-1 tab:grid-cols-2 desk:grid-cols-3 gap-[18px] mt-12">
        <div
          v-for="(it, i) in items"
          :key="i"
          v-reveal="i * 60"
          class="group bg-nova-surface rounded-lg p-[26px] border border-line shadow-nova-xs transition-all duration-nova hover:-translate-y-[3px] hover:shadow-nova-md hover:border-nova-teal-300"
        >
          <div
            class="w-[46px] h-[46px] rounded-md bg-nova-fog grid place-items-center text-nova-teal transition-colors duration-nova group-hover:bg-nova-lime group-hover:text-[#042b16]"
          >
            <NIcon :name="it.icon || 'sparkles'" :size="22" />
          </div>
          <h3 class="font-sans text-base font-semibold mt-[18px] mb-1.5 text-fg-1">{{ it.title }}</h3>
          <p class="text-[13px] leading-snug text-fg-3 m-0">{{ it.desc }}</p>
        </div>
      </div>
    </NContainer>
  </section>

  <!-- GALLERY -->
  <section v-else-if="tpl === 'gallery'" class="py-16 tab:py-24" :class="bg">
    <NContainer>
      <NSectionHeader :eyebrow="section.type" :title="section.title" :intro="section.body" align="center" />
      <div v-if="items.length" class="grid grid-cols-2 tab:grid-cols-3 gap-[18px] mt-12">
        <figure
          v-for="(it, i) in items"
          :key="i"
          v-reveal="(i % 3) * 60"
          class="m-0 rounded-lg overflow-hidden border border-line bg-nova-surface"
        >
          <img v-if="it.image" :src="it.image" :alt="it.caption || ''" class="w-full h-[200px] object-cover block" />
          <NPlaceholder v-else :idx="i" :height="200" radius="0" />
          <figcaption v-if="it.caption" class="px-4 py-3 text-[13px] text-fg-2">{{ it.caption }}</figcaption>
        </figure>
      </div>
      <p v-else class="text-center text-fg-3 mt-8">Aucune image pour le moment.</p>
    </NContainer>
  </section>

  <!-- BANNER -->
  <section v-else-if="tpl === 'banner'" class="bg-nova-navy-900 relative overflow-hidden">
    <img
      src="/assets/compass-mark-white.png"
      alt=""
      class="absolute -right-[60px] -top-[60px] w-[320px] opacity-[0.08] pointer-events-none"
    />
    <NContainer>
      <div class="py-16 tab:py-20 relative">
        <NEyebrow v-if="section.type" on-dark class="mb-4">{{ section.type }}</NEyebrow>
        <h2
          class="font-display font-semibold text-white text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-tight m-0 max-w-[760px]"
        >
          {{ section.title }}
        </h2>
        <p
          v-if="section.body"
          class="text-[17px] leading-relaxed text-fg-on-dark-2 max-w-[580px] mt-5 whitespace-pre-line"
        >
          {{ section.body }}
        </p>
      </div>
    </NContainer>
  </section>

  <!-- CTA -->
  <section
    v-else-if="tpl === 'cta'"
    class="relative overflow-hidden bg-gradient-to-r from-nova-navy via-nova-teal to-nova-green"
  >
    <img
      src="/assets/compass-mark-white.png"
      alt=""
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] opacity-[0.08] pointer-events-none"
    />
    <NContainer>
      <div class="py-[88px] text-center relative">
        <h2 class="font-display font-semibold text-white text-[clamp(30px,4.5vw,52px)] tracking-tight m-0">
          {{ section.title }}
        </h2>
        <p v-if="section.body" class="text-[17px] text-white/85 max-w-[520px] mx-auto mt-[18px] mb-8">
          {{ section.body }}
        </p>
        <NButton variant="accent" size="lg" icon="arrow-right" :to="data.buttonLink || '/contact'">
          {{ data.buttonLabel || 'Demander un devis' }}
        </NButton>
      </div>
    </NContainer>
  </section>

  <!-- fallback -->
  <section v-else class="py-16 tab:py-24" :class="bg">
    <NContainer>
      <NSectionHeader :eyebrow="section.type" :title="section.title" :intro="section.body" align="center" />
    </NContainer>
  </section>
</template>
