<script setup lang="ts">
import { useRoute, useRouter, RouterLink, RouterView } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import NIcon from '@/components/base/NIcon.vue'

const route = useRoute()
const router = useRouter()
const { logout } = useAuth()

const NAV: [string, string, string][] = [
  ['layout-dashboard', "Vue d'ensemble", '/admin'],
  ['file-text', 'Pages', '/admin/pages'],
  ['sparkles', 'Services', '/admin/services'],
  ['image', 'Portfolios', '/admin/portfolio'],
  ['users', 'Équipe', '/admin/team'],
  ['pen-line', 'Blogs', '/admin/blogs'],
  ['award', 'Partenaires', '/admin/partenaires'],
  ['tag', 'Tarifs', '/admin/tarifs'],
  ['menu', 'Navigation', '/admin/navigation'],
  ['settings', 'Réglages', '/admin/settings'],
]

function isActive(path: string) {
  return path === '/admin' ? route.path === '/admin' : route.path.startsWith(path)
}
async function signOut() {
  await logout()
  router.push('/admin/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-nova-fog font-sans">
    <!-- Sidebar (desktop) -->
    <aside
      class="hidden min-[901px]:flex w-[248px] shrink-0 sticky top-0 h-screen box-border flex-col bg-nova-navy-900 text-white py-6 px-4"
    >
      <RouterLink to="/admin">
        <img src="/assets/logo-nova-mark-white.png" alt="Nova" class="w-[110px] mx-2 mb-7 mt-1.5" />
      </RouterLink>
      <nav class="flex flex-col gap-1">
        <RouterLink
          v-for="[ic, label, path] in NAV"
          :key="path"
          :to="path"
          class="flex items-center gap-[11px] px-3.5 py-[11px] rounded-sm cursor-pointer text-[13.5px] no-underline transition-[background,color] duration-nova"
          :class="isActive(path) ? 'bg-nova-lime/15 text-nova-lime font-semibold' : 'text-fg-on-dark-2 hover:bg-white/5'"
        >
          <NIcon :name="ic" :size="17" />{{ label }}
        </RouterLink>
      </nav>
      <div class="mt-auto flex flex-col gap-2">
        <RouterLink
          to="/"
          class="flex items-center gap-2.5 px-3.5 py-[11px] rounded-sm text-[13px] text-fg-on-dark-2 border border-white/15 no-underline hover:text-white hover:border-white/30"
        >
          <NIcon name="arrow-left" :size="16" /> Retour au site
        </RouterLink>
        <button
          class="flex items-center gap-2.5 px-3.5 py-[11px] rounded-sm cursor-pointer text-[13px] text-fg-on-dark-2 border border-white/15 bg-transparent font-sans w-full text-left hover:text-white hover:border-white/30"
          @click="signOut"
        >
          <NIcon name="log-out" :size="16" /> Déconnexion
        </button>
      </div>
    </aside>

    <!-- Mobile top nav -->
    <div class="min-[901px]:hidden fixed top-0 inset-x-0 z-40 bg-nova-navy-900 text-white">
      <div class="flex items-center justify-between px-4 h-14">
        <img src="/assets/logo-nova-mark-white.png" alt="Nova" class="h-6" />
        <button class="flex items-center gap-1.5 text-[12px] text-fg-on-dark-2" @click="signOut">
          <NIcon name="log-out" :size="15" /> Quitter
        </button>
      </div>
      <nav class="flex gap-1 overflow-x-auto px-3 pb-2">
        <RouterLink
          v-for="[ic, label, path] in NAV"
          :key="path"
          :to="path"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] whitespace-nowrap no-underline"
          :class="isActive(path) ? 'bg-nova-lime/15 text-nova-lime font-semibold' : 'text-fg-on-dark-2'"
        >
          <NIcon :name="ic" :size="14" />{{ label }}
        </RouterLink>
      </nav>
    </div>

    <!-- Main -->
    <main class="flex-1 p-7 px-9 overflow-auto pt-[112px] min-[901px]:pt-7">
      <RouterView />
    </main>
  </div>
</template>
