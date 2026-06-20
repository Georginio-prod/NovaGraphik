<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { useHead } from '@unhead/vue'
import NavBar from '@/components/layout/NavBar.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import ThemeToggle from '@/components/base/ThemeToggle.vue'
import CursorGlow from '@/components/base/CursorGlow.vue'
import RouteProgress from '@/components/base/RouteProgress.vue'
import { useTheme } from '@/composables/useTheme'
import { useSeo } from '@/composables/useSeo'
import { useSettings } from '@/composables/useSettings'
import { organizationJsonLd } from '@/lib/seo'

const route = useRoute()
const bare = computed(() => route.meta.bare === true)

// Keep document class in sync when theme changes (also used by NavBar toggle).
useTheme()

// Default per-route SEO, driven by each route's `meta.seo`. Dynamic pages
// (:slug) call useSeo() themselves to override this once their data loads.
type RouteSeo = { title?: string; description?: string; noindex?: boolean }
const seo = computed<RouteSeo>(() => (route.meta.seo as RouteSeo) ?? {})
useSeo({
  title: () => seo.value.title,
  description: () => seo.value.description,
  noindex: () => seo.value.noindex,
})

// Organization structured data (JSON-LD) — helps Google build a knowledge panel.
const { settings, load: loadSettings } = useSettings()
onMounted(() => void loadSettings())
const orgJsonLd = computed(() =>
  organizationJsonLd({
    email: settings.value.contact_email,
    phone: settings.value.contact_phone,
    location: settings.value.contact_location,
    sameAs: [
      settings.value.social_facebook,
      settings.value.social_instagram,
      settings.value.social_tiktok,
      settings.value.social_youtube,
    ],
  }),
)
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify(orgJsonLd.value)),
    },
  ],
})
</script>

<template>
  <UApp>
    <RouteProgress />
    <NavBar v-if="!bare" />
    <div v-if="bare" class="fixed top-5 right-5 z-[60]">
      <ThemeToggle />
    </div>
    <RouterView />
    <SiteFooter v-if="!bare" />
    <CursorGlow />
  </UApp>
</template>
