<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import NButton from '@/components/base/NButton.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NIcon from '@/components/base/NIcon.vue'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  if (loading.value) return
  error.value = ''
  loading.value = true
  try {
    await login(email.value.trim(), password.value)
    const redirect = route.query.redirect
    router.push(typeof redirect === 'string' ? redirect : '/admin')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Connexion impossible. Réessayez.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-nova-navy-900 from-0% via-nova-navy via-[55%] to-nova-teal-deep grid place-items-center p-6 relative overflow-hidden">
    <img
      src="/assets/compass-mark-white.png"
      alt=""
      class="absolute -right-[120px] -bottom-[120px] w-[520px] opacity-[0.07] pointer-events-none"
    />
    <div class="relative w-full max-w-[420px] bg-nova-surface rounded-xl p-10 shadow-nova-lg nova-enter nova-enter-1">
      <img src="/assets/logo-nova-graphik.png" alt="Nova Graphik" class="w-[130px] mb-6" />
      <NEyebrow on-dark class="mb-2.5">Espace administrateur</NEyebrow>
      <h1 class="font-display text-[34px] font-semibold my-1.5 text-fg-1 tracking-tight">Connexion</h1>
      <p class="text-sm text-fg-3 m-0 mb-[26px]">Accédez au tableau de bord pour gérer le contenu du site.</p>

      <form @submit.prevent="submit">
        <label class="block text-[11px] font-semibold tracking-wider uppercase text-fg-2 mt-3.5">E-mail</label>
        <input
          v-model="email"
          type="email"
          autocomplete="username"
          placeholder="vous@novagraphik.fr"
          class="w-full box-border font-sans text-sm text-fg-1 bg-nova-paper border border-line-strong rounded-sm px-3.5 py-3 outline-none mt-2 transition-[border-color,box-shadow,background] duration-nova focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)] focus:bg-nova-surface"
        />

        <label class="block text-[11px] font-semibold tracking-wider uppercase text-fg-2 mt-3.5">Mot de passe</label>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="••••••••"
          class="w-full box-border font-sans text-sm text-fg-1 bg-nova-paper border border-line-strong rounded-sm px-3.5 py-3 outline-none mt-2 transition-[border-color,box-shadow,background] duration-nova focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)] focus:bg-nova-surface"
        />

        <p v-if="error" class="flex items-center gap-1.5 text-err text-[13px] mt-4 mb-0">
          <NIcon name="lock" :size="14" /> {{ error }}
        </p>

        <NButton variant="accent" size="lg" icon="arrow-right" block class="mt-2">
          {{ loading ? 'Connexion…' : 'Se connecter' }}
        </NButton>
      </form>

      <RouterLink
        to="/"
        class="inline-flex items-center gap-1.5 mt-[22px] text-[13px] text-fg-3 no-underline hover:text-nova-teal"
      >
        <NIcon name="arrow-left" :size="15" /> Retour au site
      </RouterLink>
    </div>
  </div>
</template>
