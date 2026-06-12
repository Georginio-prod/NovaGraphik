import './assets/css/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import { vReveal } from './directives/reveal'
import { vEnter } from './directives/enter'
import { ScrollTrigger } from './lib/gsap'
import { useAuth } from './composables/useAuth'
import { initTheme } from './composables/useTheme'
import { startLoading, doneLoading } from './composables/useLoadingBar'

initTheme()

// Take scroll control away from the browser: native "auto" restoration + scroll
// anchoring re-position the viewport when a route renders synchronously (e.g.
// pages hydrated from cache), which overrides scrollBehavior and leaves the user
// part-way down the new page. With "manual", scrollBehavior is the single source.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('./pages/HomePage.vue') },
    { path: '/portfolios', name: 'portfolios', component: () => import('./pages/PortfolioPage.vue') },
    { path: '/blogs', name: 'blogs', component: () => import('./pages/BlogPage.vue') },
    { path: '/promotions', name: 'promotions', component: () => import('./pages/PromotionPage.vue') },
    { path: '/promotions/:slug', name: 'promotion', component: () => import('./pages/PromotionDetailPage.vue') },
    { path: '/blogs/:slug', name: 'article', component: () => import('./pages/BlogArticlePage.vue') },
    { path: '/contact', name: 'contact', component: () => import('./pages/ContactPage.vue') },
    { path: '/partenaires', name: 'partenaires', component: () => import('./pages/PartnersPage.vue') },
    { path: '/grille-tarifaire', name: 'tarifs', component: () => import('./pages/PricingPage.vue') },
    { path: '/site-web-vtc', name: 'vtc', component: () => import('./pages/VtcPage.vue') },
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
        { path: 'services', name: 'dash-services', component: () => import('./pages/dashboard/DashboardServices.vue') },
        { path: 'portfolio', name: 'dash-portfolio', component: () => import('./pages/dashboard/DashboardPortfolio.vue') },
        { path: 'team', name: 'dash-team', component: () => import('./pages/dashboard/DashboardTeam.vue') },
        { path: 'blogs', name: 'dash-blogs', component: () => import('./pages/dashboard/DashboardArticles.vue') },
        { path: 'promotions', name: 'dash-promotions', component: () => import('./pages/dashboard/DashboardPromotions.vue') },
        { path: 'commandes', name: 'dash-commandes', component: () => import('./pages/dashboard/DashboardOrders.vue') },
        { path: 'partenaires', name: 'dash-partenaires', component: () => import('./pages/dashboard/DashboardPartners.vue') },
        { path: 'tarifs', name: 'dash-tarifs', component: () => import('./pages/dashboard/DashboardPricing.vue') },
        { path: 'navigation', name: 'dash-navigation', component: () => import('./pages/dashboard/DashboardNavigation.vue') },
        { path: 'footer', name: 'dash-footer', component: () => import('./pages/dashboard/DashboardFooter.vue') },
        { path: 'settings', name: 'dash-settings', component: () => import('./pages/dashboard/DashboardSettings.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, _from, savedPosition) {
    // Anchor links (e.g. /#equipe) scroll to the target. The element may render
    // after async content loads, so poll briefly until it exists.
    if (to.hash) {
      return new Promise((resolve) => {
        let tries = 0
        const tryScroll = () => {
          if (document.querySelector(to.hash) || tries++ > 20) {
            resolve({ el: to.hash, behavior: 'smooth' })
          } else {
            setTimeout(tryScroll, 60)
          }
        }
        tryScroll()
      })
    }
    // Back/forward: restore where the user was. Otherwise go to the top — but
    // wait two frames so a synchronously-rendered page (and any scroll-anchoring
    // it triggers) has settled, then our scroll is the last word, not the first.
    const target = savedPosition || { top: 0, left: 0 }
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve(target)))
    })
  },
})

// Auth guard: the admin area is reserved for authenticated users (Supabase).
router.beforeEach(async (to) => {
  startLoading()
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

// Recompute ScrollTrigger start/end positions once a new page has painted.
// Pages load content asynchronously (services, team, portfolio…), which shifts
// layout after triggers are created; without a refresh, some reveals never fire.
router.afterEach(() => {
  doneLoading()
  requestAnimationFrame(() => ScrollTrigger.refresh())
})
router.onError(doneLoading)

const app = createApp(App)

app.use(router)
app.use(ui)
app.directive('reveal', vReveal)
app.directive('enter', vEnter)

app.mount('#app')

// Fade out the boot splash once the app has mounted (next frame, so the first
// paint of real content is ready underneath).
requestAnimationFrame(() => {
  const boot = document.getElementById('boot-loader')
  if (!boot) return
  boot.classList.add('is-hiding')
  setTimeout(() => boot.remove(), 500)
})

// Late-loading assets (fonts, images) change layout; refresh trigger positions
// after full load so below-the-fold reveals stay accurate.
window.addEventListener('load', () => ScrollTrigger.refresh())

// Warm the lazy route chunks during idle time so the first click to another
// public page is instant (no on-demand chunk fetch latency).
const prefetchRoutes = () => {
  void import('./pages/PortfolioPage.vue')
  void import('./pages/ProjectPage.vue')
  void import('./pages/BlogPage.vue')
  void import('./pages/PromotionPage.vue')
  void import('./pages/PromotionDetailPage.vue')
  void import('./pages/ContactPage.vue')
  void import('./pages/PartnersPage.vue')
  void import('./pages/PricingPage.vue')
  void import('./pages/MemberPage.vue')
}
if ('requestIdleCallback' in window) {
  ;(window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(prefetchRoutes)
} else {
  setTimeout(prefetchRoutes, 1500)
}
