<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import NIcon from '@/components/base/NIcon.vue'
import NButton from '@/components/base/NButton.vue'

const router = useRouter()
const { user, logout } = useAuth()

function signOut() {
  logout()
  router.push('/login')
}
</script>

<template>
  <div class="dash-stub">
    <img src="/assets/logo-nova-mark-white.png" alt="Nova Graphik" class="logo" />
    <p class="eyebrow">Tableau de bord</p>
    <h1>Espace d'administration</h1>
    <p class="lead">
      Connecté en tant que <strong>{{ user?.email }}</strong>.
      L'éditeur de contenu (sections, titres, visibilité) arrive sur la prochaine étape.
    </p>
    <div class="actions">
      <RouterLink to="/" class="ghost"><NIcon name="arrow-left" :size="16" /> Voir le site</RouterLink>
      <NButton variant="accent" icon="log-out" @click="signOut">Se déconnecter</NButton>
    </div>
  </div>
</template>

<style scoped>
.dash-stub {
  min-height: 100vh;
  background: var(--nova-navy-900);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}
.logo { width: 150px; margin-bottom: 32px; }
.eyebrow {
  font-family: var(--font-glyphic);
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--nova-lime);
  margin: 0 0 10px;
}
h1 {
  font-family: var(--font-display);
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 600;
  margin: 0 0 16px;
  color: #fff;
}
.lead { color: var(--fg-on-dark-2); max-width: 460px; margin: 0 0 32px; }
.lead strong { color: #fff; }
.actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; justify-content: center; }
.ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--fg-on-dark-2);
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--r-sm);
  padding: 11px 18px;
  font-size: 13px;
}
.ghost:hover { color: #fff; border-color: rgba(255, 255, 255, 0.4); }
</style>
