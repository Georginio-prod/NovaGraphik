<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { gsap, ScrollTrigger, NOVA, prefersReducedMotion } from '@/lib/gsap'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NSectionHeader from '@/components/base/NSectionHeader.vue'
import NField from '@/components/base/NField.vue'
import NIcon from '@/components/base/NIcon.vue'
import NPlaceholder from '@/components/base/NPlaceholder.vue'
import CtaBand from '@/components/sections/CtaBand.vue'

// ─── Content (rebuilt from the live VTC landing) ──────────────────────────────
// Numeric stats animate with a count-up; non-numeric values render as-is.
type Stat = { value: number; prefix: string; suffix: string; label: string; decimals?: number }
const STATS: Stat[] = [
  { value: 30, prefix: '+', suffix: '', label: 'Sites livrés' },
  { value: 5, prefix: '', suffix: '+', label: "Ans d'expérience" },
  { value: 14, prefix: '', suffix: 'j', label: 'Délai moyen' },
  { value: 4.9, prefix: '', suffix: '/5', label: 'Note clients', decimals: 1 },
]

const PROBLEMS = [
  {
    n: '01',
    icon: 'eye',
    title: 'Invisible',
    text: "Quand un client tape « chauffeur privé + votre ville » sur Google, c'est un concurrent qui apparaît. Pas vous.",
  },
  {
    n: '02',
    icon: 'shield-check',
    title: 'Peu crédible',
    text: "Un simple profil Uber ne rassure plus une clientèle premium. Sans vitrine pro, le doute s'installe avant l'appel.",
  },
  {
    n: '03',
    icon: 'trending-up',
    title: 'Commissionné',
    text: '25 % à 30 % de commission qui partent en fumée à chaque course. Un site direct, c\'est votre marge qui revient.',
  },
]

const BENEFITS = [
  {
    icon: 'gem',
    title: 'Un design sur mesure',
    text: "Pas de template recyclé. Une esthétique premium qui inspire confiance dès la première seconde.",
  },
  {
    icon: 'zap',
    title: 'Réservation en 1 clic',
    text: 'WhatsApp, téléphone ou formulaire : vos passagers réservent sans friction, même à 2h du matin.',
  },
  {
    icon: 'map-pin',
    title: 'Visible sur Google',
    text: 'Référencement local optimisé pour ressortir sur les recherches de votre zone d\'activité.',
  },
  {
    icon: 'smartphone',
    title: 'Pensé mobile',
    text: '80 % de vos visiteurs sont sur smartphone. Votre site est rapide et impeccable sur tous les écrans.',
  },
]

const WORKS = [
  { title: 'Ycare Worldwide', tag: 'Chauffeur privé · Île-de-France', desc: 'Site vitrine premium pour une clientèle exigeante.' },
  { title: 'VTC Express', tag: 'Transferts aéroport', desc: 'Réservation rapide spécialisée navette aéroport.' },
  { title: 'VTC Business', tag: 'Événementiel · B2B', desc: 'Plateforme haut de gamme événements & entreprises.' },
  { title: 'VTC Régional', tag: 'Longue distance', desc: 'Service régional longue distance et trajets sur devis.' },
]

const PROCESS_FLOW = [
  { icon: 'map-pin', title: 'Recherche locale', text: 'Un client cherche un chauffeur dans votre ville.' },
  { icon: 'monitor', title: 'Site professionnel', text: 'Il tombe sur votre vitrine, rassurante et premium.' },
  { icon: 'phone', title: 'Réservation directe', text: 'Il réserve en 1 clic. Zéro commission.' },
]

const OFFERS = [
  {
    name: 'Vitrine + Réservation',
    price: '920',
    pitch: 'L\'essentiel pour exister en ligne et capter des courses directes.',
    featured: false,
    features: [
      'Design sur mesure, mobile-first',
      '5 pages essentielles',
      'Boutons WhatsApp / appel / formulaire',
      'Référencement local de base',
      'Livraison en 14 jours',
    ],
  },
  {
    name: 'Pro + Dispatch',
    price: '1 650',
    pitch: 'Le site qui encaisse, calcule et organise vos courses à votre place.',
    featured: true,
    features: [
      'Tout de l\'offre Vitrine, plus :',
      'Paiement en ligne 24/7 (Stripe)',
      'Calcul automatique des tarifs',
      'Dispatch chauffeur & zones de service',
      'Notifications email / SMS',
      'Facturation PDF automatique',
    ],
  },
  {
    name: 'Premium Clé en main',
    price: '2 200',
    pitch: 'On s\'occupe de tout : marque, contenus et mise en ligne.',
    featured: false,
    features: [
      'Tout de l\'offre Pro, plus :',
      'Rédaction des textes (copywriting)',
      'Logo & identité de marque',
      'Pages supplémentaires',
      'SEO local renforcé',
      'Session de formation (1h)',
    ],
  },
]

const STEPS = [
  { n: '1', title: 'Échange', text: 'Un appel de 30 min pour cerner votre activité et vos besoins.' },
  { n: '2', title: 'Contenus', text: 'Vous fournissez textes, photos et logo. On vous guide pas à pas.' },
  { n: '3', title: 'Création', text: 'On conçoit la maquette, avec 2 cycles de retours inclus.' },
  { n: '4', title: 'Mise en ligne', text: 'Lancement, formation et site en ligne. Aucune prise de tête technique.' },
]

const TESTIMONIALS = [
  { name: 'Karim B.', city: 'Lyon', text: 'Depuis le site, je reçois des réservations directes chaque semaine. Fini les commissions qui me grignotent.' },
  { name: 'Sébastien M.', city: 'Paris', text: 'Un rendu vraiment pro. Mes clients business me prennent au sérieux dès qu\'ils voient le site.' },
  { name: 'Anthony D.', city: 'Nice', text: 'Simple, rapide, élégant. Le bouton WhatsApp transforme mes visiteurs en courses réservées.' },
]

const FAQ = [
  { q: 'En combien de temps mon site est-il livré ?', a: 'Comptez environ 14 jours ouvrés à partir de la réception de vos contenus (textes, photos, logo). On vous accompagne pour rassembler tout ça rapidement.' },
  { q: 'Le site sera-t-il optimisé pour mobile ?', a: 'Oui, totalement. 80 % de vos visiteurs naviguent depuis leur smartphone : votre site est conçu mobile-first, rapide et impeccable sur tous les écrans.' },
  { q: 'Puis-je avoir un bouton WhatsApp et appel direct ?', a: 'Bien sûr. Les boutons WhatsApp, appel et formulaire sont intégrés et toujours accessibles pour que vos passagers réservent en un clic.' },
  { q: 'Pourrai-je modifier mon site moi-même ?', a: 'Oui. On vous remet un site facile à mettre à jour et une courte formation pour gérer vos contenus en autonomie.' },
  { q: 'Vous refaites aussi les sites existants ?', a: 'Absolument. Si vous avez déjà un site qui ne convertit pas, on le repense entièrement pour en faire une vraie machine à réservations.' },
  { q: 'Proposez-vous de la maintenance ?', a: 'Oui, des forfaits de maintenance et d\'évolution sont disponibles pour garder votre site rapide, sécurisé et à jour.' },
]

// ─── FAQ accordion (dynamic) ──────────────────────────────────────────────────
const openFaq = ref<number | null>(0)
function toggleFaq(i: number) {
  openFaq.value = openFaq.value === i ? null : i
}

// ─── Contact form (local state; submission wired to the existing CTA flow) ────
const form = ref({ prenom: '', nom: '', tel: '', email: '', zone: '', message: '' })

// ─── Count-up stats on enter ──────────────────────────────────────────────────
const statValues = ref<number[]>(STATS.map(() => 0))
const heroMark = ref<HTMLElement | null>(null)
let heroFloat: gsap.core.Tween | null = null
const countTweens: gsap.core.Tween[] = []

onMounted(() => {
  if (prefersReducedMotion) {
    statValues.value = STATS.map((s) => s.value)
    return
  }

  // Animated count-up — proxies tween from 0 to each stat value.
  STATS.forEach((s, i) => {
    const proxy = { v: 0 }
    countTweens.push(
      gsap.to(proxy, {
        v: s.value,
        duration: 1.1,
        delay: 0.2 + i * 0.08,
        ease: NOVA.ease,
        onUpdate: () => {
          statValues.value[i] = proxy.v
        },
      }),
    )
  })

  // Gentle continuous float on the hero badge for a "living" hero.
  if (heroMark.value) {
    heroFloat = gsap.to(heroMark.value, {
      y: -12,
      duration: 2.4,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })
  }
})

onBeforeUnmount(() => {
  countTweens.forEach((t) => t.kill())
  heroFloat?.kill()
  ScrollTrigger.getAll().forEach((t) => t.kill())
})

function fmtStat(i: number): string {
  const s = STATS[i]
  const n = s.decimals ? statValues.value[i].toFixed(s.decimals).replace('.', ',') : Math.round(statValues.value[i]).toString()
  return `${s.prefix}${n}${s.suffix}`
}
</script>

<template>
  <div class="overflow-x-hidden">
    <!-- ─── HERO ─────────────────────────────────────────────────────────── -->
    <section class="relative overflow-hidden bg-gradient-to-br from-nova-navy-900 from-0% via-nova-navy via-45% to-nova-teal-deep">
      <img
        src="/assets/compass-mark-white.png"
        alt=""
        class="pointer-events-none absolute -right-[120px] top-1/2 w-[560px] -translate-y-1/2 opacity-[0.06]"
      />
      <NContainer>
        <div class="relative grid items-center gap-12 py-16 desk:grid-cols-[1.1fr_0.9fr] desk:py-[110px]">
          <div>
            <NEyebrow on-dark v-enter="0" class="mb-5">Sites web VTC · Chauffeur privé</NEyebrow>
            <h1
              v-enter="1"
              class="m-0 max-w-[640px] font-display text-[clamp(40px,6vw,72px)] font-semibold leading-[0.98] tracking-tight text-white"
            >
              Vos passagers réservent <span class="italic text-nova-lime">avant</span> même de monter.
            </h1>
            <p v-enter="2" class="my-7 max-w-[520px] text-[18px] leading-relaxed text-fg-on-dark-2">
              Un site chauffeur privé sur mesure, pensé pour rassurer vos passagers, capter des courses directes
              et vous libérer des commissions des plateformes.
            </p>
            <div v-enter="3" class="flex flex-wrap gap-3.5">
              <NButton variant="accent" size="lg" icon="arrow-right" to="/contact">Demander un devis gratuit</NButton>
              <NButton variant="ghostDark" size="lg" to="/portfolios">Voir nos réalisations</NButton>
            </div>
          </div>

          <!-- Phone mockup -->
          <div v-enter="4" class="relative mx-auto hidden desk:block">
            <div
              ref="heroMark"
              class="relative mx-auto w-[260px] rounded-[2rem] border border-white/15 bg-white/[0.04] p-3 shadow-nova-lg backdrop-blur-sm"
            >
              <div class="rounded-[1.4rem] bg-nova-navy-900/80 p-5">
                <div class="mb-4 flex items-center gap-2">
                  <span class="h-2.5 w-2.5 rounded-full bg-nova-lime"></span>
                  <span class="text-[11px] font-glyphic uppercase tracking-[0.18em] text-fg-on-dark-3">Réserver</span>
                </div>
                <div class="space-y-3">
                  <div class="rounded-md bg-white/[0.06] px-3 py-2.5 text-[13px] text-fg-on-dark-2">📍 Départ — Aéroport</div>
                  <div class="rounded-md bg-white/[0.06] px-3 py-2.5 text-[13px] text-fg-on-dark-2">🏁 Arrivée — Centre-ville</div>
                  <div class="flex items-center justify-between rounded-md bg-nova-lime/15 px-3 py-2.5">
                    <span class="text-[13px] text-white">Estimation</span>
                    <span class="font-display text-lg font-semibold text-nova-lime">48 €</span>
                  </div>
                  <div class="rounded-md bg-nova-lime py-2.5 text-center text-[13px] font-semibold text-[#042b16]">Réserver maintenant</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats band -->
        <div
          class="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/5 pb-16 desk:grid-cols-4 desk:pb-[90px]"
          style="background-color: rgba(255,255,255,0.04)"
        >
          <div
            v-for="(s, i) in STATS"
            :key="s.label"
            v-reveal="i * 80"
            class="group bg-nova-navy-900/40 px-6 py-7 text-center transition-colors duration-nova ease-nova hover:bg-nova-navy-900/70"
          >
            <div class="font-display text-[clamp(30px,4vw,44px)] font-semibold leading-none text-nova-lime transition-transform duration-nova ease-nova group-hover:scale-110">
              {{ fmtStat(i) }}
            </div>
            <div class="mt-2 text-[12px] font-glyphic uppercase tracking-[0.16em] text-fg-on-dark-3">{{ s.label }}</div>
          </div>
        </div>
      </NContainer>
    </section>

    <!-- ─── PROBLÈME ─────────────────────────────────────────────────────── -->
    <section class="bg-nova-paper py-16 tab:py-24">
      <NContainer>
        <NSectionHeader
          eyebrow="Le constat"
          title="Sans site, voilà ce qui se passe"
          intro="Vos clients vous cherchent. Ils trouvent un autre chauffeur privé."
        />
        <div class="mt-10 grid gap-[18px] tab:mt-14 tab:grid-cols-3">
          <div
            v-for="(p, i) in PROBLEMS"
            :key="p.n"
            v-reveal:scale="i * 90"
            class="group relative overflow-hidden rounded-lg border border-line bg-nova-surface p-7 shadow-nova-xs transition-all duration-nova ease-nova hover:-translate-y-1.5 hover:border-nova-teal-300 hover:shadow-nova-lg"
          >
            <span class="absolute -right-2 -top-4 font-display text-[88px] font-semibold leading-none text-nova-fog transition-colors duration-nova group-hover:text-nova-lime-soft/50 select-none">{{ p.n }}</span>
            <div class="relative">
              <div class="grid h-12 w-12 place-items-center rounded-md bg-nova-fog text-nova-teal transition-colors duration-nova group-hover:bg-nova-lime group-hover:text-[#042b16]">
                <NIcon :name="p.icon" :size="22" />
              </div>
              <h3 class="mb-2 mt-5 font-sans text-lg font-semibold tracking-tight text-fg-1">{{ p.title }}</h3>
              <p class="m-0 text-[14px] leading-relaxed text-fg-2">{{ p.text }}</p>
            </div>
          </div>
        </div>
      </NContainer>
    </section>

    <!-- ─── BÉNÉFICES ────────────────────────────────────────────────────── -->
    <section class="bg-nova-fog py-16 tab:py-24">
      <NContainer>
        <NSectionHeader
          eyebrow="La solution"
          title="Ce que ça change pour vous"
          intro="Un site pensé pour le métier de chauffeur privé VTC."
        />
        <div class="mt-10 grid gap-[18px] tab:mt-14 tab:grid-cols-2 desk:grid-cols-4">
          <div
            v-for="(b, i) in BENEFITS"
            :key="b.title"
            v-reveal="i * 70"
            class="group rounded-lg border border-line bg-nova-surface p-7 shadow-nova-xs transition-all duration-nova ease-nova hover:-translate-y-1.5 hover:border-nova-teal-300 hover:shadow-nova-lg"
          >
            <div class="grid h-12 w-12 place-items-center rounded-md bg-nova-fog text-nova-teal transition-all duration-nova group-hover:rotate-6 group-hover:bg-nova-lime group-hover:text-[#042b16]">
              <NIcon :name="b.icon" :size="22" />
            </div>
            <h3 class="mb-2 mt-5 font-sans text-base font-semibold tracking-tight text-fg-1">{{ b.title }}</h3>
            <p class="m-0 text-[13.5px] leading-relaxed text-fg-3">{{ b.text }}</p>
          </div>
        </div>
      </NContainer>
    </section>

    <!-- ─── RÉALISATIONS ─────────────────────────────────────────────────── -->
    <section class="bg-nova-paper py-16 tab:py-24">
      <NContainer>
        <div class="mb-10 flex items-end justify-between gap-4">
          <NSectionHeader eyebrow="Réalisations" title="Des sites qui tournent déjà" />
          <NButton variant="ghost" icon="arrow-right" to="/portfolios" class="hidden tab:inline-flex">Voir tout</NButton>
        </div>
        <div class="grid gap-[18px] tab:grid-cols-2 desk:grid-cols-4">
          <RouterLink
            v-for="(w, i) in WORKS"
            :key="w.title"
            to="/portfolios"
            v-reveal="i * 70"
            class="group block overflow-hidden rounded-lg no-underline shadow-nova-xs transition-all duration-nova ease-nova hover:-translate-y-1.5 hover:shadow-nova-lg"
          >
            <div class="relative h-44 overflow-hidden">
              <NPlaceholder :idx="i + 1" :height="'100%'" radius="rounded-none" />
              <div class="absolute inset-0 bg-gradient-to-t from-nova-navy-900/80 via-nova-navy-900/10 to-transparent transition-transform duration-nova ease-nova group-hover:scale-105"></div>
              <span class="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-nova-lime/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#042b16] opacity-0 transition-opacity duration-nova group-hover:opacity-100">
                <span class="h-1.5 w-1.5 rounded-full bg-[#042b16]"></span> En ligne
              </span>
            </div>
            <div class="border border-t-0 border-line bg-nova-surface p-5">
              <div class="text-[10px] font-glyphic uppercase tracking-[0.16em] text-nova-teal">{{ w.tag }}</div>
              <h3 class="my-1.5 font-display text-xl font-semibold tracking-tight text-fg-1">{{ w.title }}</h3>
              <p class="m-0 text-[13px] leading-snug text-fg-3">{{ w.desc }}</p>
              <div class="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-nova-teal opacity-0 transition-all duration-nova -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100">
                Voir le projet <NIcon name="arrow-right" :size="14" />
              </div>
            </div>
          </RouterLink>
        </div>
      </NContainer>
    </section>

    <!-- ─── FLUX (recherche → site → réservation) ────────────────────────── -->
    <section class="relative overflow-hidden bg-nova-navy-900 py-16 tab:py-24">
      <NContainer>
        <NSectionHeader
          on-dark
          align="center"
          eyebrow="Concrètement"
          title="De la recherche locale à la réservation directe"
          intro="Un parcours simple, sans intermédiaire, qui ramène le client directement chez vous."
        />
        <div class="mt-12 flex flex-col items-stretch gap-4 tab:flex-row tab:items-center tab:justify-center">
          <template v-for="(f, i) in PROCESS_FLOW" :key="f.title">
            <div
              v-reveal:scale="i * 120"
              class="group flex-1 rounded-lg border border-white/10 bg-white/[0.04] p-7 text-center transition-all duration-nova ease-nova hover:-translate-y-1.5 hover:border-nova-lime/40 hover:bg-white/[0.07]"
            >
              <div class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-nova-lime/15 text-nova-lime transition-transform duration-nova group-hover:scale-110">
                <NIcon :name="f.icon" :size="26" />
              </div>
              <h3 class="mb-1.5 mt-4 font-sans text-base font-semibold text-white">{{ f.title }}</h3>
              <p class="m-0 text-[13px] leading-snug text-fg-on-dark-2">{{ f.text }}</p>
            </div>
            <div v-if="i < PROCESS_FLOW.length - 1" class="grid place-items-center text-nova-lime tab:rotate-0 rotate-90">
              <NIcon name="arrow-right" :size="24" />
            </div>
          </template>
        </div>
      </NContainer>
    </section>

    <!-- ─── TARIFS ───────────────────────────────────────────────────────── -->
    <section class="bg-nova-fog py-16 tab:py-24">
      <NContainer>
        <NSectionHeader
          align="center"
          eyebrow="Les offres"
          title="3 offres adaptées à votre activité"
          intro="Paiement en 2 fois sans frais. Pas de surprise, tout est inclus."
        />
        <div class="mt-12 grid items-start gap-6 tab:grid-cols-3">
          <div
            v-for="(o, i) in OFFERS"
            :key="o.name"
            v-reveal="i * 90"
            class="group relative flex flex-col rounded-xl border bg-nova-surface p-7 transition-all duration-nova ease-nova hover:-translate-y-2 hover:shadow-nova-lg"
            :class="o.featured ? 'border-nova-lime shadow-nova-md tab:-translate-y-3 tab:scale-[1.03] ring-1 ring-nova-lime/40' : 'border-line shadow-nova-xs hover:border-nova-teal-300'"
          >
            <span
              v-if="o.featured"
              class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-nova-lime px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#042b16]"
            >⭐ Recommandé</span>
            <h3 class="font-display text-2xl font-semibold tracking-tight text-fg-1">{{ o.name }}</h3>
            <p class="mt-1.5 min-h-[40px] text-[13px] leading-snug text-fg-3">{{ o.pitch }}</p>
            <div class="my-5 flex items-end gap-1.5">
              <span class="font-display text-[44px] font-semibold leading-none text-nova-navy">{{ o.price }}€</span>
              <span class="mb-1.5 text-[12px] text-fg-3">TTC</span>
            </div>
            <ul class="m-0 mb-7 flex flex-col gap-2.5 p-0">
              <li v-for="f in o.features" :key="f" class="flex items-start gap-2.5 text-[13.5px] leading-snug text-fg-2">
                <span class="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-nova-lime/20 text-nova-teal">
                  <NIcon name="check" :size="12" :stroke-width="2.5" />
                </span>
                {{ f }}
              </li>
            </ul>
            <NButton
              :variant="o.featured ? 'accent' : 'ghost'"
              icon="arrow-right"
              to="/contact"
              block
              class="mt-auto"
            >Choisir cette offre</NButton>
          </div>
        </div>
      </NContainer>
    </section>

    <!-- ─── ÉTAPES ───────────────────────────────────────────────────────── -->
    <section class="bg-nova-paper py-16 tab:py-24">
      <NContainer>
        <NSectionHeader
          eyebrow="Comment ça se passe"
          title="4 étapes. Aucune prise de tête technique."
        />
        <div class="mt-12 grid gap-[18px] tab:grid-cols-4">
          <div
            v-for="(s, i) in STEPS"
            :key="s.n"
            v-reveal="i * 80"
            class="group relative rounded-lg border border-line bg-nova-surface p-7 transition-all duration-nova ease-nova hover:-translate-y-1.5 hover:border-nova-teal-300 hover:shadow-nova-md"
          >
            <div class="grid h-11 w-11 place-items-center rounded-full bg-nova-navy font-display text-lg font-semibold text-nova-lime transition-transform duration-nova group-hover:scale-110">{{ s.n }}</div>
            <h3 class="mb-2 mt-4 font-sans text-base font-semibold tracking-tight text-fg-1">{{ s.title }}</h3>
            <p class="m-0 text-[13px] leading-relaxed text-fg-3">{{ s.text }}</p>
          </div>
        </div>
      </NContainer>
    </section>

    <!-- ─── TÉMOIGNAGES ──────────────────────────────────────────────────── -->
    <section class="bg-nova-fog py-16 tab:py-24">
      <NContainer>
        <NSectionHeader align="center" eyebrow="Ils témoignent" title="Ce qu'en disent les chauffeurs" />
        <div class="mt-12 grid gap-[18px] tab:grid-cols-3">
          <figure
            v-for="(t, i) in TESTIMONIALS"
            :key="t.name"
            v-reveal:scale="i * 90"
            class="group flex flex-col rounded-lg border border-line bg-nova-surface p-7 shadow-nova-xs transition-all duration-nova ease-nova hover:-translate-y-1.5 hover:shadow-nova-lg"
          >
            <div class="mb-3 flex gap-0.5 text-nova-lime">
              <NIcon v-for="n in 5" :key="n" name="star" :size="16" class="transition-transform duration-nova" :style="{ transitionDelay: n * 30 + 'ms' }" />
            </div>
            <blockquote class="m-0 flex-1 text-[15px] leading-relaxed text-fg-1">« {{ t.text }} »</blockquote>
            <figcaption class="mt-5 flex items-center gap-3">
              <span class="grid h-10 w-10 place-items-center rounded-full bg-nova-navy font-display font-semibold text-nova-lime">{{ t.name.charAt(0) }}</span>
              <span>
                <span class="block text-[14px] font-semibold text-fg-1">{{ t.name }}</span>
                <span class="block text-[12px] text-fg-3">{{ t.city }}</span>
              </span>
            </figcaption>
          </figure>
        </div>
      </NContainer>
    </section>

    <!-- ─── FAQ (accordéon dynamique) ────────────────────────────────────── -->
    <section class="bg-nova-paper py-16 tab:py-24">
      <NContainer>
        <div class="mx-auto max-w-[760px]">
          <NSectionHeader align="center" eyebrow="FAQ" title="Questions fréquentes" />
          <div class="mt-10 flex flex-col gap-3">
            <div
              v-for="(item, i) in FAQ"
              :key="i"
              v-reveal="i * 50"
              class="overflow-hidden rounded-lg border border-line bg-nova-surface transition-colors duration-nova"
              :class="openFaq === i ? 'border-nova-teal-300 shadow-nova-sm' : 'hover:border-line-strong'"
            >
              <button
                type="button"
                class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                @click="toggleFaq(i)"
              >
                <span class="font-sans text-[15px] font-semibold text-fg-1">{{ item.q }}</span>
                <NIcon
                  name="chevron-down"
                  :size="20"
                  class="shrink-0 text-nova-teal transition-transform duration-nova ease-nova"
                  :class="openFaq === i && 'rotate-180'"
                />
              </button>
              <!-- Tailwind-only smooth height: grid-rows 0fr → 1fr -->
              <div
                class="grid transition-[grid-template-rows] duration-nova ease-nova"
                :class="openFaq === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
              >
                <div class="overflow-hidden">
                  <p class="m-0 px-6 pb-5 text-[14px] leading-relaxed text-fg-2">{{ item.a }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </NContainer>
    </section>

    <!-- ─── CTA + FORMULAIRE ─────────────────────────────────────────────── -->
    <section class="relative overflow-hidden bg-gradient-to-br from-nova-navy-900 to-nova-teal-deep py-16 tab:py-24">
      <NContainer>
        <div class="grid items-center gap-12 desk:grid-cols-2">
          <div v-reveal:left>
            <NEyebrow on-dark class="mb-4">On en discute ?</NEyebrow>
            <h2 class="m-0 max-w-[460px] font-display text-[clamp(30px,4vw,46px)] font-semibold leading-[1.06] tracking-tight text-white">
              Un site qui travaille pour vous, pendant que vous conduisez.
            </h2>
            <p class="mt-5 max-w-[440px] text-[16px] leading-relaxed text-fg-on-dark-2">
              Décrivez votre projet en 3 minutes. Nous vous revenons personnellement sous 24h, avec une
              recommandation claire et un devis adapté.
            </p>
            <div class="mt-7 flex flex-wrap gap-4 text-fg-on-dark-2">
              <span class="flex items-center gap-2 text-[14px]"><NIcon name="phone" :size="16" class="text-nova-lime" /> Réponse sous 24h</span>
              <span class="flex items-center gap-2 text-[14px]"><NIcon name="shield-check" :size="16" class="text-nova-lime" /> Sans engagement</span>
            </div>
          </div>

          <form
            v-reveal:right="80"
            class="rounded-xl border border-white/10 bg-nova-surface p-7 shadow-nova-lg"
            @submit.prevent
          >
            <h3 class="mb-5 font-display text-xl font-semibold text-fg-1">Votre devis personnalisé</h3>
            <div class="grid gap-4 tab:grid-cols-2">
              <NField v-model="form.prenom" label="Prénom" placeholder="Karim" />
              <NField v-model="form.nom" label="Nom" placeholder="B." />
              <NField v-model="form.tel" label="Téléphone" type="tel" placeholder="06 12 34 56 78" />
              <NField v-model="form.email" label="Email" type="email" placeholder="vous@email.com" />
            </div>
            <div class="mt-4">
              <NField v-model="form.zone" label="Zone d'activité principale" placeholder="Lyon et alentours" />
            </div>
            <div class="mt-4">
              <label class="text-[11px] font-semibold uppercase tracking-wider text-fg-2">Votre projet</label>
              <textarea
                v-model="form.message"
                rows="3"
                placeholder="Décrivez votre activité et vos besoins…"
                class="mt-2 w-full resize-none rounded-sm border border-line-strong bg-nova-paper px-3.5 py-3 font-sans text-sm text-fg-1 outline-none transition-[border-color,box-shadow,background] duration-nova focus:border-nova-lime focus:bg-nova-surface focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)]"
              ></textarea>
            </div>
            <NButton variant="accent" icon="arrow-right" block class="mt-6">Envoyer ma demande</NButton>
            <p class="mt-3 mb-0 text-center text-[12px] text-fg-3">Réponse personnalisée sous 24h ouvrées.</p>
          </form>
        </div>
      </NContainer>
    </section>

    <CtaBand />
  </div>
</template>
