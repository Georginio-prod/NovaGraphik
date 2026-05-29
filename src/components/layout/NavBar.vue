<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useWindowScroll } from '@vueuse/core'
import { useViewport } from '@/composables/useViewport'
import NIcon from '@/components/base/NIcon.vue'
import NButton from '@/components/base/NButton.vue'
import ThemeToggle from '@/components/base/ThemeToggle.vue'

const NAV_ITEMS: [string, string][] = [
  ['/', 'Accueil'],
  ['/portfolios', 'Portfolios'],
  ['/blogs', 'Blogs'],
  ['/contact', 'Contact'],
  ['/partenaires', 'Partenaires'],
  ['/grille-tarifaire', 'Grille tarifaire'],
]

const route = useRoute()
const router = useRouter()
const { isMobile } = useViewport()
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
        <img
          src="/assets/logo-nova-graphik.png"
          alt="Nova Graphik"
          class="block cursor-pointer"
          :class="isMobile ? 'h-7' : 'h-[34px]'"
        />
      </RouterLink>

      <nav v-if="!isMobile" class="flex gap-[26px]">
        <RouterLink
          v-for="[path, label] in NAV_ITEMS"
          :key="path"
          :to="path"
          class="font-sans text-[11.5px] font-medium tracking-[0.12em] uppercase cursor-pointer text-fg-2 no-underline pb-1 border-b-2 border-transparent transition-[color,border-color] duration-nova hover:text-nova-navy"
          :class="isActive(path) && '!text-nova-navy !border-nova-lime'"
        >{{ label }}</RouterLink>
      </nav>

      <div v-if="!isMobile" class="flex gap-3 items-center">
        <ThemeToggle />
        <RouterLink
          to="/dashboard"
          class="w-[38px] h-[38px] rounded-sm border border-line-strong bg-nova-surface cursor-pointer grid place-items-center text-nova-navy transition-[border-color] duration-nova hover:border-nova-navy dark:text-nova-lime dark:hover:border-nova-lime"
          title="Tableau de bord"
        >
          <NIcon name="layout-dashboard" :size="17" />
        </RouterLink>
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

    <div v-if="isMobile && open" class="border-t border-line px-5 pt-3 pb-5 flex flex-col gap-0.5">
      <RouterLink
        v-for="[path, label] in NAV_ITEMS"
        :key="path"
        :to="path"
        class="font-sans text-[13px] font-semibold tracking-widest uppercase cursor-pointer py-3 px-1 text-fg-2 no-underline border-b border-line"
        :class="isActive(path) && '!text-nova-navy'"
        @click="goM(path)"
      >{{ label }}</RouterLink>
      <div class="flex gap-2.5 mt-3.5 items-center">
        <ThemeToggle class="!w-11 !h-11 shrink-0" />
        <NButton variant="accent" block to="/contact" @click="open = false">Demander un devis</NButton>
        <RouterLink
          to="/dashboard"
          class="w-11 shrink-0 rounded-sm border border-line-strong bg-nova-surface cursor-pointer grid place-items-center text-nova-navy dark:text-nova-lime"
          title="Tableau de bord"
          @click="open = false"
        >
          <NIcon name="layout-dashboard" :size="18" />
        </RouterLink>
      </div>
    </div>
  </header>
</template>
