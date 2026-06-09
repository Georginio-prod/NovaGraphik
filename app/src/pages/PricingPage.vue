<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useViewport } from '@/composables/useViewport'
import { usePricingFormulas, usePricingItems } from '@/composables/useEditable'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NIcon from '@/components/base/NIcon.vue'
import NSectionHeader from '@/components/base/NSectionHeader.vue'
import PageBanner from '@/components/sections/PageBanner.vue'
import CtaBand from '@/components/sections/CtaBand.vue'

const { isMobile } = useViewport()

const { items: liveFormulas, loaded: fLoaded, load: loadFormulas } = usePricingFormulas()
const { items: liveItems, loaded: pLoaded, load: loadItems } = usePricingItems()
onMounted(() => { loadFormulas(); loadItems() })

const FORMULES = computed(() => liveFormulas.value)

// Group the flat pricing_items rows by (group_title, group_icon) for the table.
const PRICE_GROUPS = computed(() => {
  const groups = new Map<string, { title: string; icon: string; rows: any[] }>()
  for (const it of liveItems.value) {
    const key = it.group_title || 'Autres'
    if (!groups.has(key)) groups.set(key, { title: key, icon: it.group_icon || 'sparkles', rows: [] })
    groups.get(key)!.rows.push(it)
  }
  return [...groups.values()]
})
const ready = computed(() => fLoaded.value && pLoaded.value)
</script>

<template>
  <div>
    <PageBanner
      eyebrow="Grille tarifaire"
      title="Des tarifs clairs, sans surprise"
      intro="Les tarifs peuvent varier selon la complexité du projet, le délai et les révisions demandées. Tous les prix sont indiqués à partir de, en FCFA."
    />

    <section class="py-11 tab:py-16 pb-10 bg-nova-paper">
      <NContainer>
        <NSectionHeader eyebrow="Formules · Identité visuelle" title="Choisissez votre formule" align="center" />
        <div class="grid gap-[22px] mt-8 tab:mt-12 items-stretch grid-cols-1 tab:grid-cols-2 desk:grid-cols-3">
          <div
            v-for="(f, i) in FORMULES"
            :key="f.id ?? f.name"
            v-reveal="i * 80"
            class="relative flex flex-col rounded-xl p-[34px_30px] border shadow-nova-sm"
            :class="
              f.is_hot
                ? 'bg-gradient-to-br from-nova-navy to-nova-teal-deep border-transparent shadow-nova-lg scale-[1.04] max-tab:scale-100'
                : 'bg-nova-surface border-line'
            "
          >
            <span
              v-if="f.is_hot"
              class="absolute top-[18px] right-[18px] bg-nova-lime text-[#042b16] text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full"
            >Populaire</span>
            <NEyebrow :on-dark="!!f.is_hot">Formule</NEyebrow>
            <h3
              class="font-display text-[30px] font-semibold my-2 mb-3.5"
              :class="f.is_hot ? 'text-white' : 'text-fg-1'"
            >{{ f.name }}</h3>
            <div class="flex items-baseline gap-1.5 mb-[22px]">
              <span
                class="font-display text-[40px] font-bold"
                :class="f.is_hot ? 'text-white' : 'text-fg-1'"
              >{{ f.price }}</span>
              <span class="text-[13px]" :class="f.is_hot ? 'text-fg-on-dark-2' : 'text-fg-3'">FCFA</span>
            </div>
            <div class="flex flex-col gap-[11px] mb-[26px] flex-1">
              <div
                v-for="feat in (f.features || [])"
                :key="feat"
                class="flex items-center gap-2 text-[13.5px]"
                :class="f.is_hot ? 'text-fg-on-dark-2' : 'text-fg-2'"
              >
                <NIcon name="check" :size="15" color="#0cf25d" />{{ feat }}
              </div>
            </div>
            <NButton :variant="f.is_hot ? 'accent' : 'ghost'" to="/contact" block>Demander un devis</NButton>
          </div>
        </div>
      </NContainer>
    </section>

    <section class="pt-10 pb-16 tab:pb-24 bg-nova-paper">
      <NContainer>
        <div v-for="g in PRICE_GROUPS" :key="g.title" class="mb-10">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-[38px] h-[38px] rounded-md bg-nova-navy grid place-items-center">
              <NIcon :name="g.icon" :size="18" color="#fff" />
            </div>
            <h3 class="font-display text-2xl font-semibold m-0 text-fg-1">{{ g.title }}</h3>
          </div>
          <div class="bg-nova-surface border border-line rounded-lg overflow-hidden shadow-nova-xs">
            <div
              v-for="r in g.rows"
              :key="r.id ?? r.name"
              class="border-t border-line first:border-t-0"
              :class="
                isMobile
                  ? 'grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 px-4 py-3.5'
                  : 'grid grid-cols-[1.1fr_1.4fr_auto] gap-4 items-center px-[22px] py-4'
              "
            >
              <div class="font-semibold text-[14.5px] text-fg-1">{{ r.name }}</div>
              <div v-if="!isMobile" class="text-[13px] text-fg-3 leading-normal">{{ r.description }}</div>
              <div
                class="font-sans font-bold text-[15px] text-nova-teal whitespace-nowrap text-right"
                :class="isMobile && 'col-start-2 row-span-2 row-start-1'"
              >
                {{ r.price }}<span v-if="r.price !== 'Sur devis'" class="text-[11px] font-medium text-fg-3 ml-1">FCFA</span>
              </div>
              <div v-if="isMobile" class="text-xs text-fg-3 leading-snug col-start-1">{{ r.description }}</div>
            </div>
          </div>
        </div>
        <p v-if="!ready" class="text-fg-3 text-center text-[13px]">Chargement de la grille…</p>
      </NContainer>
    </section>

    <CtaBand />
  </div>
</template>
