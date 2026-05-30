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
    { path: '/portfolio/:slug', name: 'project', component: () => import('./pages/ProjectPage.vue') },
    { path: '/admin/login', name: 'login', component: () => import('./pages/LoginPage.vue'), meta: { bare: true } },
    {
      path: '/admin',
      component: () => import('./pages/dashboard/DashboardLayout.vue'),
      meta: { bare: true, requiresAdmin: true },
      children: [
        { path: '', name: 'dashboard', component: () => import('./pages/dashboard/DashboardOverview.vue') },
        { path: 'pages', name: 'dash-pages', component: () => import('./pages/dashboard/DashboardPages.vue') },
        { path: 'portfolio', name: 'dash-portfolio', component: () => import('./pages/dashboard/DashboardPortfolio.vue') },
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

// Auth guard: the admin area is reserved for authenticated users (Supabase).
router.beforeEach(async (to) => {
  const { isAuthenticated, ensureSession } = useAuth()
  await ensureSession()
  if (to.meta.requiresAdmin && !isAuthenticated.value) {
    return { path: '/admin/login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && isAuthenticated.value) {
    return { path: '/admin' }
  }
  return true
})

const app = createApp(App)

app.use(router)
app.use(ui)
app.directive('reveal', vReveal)

app.mount('#app')
