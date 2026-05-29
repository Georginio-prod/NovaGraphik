<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useWindowScroll } from '@vueuse/core'
import { useViewport } from '@/composables/useViewport'
import NIcon from '@/components/base/NIcon.vue'
import NButton from '@/components/base/NButton.vue'

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
  <header class="nav" :class="{ frosted }">
    <div class="nav-inner" :class="{ 'is-mobile': isMobile }">
      <RouterLink to="/" class="logo-link">
        <img src="/assets/logo-nova-graphik.png" alt="Nova Graphik" class="logo" :class="{ 'is-mobile': isMobile }" />
      </RouterLink>

      <nav v-if="!isMobile" class="links">
        <RouterLink
          v-for="[path, label] in NAV_ITEMS"
          :key="path"
          :to="path"
          class="link"
          :class="{ active: isActive(path) }"
        >{{ label }}</RouterLink>
      </nav>

      <div v-if="!isMobile" class="actions">
        <RouterLink to="/dashboard" class="dash-btn" title="Tableau de bord">
          <NIcon name="layout-dashboard" :size="17" />
        </RouterLink>
        <NButton variant="accent" size="sm" to="/contact">Demander un devis</NButton>
      </div>

      <button v-else class="burger" aria-label="Menu" @click="open = !open">
        <NIcon :name="open ? 'x' : 'menu'" :size="20" />
      </button>
    </div>

    <div v-if="isMobile && open" class="mobile-menu">
      <RouterLink
        v-for="[path, label] in NAV_ITEMS"
        :key="path"
        :to="path"
        class="m-link"
        :class="{ active: isActive(path) }"
        @click="goM(path)"
      >{{ label }}</RouterLink>
      <div class="m-actions">
        <NButton variant="accent" block to="/contact" @click="open = false">Demander un devis</NButton>
        <RouterLink to="/dashboard" class="dash-btn m" title="Tableau de bord" @click="open = false">
          <NIcon name="layout-dashboard" :size="18" />
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(248, 250, 249, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: all var(--dur) var(--ease-out);
}
.nav.frosted {
  background: rgba(248, 250, 249, 0.92);
  border-bottom-color: var(--border-1);
}
.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 74px;
}
.nav-inner.is-mobile {
  padding: 0 20px;
  height: 62px;
}
.logo-link { display: inline-flex; }
.logo { height: 34px; cursor: pointer; display: block; }
.logo.is-mobile { height: 28px; }

.links { display: flex; gap: 26px; }
.link {
  font-family: var(--font-sans);
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  color: var(--fg-2);
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: color var(--dur), border-color var(--dur);
}
.link:hover { color: var(--nova-navy); }
.link.active { color: var(--nova-navy); border-bottom-color: var(--nova-lime); }

.actions { display: flex; gap: 12px; align-items: center; }
.dash-btn {
  width: 38px;
  height: 38px;
  border-radius: var(--r-sm);
  border: 1px solid var(--border-2);
  background: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  color: var(--nova-navy);
  transition: border-color var(--dur);
}
.dash-btn:hover { border-color: var(--nova-navy); }

.burger {
  width: 40px;
  height: 40px;
  border-radius: var(--r-sm);
  border: 1px solid var(--border-2);
  background: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  color: var(--nova-navy);
}

.mobile-menu {
  border-top: 1px solid var(--border-1);
  padding: 12px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.m-link {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 12px 4px;
  color: var(--fg-2);
  text-decoration: none;
  border-bottom: 1px solid var(--border-1);
}
.m-link.active { color: var(--nova-navy); }
.m-actions { display: flex; gap: 10px; margin-top: 14px; }
.dash-btn.m { width: 44px; height: auto; flex: none; }
</style>
