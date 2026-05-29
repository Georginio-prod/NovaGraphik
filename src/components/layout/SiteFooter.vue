<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useViewport } from '@/composables/useViewport'
import { useSettings } from '@/composables/useSettings'
import NButton from '@/components/base/NButton.vue'
import NIcon from '@/components/base/NIcon.vue'

const { isMobile } = useViewport()
const { get, load } = useSettings()
onMounted(load)

const contacts = computed<[string, string][]>(() => [
  ['mail', get('contact_email', 'Novagraphiksat@gmail.com')],
  ['phone', get('contact_phone', '+228 97 99 63 46')],
  ['map-pin', get('contact_location', 'Lomé, Togo')],
])
const socials = computed<[string, string, string][]>(() =>
  (
    [
      ['instagram', 'Instagram', get('social_instagram')],
      ['facebook', 'Facebook', get('social_facebook')],
      ['youtube', 'YouTube', get('social_youtube')],
      ['tiktok', 'TikTok', get('social_tiktok')],
    ] as [string, string, string][]
  ).filter((s) => s[2]),
)
const tagline = computed(() => get('tagline', "L'essence du raffinement").toUpperCase())
const siteTitle = computed(() => get('site_title', 'Nova Graphik'))
</script>

<template>
  <footer class="bg-nova-navy-900 text-white relative overflow-hidden">
    <img
      src="/assets/compass-mark-white.png"
      alt=""
      class="absolute -right-20 -bottom-20 w-[360px] opacity-[0.06] pointer-events-none"
    />
    <div
      class="mx-auto max-w-[1200px] relative"
      :class="isMobile ? 'px-5 pt-12 pb-7' : 'px-8 pt-[72px] pb-8'"
    >
      <div
        class="grid gap-10"
        :class="isMobile ? 'grid-cols-2 gap-7' : 'grid-cols-[1.4fr_1fr_1fr_1.3fr] gap-10'"
      >
        <div :class="isMobile && 'col-span-2'">
          <img src="/assets/logo-nova-mark-white.png" alt="Nova Graphik" class="w-[130px] mb-[18px] block" />
          <p class="text-[13.5px] leading-relaxed text-fg-on-dark-2 max-w-[280px] m-0">
            Agence de communication visuelle — identité, print, digital & motion design.
          </p>
        </div>
        <div>
          <div class="font-glyphic text-[11px] font-semibold tracking-[0.18em] uppercase text-nova-lime mb-4">Contacts</div>
          <a
            v-for="[icon, label] in contacts"
            :key="label"
            class="flex items-center gap-2 text-[13.5px] mb-[11px] cursor-pointer text-fg-on-dark-2 transition-colors duration-nova hover:text-white"
          >
            <NIcon :name="icon" :size="15" color="#0cf25d" />{{ label }}
          </a>
        </div>
        <div>
          <div class="font-glyphic text-[11px] font-semibold tracking-[0.18em] uppercase text-nova-lime mb-4">Réseaux sociaux</div>
          <a
            v-for="[icon, label, href] in socials"
            :key="label"
            :href="href"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-2 text-[13.5px] mb-[11px] cursor-pointer text-fg-on-dark-2 transition-colors duration-nova hover:text-white no-underline"
          >
            <NIcon :name="icon" :size="15" color="#0cf25d" />{{ label }}
          </a>
        </div>
        <div>
          <div class="font-glyphic text-[11px] font-semibold tracking-[0.18em] uppercase text-nova-lime mb-4">S'abonner</div>
          <p class="text-[13px] text-fg-on-dark-2 m-0 mb-3">Recevez nos derniers projets.</p>
          <div class="flex gap-2">
            <input
              placeholder="E-mail"
              class="flex-1 bg-white/6 border border-white/20 rounded-sm py-2.5 px-3 text-white text-[13px] font-sans outline-none placeholder:text-fg-on-dark-3"
            />
            <NButton variant="accent" size="sm">OK</NButton>
          </div>
        </div>
      </div>
      <div
        class="pt-5 border-t border-white/12 flex justify-between items-center flex-wrap gap-3"
        :class="isMobile ? 'mt-9' : 'mt-14'"
      >
        <span class="font-glyphic text-[11px] tracking-[0.22em] text-fg-on-dark-3">{{ tagline }}</span>
        <span class="text-xs text-fg-on-dark-3">© 2026 {{ siteTitle }}. Tous droits réservés.</span>
      </div>
    </div>
  </footer>
</template>
