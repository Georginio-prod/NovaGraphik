<script setup lang="ts">
import type { Section } from '@/lib/api'
import NContainer from '@/components/base/NContainer.vue'
import NSectionHeader from '@/components/base/NSectionHeader.vue'

defineProps<{
  section: Section
  alt?: boolean
}>()
</script>

<template>
  <section class="py-16 tab:py-24" :class="alt ? 'bg-nova-fog' : 'bg-nova-paper'">
    <NContainer>
      <NSectionHeader
        :eyebrow="section.type"
        :title="section.title"
        :intro="section.body"
      />
    </NContainer>
  </section>
</template>
