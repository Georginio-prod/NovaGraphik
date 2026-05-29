<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'

const route = useRoute()
const bare = computed(() => route.meta.bare === true)
</script>

<template>
  <UApp>
    <NavBar v-if="!bare" />
    <RouterView />
    <SiteFooter v-if="!bare" />
  </UApp>
</template>
