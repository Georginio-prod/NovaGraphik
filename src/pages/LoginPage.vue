<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { ApiError } from '@/lib/api'
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
    router.push(typeof redirect === 'string' ? redirect : '/dashboard')
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Connexion impossible. Réessayez.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login">
    <img src="/assets/compass-mark-white.png" alt="" class="bg-mark" />
    <div class="card nova-enter nova-enter-1">
      <img src="/assets/logo-nova-graphik.png" alt="Nova Graphik" class="logo" />
      <NEyebrow on-dark style="margin-bottom: 10px;">Espace administrateur</NEyebrow>
      <h1>Connexion</h1>
      <p class="sub">Accédez au tableau de bord pour gérer le contenu du site.</p>

      <form @submit.prevent="submit">
        <label class="lbl">E-mail</label>
        <input v-model="email" type="email" autocomplete="username" placeholder="vous@novagraphik.fr" class="inp" />

        <label class="lbl">Mot de passe</label>
        <input v-model="password" type="password" autocomplete="current-password" placeholder="••••••••" class="inp" />

        <p v-if="error" class="err"><NIcon name="lock" :size="14" /> {{ error }}</p>

        <NButton variant="accent" size="lg" icon="arrow-right" block style="margin-top: 8px;">
          {{ loading ? 'Connexion…' : 'Se connecter' }}
        </NButton>
      </form>

      <RouterLink to="/" class="back"><NIcon name="arrow-left" :size="15" /> Retour au site</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  background: linear-gradient(150deg, #022c3d 0%, #034159 55%, #025951 100%);
  display: grid;
  place-items: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}
.bg-mark {
  position: absolute;
  right: -120px;
  bottom: -120px;
  width: 520px;
  opacity: 0.07;
  pointer-events: none;
}
.card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: var(--r-xl);
  padding: 40px 38px;
  box-shadow: var(--shadow-lg);
}
.logo { width: 130px; margin-bottom: 24px; }
h1 {
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 600;
  margin: 6px 0 6px;
  color: var(--fg-1);
  letter-spacing: -0.02em;
}
.sub { font-size: 14px; color: var(--fg-3); margin: 0 0 26px; }
.lbl {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fg-2);
  margin-top: 14px;
}
.inp {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--fg-1);
  background: var(--nova-paper);
  border: 1px solid var(--border-2);
  border-radius: var(--r-sm);
  padding: 12px 14px;
  outline: none;
  margin-top: 8px;
  transition: border-color var(--dur), box-shadow var(--dur), background var(--dur);
}
.inp:focus {
  border-color: var(--nova-lime);
  box-shadow: 0 0 0 3px rgba(12, 242, 93, 0.18);
  background: #fff;
}
.err {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--err);
  font-size: 13px;
  margin: 16px 0 0;
}
.back {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 22px;
  font-size: 13px;
  color: var(--fg-3);
  text-decoration: none;
}
.back:hover { color: var(--nova-teal); }
</style>
