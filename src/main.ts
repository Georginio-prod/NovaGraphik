import './assets/css/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import { vReveal } from './directives/reveal'
import { useAuth } from './composables/useAuth'
import { initTheme } from './composables/useTheme'

initTheme()

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('./pages/HomePage.vue') },
    { path: '/portfolios', name: 'portfolios', component: () => import('./pages/PortfolioPage.vue') },
    { path: '/blogs', name: 'blogs', component: () => import('./pages/BlogPage.vue') },
    { path: '/contact', name: 'contact', component: () => import('./pages/ContactPage.vue') },
    { path: '/partenaires', name: 'partenaires', component: () => import('./pages/PartnersPage.vue') },
    { path: '/grille-tarifaire', name: 'tarifs', component: () => import('./pages/PricingPage.vue') },
    { path: '/equipe/:slug', name: 'member', component: () => import('./pages/MemberPage.vue') },
    { path: '/login', name: 'login', component: () => import('./pages/LoginPage.vue'), meta: { bare: true } },
    {
      path: '/dashboard',
      component: () => import('./pages/dashboard/DashboardLayout.vue'),
      meta: { bare: true, requiresAdmin: true },
      children: [
        { path: '', name: 'dashboard', component: () => import('./pages/dashboard/DashboardOverview.vue') },
        { path: 'pages', name: 'dash-pages', component: () => import('./pages/dashboard/DashboardPages.vue') },
        { path: 'portfolio', name: 'dash-portfolio', component: () => import('./pages/dashboard/DashboardComingSoon.vue'), meta: { title: 'Portfolios' } },
        { path: 'team', name: 'dash-team', component: () => import('./pages/dashboard/DashboardTeam.vue') },
        { path: 'blogs', name: 'dash-blogs', component: () => import('./pages/dashboard/DashboardComingSoon.vue'), meta: { title: 'Blogs' } },
        { path: 'partenaires', name: 'dash-partenaires', component: () => import('./pages/dashboard/DashboardComingSoon.vue'), meta: { title: 'Partenaires' } },
        { path: 'tarifs', name: 'dash-tarifs', component: () => import('./pages/dashboard/DashboardComingSoon.vue'), meta: { title: 'Tarifs' } },
        { path: 'settings', name: 'dash-settings', component: () => import('./pages/dashboard/DashboardSettings.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

// Auth guard: the dashboard is reserved for authenticated admins.
router.beforeEach(async (to) => {
  const { token, isAdmin, ensureSession } = useAuth()
  if (token.value) await ensureSession()
  if (to.meta.requiresAdmin && !isAdmin.value) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && isAdmin.value) {
    return { path: '/dashboard' }
  }
  return true
})

const app = createApp(App)

app.use(router)
app.use(ui)
app.directive('reveal', vReveal)

app.mount('#app')
