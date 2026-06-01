<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { api, type TeamMember } from '@/lib/api'
import { novaGrad } from '@/lib/gradients'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NIcon from '@/components/base/NIcon.vue'

const route = useRoute()
const member = ref<TeamMember | null>(null)
const loading = ref(true)
const notFound = ref(false)

async function load(slug: string) {
  loading.value = true
  notFound.value = false
  member.value = null
  try {
    const d = await api.get<{ member: TeamMember }>(`/team/${slug}`)
    member.value = d.member
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}
onMounted(() => load(String(route.params.slug)))
watch(() => route.params.slug, (s) => s && load(String(s)))
</script>

<template>
  <div>
    <section class="bg-nova-navy-900 relative overflow-hidden">
      <img src="/assets/compass-mark-white.png" alt="" class="absolute -right-[60px] -top-[60px] w-[320px] opacity-[0.08] pointer-events-none" />
      <NContainer>
        <div class="py-12 tab:py-16 relative">
          <RouterLink to="/#equipe" class="inline-flex items-center gap-2 text-fg-on-dark-2 hover:text-white text-[13px] no-underline mb-6">
            <NIcon name="arrow-left" :size="15" /> Retour à l'équipe
          </RouterLink>
          <template v-if="member">
            <NEyebrow on-dark class="mb-3">Équipe Nova</NEyebrow>
            <h1 class="font-display font-semibold text-white text-[clamp(36px,5vw,60px)] leading-[1.05] m-0">{{ member.name }}</h1>
            <div class="font-glyphic text-[12px] tracking-[0.22em] uppercase text-nova-lime mt-3">{{ member.role }}</div>
          </template>
          <h1 v-else-if="!loading" class="font-display text-white text-4xl m-0">Membre introuvable</h1>
        </div>
      </NContainer>
    </section>

    <section v-if="member" class="py-12 tab:py-20 bg-nova-paper">
      <NContainer>
        <div class="grid grid-cols-1 tab:grid-cols-[320px_1fr] gap-10 items-start">
          <div class="rounded-lg overflow-hidden aspect-square" :style="!member.photo ? { background: novaGrad(member.id) } : {}">
            <img v-if="member.photo" :src="member.photo" :alt="member.name" class="w-full h-full object-cover" />
          </div>
          <div>
            <NEyebrow class="mb-3">À propos</NEyebrow>
            <p class="text-[17px] leading-relaxed text-fg-2 whitespace-pre-line m-0">
              {{ member.bio || 'Présentation à venir.' }}
            </p>
            <NButton variant="accent" icon="arrow-right" to="/contact" class="mt-8">Travailler avec nous</NButton>
          </div>
        </div>
      </NContainer>
    </section>
  </div>
</template>
