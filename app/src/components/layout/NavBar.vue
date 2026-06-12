<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useWindowScroll } from '@vueuse/core'
import { useViewport } from '@/composables/useViewport'
import { useNav } from '@/composables/useEditable'
import NIcon from '@/components/base/NIcon.vue'
import NButton from '@/components/base/NButton.vue'
import ThemeToggle from '@/components/base/ThemeToggle.vue'
import LogoNova from '@/components/base/LogoNova.vue'

// Static fallback used while the live nav loads (and if the API is down).
const FALLBACK_NAV: { label: string; path: string }[] = [
  { label: 'Accueil', path: '/' },
  { label: 'Portfolios', path: '/portfolios' },
  { label: 'Blogs', path: '/blogs' },
  { label: 'Promotions', path: '/promotions' },
  { label: 'Contact', path: '/contact' },
  { label: 'Partenaires', path: '/partenaires' },
  { label: 'Grille tarifaire', path: '/grille-tarifaire' },
]

const { items: navItems, loaded: navLoaded, load: loadNav } = useNav()
onMounted(loadNav)
const NAV_ITEMS = computed<{ label: string; path: string }[]>(() =>
  navLoaded.value && navItems.value.length ? navItems.value : FALLBACK_NAV,
)

const route = useRoute()
const router = useRouter()
const { isMobile, isTablet } = useViewport()
// The full horizontal nav (6 links + CTA + toggle) only fits on real desktops.
// Below the `desk` breakpoint (incl. the 760–1040 tablet range) we collapse to
// the hamburger menu so it never overflows horizontally.
const compact = computed(() => isMobile.value || isTablet.value)
const { y } = useWindowScroll()
const open = ref(false)

const scrolled = computed(() => y.value > 12)
const frosted = computed(() => scrolled.value || open.value)

function isActive(path: string) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
function goM(path: string) {
  router.push(path)
  open.value = false
}
</script>

<template>
  <header
    class="sticky top-0 z-50 backdrop-blur-xl transition-all duration-nova ease-nova border-b"
    :class="
      frosted
        ? 'bg-nova-paper/92 border-line'
        : 'bg-nova-paper/60 border-transparent'
    "
  >
    <div
      class="mx-auto max-w-[1200px] flex items-center justify-between"
      :class="isMobile ? 'px-5 h-[62px]' : 'px-8 h-[74px]'"
    >
      <RouterLink to="/" class="inline-flex">
        <LogoNova
          variant="auto"
          entrance
          interactive
          class="block text-fg-1"
          :class="isMobile ? 'w-[76px]' : 'w-[94px]'"
        />
      </RouterLink>

      <nav v-if="!compact" class="flex gap-[26px]">
        <RouterLink
          v-for="item in NAV_ITEMS"
          :key="item.path"
          :to="item.path"
          class="font-sans text-[11.5px] font-medium tracking-[0.12em] uppercase cursor-pointer text-fg-2 no-underline pb-1 border-b-2 border-transparent transition-[color,border-color] duration-nova hover:text-nova-navy"
          :class="isActive(item.path) && '!text-nova-navy !border-nova-lime'"
        >{{ item.label }}</RouterLink>
      </nav>

      <div v-if="!compact" class="flex gap-3 items-center">
        <ThemeToggle />
        <NButton variant="accent" size="sm" to="/contact">Demander un devis</NButton>
      </div>

      <button
        v-else
        class="w-10 h-10 rounded-sm border border-line-strong bg-nova-surface cursor-pointer grid place-items-center text-nova-navy dark:text-nova-lime"
        aria-label="Menu"
        @click="open = !open"
      >
        <NIcon :name="open ? 'x' : 'menu'" :size="20" />
      </button>
    </div>

    <div v-if="compact && open" class="border-t border-line px-5 pt-3 pb-5 flex flex-col gap-0.5">
      <RouterLink
        v-for="item in NAV_ITEMS"
        :key="item.path"
        :to="item.path"
        class="font-sans text-[13px] font-semibold tracking-widest uppercase cursor-pointer py-3 px-1 text-fg-2 no-underline border-b border-line"
        :class="isActive(item.path) && '!text-nova-navy'"
        @click="goM(item.path)"
      >{{ item.label }}</RouterLink>
      <div class="flex gap-2.5 mt-3.5 items-center">
        <ThemeToggle class="!w-11 !h-11 shrink-0" />
        <NButton variant="accent" block to="/contact" @click="open = false">Demander un devis</NButton>
      </div>
    </div>
  </header>
</template>
