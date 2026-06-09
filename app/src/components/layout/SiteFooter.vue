<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useViewport } from '@/composables/useViewport'
import { useSettings } from '@/composables/useSettings'
import { supabase } from '@/lib/supabase'
import NButton from '@/components/base/NButton.vue'
import NIcon from '@/components/base/NIcon.vue'
import LogoNova from '@/components/base/LogoNova.vue'

const { isMobile } = useViewport()
const { get, load } = useSettings()
onMounted(load)

// Newsletter signup — stores the email in Supabase (`subscribers`); the agency
// exports the list to send their latest projects. Anonymous insert is allowed
// by RLS; reading the list requires the admin login.
const subEmail = ref('')
const subState = ref<'idle' | 'sending' | 'done' | 'error'>('idle')
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
async function subscribe() {
  const email = subEmail.value.trim()
  if (!EMAIL_RE.test(email)) {
    subState.value = 'error'
    return
  }
  subState.value = 'sending'
  const { error } = await supabase.from('subscribers').insert({ email })
  // A duplicate email (unique index) still means "you're subscribed".
  if (error && !/duplicate|unique/i.test(error.message)) {
    subState.value = 'error'
    return
  }
  subState.value = 'done'
  subEmail.value = ''
}

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
// Footer texts — editable from the dashboard "Pied de page" section.
const description = computed(() =>
  get('footer_description', 'Agence de communication visuelle — identité, print, digital & motion design.'),
)
const newsletterTitle = computed(() => get('footer_newsletter_title', "S'abonner"))
const newsletterText = computed(() => get('footer_newsletter_text', 'Recevez nos derniers projets.'))
const copyright = computed(
  () => get('footer_copyright') || `© 2026 ${siteTitle.value}. Tous droits réservés.`,
)
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
      <div class="grid grid-cols-1 gap-8 min-[560px]:grid-cols-2 min-[560px]:gap-7 desk:grid-cols-[1.4fr_1fr_1fr_1.3fr] desk:gap-10">
        <div class="min-[560px]:col-span-2 desk:col-span-1">
          <LogoNova variant="white" interactive class="w-[150px] mb-[18px] block" />
          <p class="text-[13.5px] leading-relaxed text-fg-on-dark-2 max-w-[280px] m-0">
            {{ description }}
          </p>
        </div>
        <div>
          <div class="font-glyphic text-[11px] font-semibold tracking-[0.18em] uppercase text-nova-lime mb-4">Contacts</div>
          <a
            v-for="[icon, label] in contacts"
            :key="label"
            class="flex items-start gap-2 text-[13.5px] mb-[11px] cursor-pointer text-fg-on-dark-2 transition-colors duration-nova hover:text-white"
          >
            <NIcon :name="icon" :size="15" color="#0cf25d" class="shrink-0 mt-0.5" />
            <span class="min-w-0 break-words">{{ label }}</span>
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
            <NIcon :name="icon" :size="15" color="#0cf25d" class="shrink-0" /><span class="min-w-0 break-words">{{ label }}</span>
          </a>
        </div>
        <div>
          <div class="font-glyphic text-[11px] font-semibold tracking-[0.18em] uppercase text-nova-lime mb-4">{{ newsletterTitle }}</div>
          <p class="text-[13px] text-fg-on-dark-2 m-0 mb-3">{{ newsletterText }}</p>
          <template v-if="subState === 'done'">
            <p class="text-[13px] text-nova-lime-soft m-0 flex items-center gap-2">
              <NIcon name="check" :size="15" color="#0cf25d" /> Merci, vous êtes inscrit !
            </p>
          </template>
          <template v-else>
            <form class="flex gap-2" @submit.prevent="subscribe">
              <input
                v-model="subEmail"
                type="email"
                placeholder="E-mail"
                aria-label="Votre e-mail"
                class="flex-1 min-w-0 bg-white/6 border rounded-sm py-2.5 px-3 text-white text-[13px] font-sans outline-none placeholder:text-fg-on-dark-3 focus:border-nova-lime"
                :class="subState === 'error' ? 'border-err' : 'border-white/20'"
                @input="subState = 'idle'"
              />
              <NButton variant="accent" size="sm" :disabled="subState === 'sending'">
                {{ subState === 'sending' ? '…' : 'OK' }}
              </NButton>
            </form>
            <p v-if="subState === 'error'" class="text-[12px] text-err mt-2 mb-0">Adresse e-mail invalide.</p>
          </template>
        </div>
      </div>
      <div
        class="pt-5 border-t border-white/12 flex justify-between items-center flex-wrap gap-3"
        :class="isMobile ? 'mt-9' : 'mt-14'"
      >
        <span class="font-glyphic text-[11px] tracking-[0.22em] text-fg-on-dark-3">{{ tagline }}</span>
        <span class="text-xs text-fg-on-dark-3">{{ copyright }}</span>
      </div>
    </div>
  </footer>
</template>
