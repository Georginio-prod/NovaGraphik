<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import ThemeToggle from '@/components/base/ThemeToggle.vue'
import CursorGlow from '@/components/base/CursorGlow.vue'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const bare = computed(() => route.meta.bare === true)

// Keep document class in sync when theme changes (also used by NavBar toggle).
useTheme()
</script>

<template>
  <UApp>
    <NavBar v-if="!bare" />
    <div v-if="bare" class="fixed top-5 right-5 z-[60]">
      <ThemeToggle />
    </div>
    <RouterView />
    <SiteFooter v-if="!bare" />
    <CursorGlow />
  </UApp>
</template>
