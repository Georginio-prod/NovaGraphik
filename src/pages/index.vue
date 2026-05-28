<script setup lang="ts">
const features = [
  {
    icon: 'i-lucide-palette',
    title: 'Nuxt UI',
    description: '125+ composants accessibles, prêts pour la production.'
  },
  {
    icon: 'i-lucide-wind',
    title: 'Tailwind CSS v4',
    description: 'Utilitaires modernes et configuration CSS-first.'
  },
  {
    icon: 'i-lucide-code-2',
    title: 'Vue 3 + TypeScript',
    description: 'Composition API, typage strict et excellent DX.'
  }
]
</script>

<template>
  <div class="min-h-screen bg-default">
    <header class="border-b border-default">
      <UContainer class="flex items-center justify-between py-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-layout-template" class="size-6 text-primary" />
          <span class="font-semibold text-highlighted">Mon site web</span>
        </div>
        <div class="flex items-center gap-2">
          <UColorModeButton />
          <UButton to="https://ui.nuxt.com" target="_blank" variant="soft">
            Documentation
          </UButton>
        </div>
      </UContainer>
    </header>

    <main>
      <UContainer class="py-16 md:py-24">
        <div class="mx-auto max-w-3xl text-center">
          <UBadge color="primary" variant="subtle" class="mb-4">
            Stack prête
          </UBadge>
          <h1 class="text-4xl font-bold tracking-tight text-highlighted md:text-5xl">
            Bienvenue sur votre nouveau site
          </h1>
          <p class="mt-4 text-lg text-muted">
            Vue 3, TypeScript, Tailwind CSS et Nuxt UI sont configurés. Vous pouvez
            commencer à construire vos pages.
          </p>
          <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
            <UButton size="lg" icon="i-lucide-rocket">
              Commencer
            </UButton>
            <UButton
              size="lg"
              color="neutral"
              variant="outline"
              icon="i-lucide-github"
              to="https://github.com/nuxt/ui"
              target="_blank"
            >
              Nuxt UI sur GitHub
            </UButton>
          </div>
        </div>

        <div class="mt-16 grid gap-6 md:grid-cols-3">
          <UCard v-for="feature in features" :key="feature.title">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon :name="feature.icon" class="size-5 text-primary" />
                <h2 class="font-semibold text-highlighted">
                  {{ feature.title }}
                </h2>
              </div>
            </template>
            <p class="text-muted">
              {{ feature.description }}
            </p>
          </UCard>
        </div>
      </UContainer>
    </main>

    <footer class="border-t border-default py-8">
      <UContainer class="text-center text-sm text-muted">
        Projet initialisé avec
        <ULink to="https://ui.nuxt.com" target="_blank" class="text-primary">
          Nuxt UI
        </ULink>
        ·
        <ULink to="https://vuejs.org" target="_blank" class="text-primary">
          Vue.js
        </ULink>
        ·
        <ULink to="https://tailwindcss.com" target="_blank" class="text-primary">
          Tailwind CSS
        </ULink>
      </UContainer>
    </footer>
  </div>
</template>
