<script setup lang="ts">
import { useViewport } from '@/composables/useViewport'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NIcon from '@/components/base/NIcon.vue'
import NSectionHeader from '@/components/base/NSectionHeader.vue'
import PageBanner from '@/components/sections/PageBanner.vue'
import CtaBand from '@/components/sections/CtaBand.vue'

const { isMobile } = useViewport()

// [name, price, features[], hot]
const FORMULES: [string, string, string[], boolean][] = [
  ['Basique', '25 000', ['Logo simple', '1 proposition', 'Livrables HD'], false],
  ['Standard', '50 000', ['Logo + charte', '2 propositions', 'Fichiers vectoriels', 'Cartes de visite'], true],
  ['Premium', '100 000', ['Identité complète', '3 propositions', 'Pack réseaux sociaux', 'Maquette web'], false],
]

// [groupTitle, icon, rows[ [name, desc, price] ]]
const PRICE_GROUPS: [string, string, [string, string, string][]][] = [
  ['Identité visuelle', 'palette', [
    ['Logo professionnel', 'Création sur mesure (2 à 3 propositions, livrables HD + vectoriels)', '25 000'],
    ['Charte graphique complète', "Couleurs, typographies, déclinaisons du logo, guide d'utilisation", '50 000'],
    ["Rebranding (refonte d'identité)", 'Modernisation complète de votre image visuelle', '30 000'],
  ]],
  ['Supports imprimés', 'printer', [
    ['Carte de visite', 'Conception graphique professionnelle', '5 000'],
    ['Carte de visite + impression', '100 exemplaires – papier premium 300g', '12 000 – 15 000'],
    ['Flyer / Affiche A5 ou A4', 'Design publicitaire événement ou produit', '10 000 – 15 000'],
    ['Brochure / Catalogue', 'Mise en page 4 à 12 pages', '25 000'],
    ['Bannière / Roll-up / Kakemono', 'Création + fichier prêt à imprimer', '15 000'],
  ]],
  ['Supports numériques', 'share-2', [
    ['Visuel réseaux sociaux', 'Post ou bannière (Facebook, Insta, TikTok…)', '5 000'],
    ['Pack réseaux sociaux (10 visuels)', 'Visuels cohérents pour une campagne ou un mois', '40 000'],
    ['Photomontage / Retouche pro', 'Ajustements, détourage, composition créative', '3 000 – 7 000'],
    ['Mini animation / teaser (motion)', 'Animation 10 à 30 secondes', '30 000'],
  ]],
  ['Design web & digital', 'monitor', [
    ['Maquette de site web (UI/UX)', 'Design complet site vitrine ou e-commerce', '50 000 – 100 000'],
    ['Bannière web / publicité digitale', 'Pour site ou campagne sponsorisée', '10 000'],
    ['Email marketing / signature mail', 'Design professionnel et personnalisé', '8 000'],
  ]],
  ['Autres prestations', 'sparkles', [
    ["Carte d'invitation / Menu / Certificat", 'Conception élégante et sur mesure', '8 000'],
    ['Calendrier / Agenda / Planning', 'Conception personnalisée', '15 000'],
    ["Affiche d'événement grand format", 'Pour impression ou projection numérique', 'Sur devis'],
  ]],
]
</script>

<template>
  <div>
    <PageBanner
      eyebrow="Grille tarifaire"
      title="Des tarifs clairs, sans surprise"
      intro="Les tarifs peuvent varier selon la complexité du projet, le délai et les révisions demandées. Tous les prix sont indiqués à partir de, en FCFA."
    />

    <!-- Formules -->
    <section class="formules-sec">
      <NContainer>
        <NSectionHeader eyebrow="Formules · Identité visuelle" title="Choisissez votre formule" align="center" />
        <div class="formules" :class="{ 'is-mobile': isMobile }">
          <div
            v-for="f in FORMULES"
            :key="f[0]"
            v-reveal
            class="formule"
            :class="{ hot: f[3] }"
          >
            <span v-if="f[3]" class="badge">Populaire</span>
            <NEyebrow :on-dark="f[3]">Formule</NEyebrow>
            <h3 class="f-name">{{ f[0] }}</h3>
            <div class="f-price">
              <span class="amt">{{ f[1] }}</span><span class="cur">FCFA</span>
            </div>
            <div class="feats">
              <div v-for="feat in f[2]" :key="feat" class="feat">
                <NIcon name="check" :size="15" color="var(--nova-lime)" />{{ feat }}
              </div>
            </div>
            <NButton :variant="f[3] ? 'accent' : 'ghost'" to="/contact" block>Demander un devis</NButton>
          </div>
        </div>
      </NContainer>
    </section>

    <!-- Detailed tables -->
    <section class="tables-sec">
      <NContainer>
        <div v-for="g in PRICE_GROUPS" :key="g[0]" class="group">
          <div class="g-head">
            <div class="g-ic"><NIcon :name="g[1]" :size="18" color="#fff" /></div>
            <h3 class="g-title">{{ g[0] }}</h3>
          </div>
          <div class="table">
            <div
              v-for="(r, i) in g[2]"
              :key="r[0]"
              class="row"
              :class="{ 'is-mobile': isMobile, first: i === 0 }"
            >
              <div class="r-name">{{ r[0] }}</div>
              <div v-if="!isMobile" class="r-desc">{{ r[1] }}</div>
              <div class="r-price">
                {{ r[2] }}<span v-if="r[2] !== 'Sur devis'" class="r-cur">FCFA</span>
              </div>
              <div v-if="isMobile" class="r-desc m">{{ r[1] }}</div>
            </div>
          </div>
        </div>
      </NContainer>
    </section>

    <CtaBand />
  </div>
</template>

<style scoped>
.formules-sec { padding: 64px 0 40px; background: var(--nova-paper); }
.formules { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; margin-top: 48px; align-items: stretch; }
.formules.is-mobile { grid-template-columns: 1fr; }
.formule {
  background: #fff;
  border: 1px solid var(--border-1);
  border-radius: var(--r-xl);
  padding: 34px 30px;
  box-shadow: var(--shadow-sm);
  position: relative;
  display: flex;
  flex-direction: column;
}
.formule.hot {
  background: linear-gradient(160deg, #034159, #025951);
  border-color: transparent;
  box-shadow: var(--shadow-lg);
  transform: scale(1.04);
}
.formules.is-mobile .formule.hot { transform: none; }
.badge {
  position: absolute;
  top: 18px;
  right: 18px;
  background: var(--nova-lime);
  color: #042b16;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 999px;
}
.f-name {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 600;
  margin: 8px 0 14px;
  color: var(--fg-1);
}
.formule.hot .f-name { color: #fff; }
.f-price { display: flex; align-items: baseline; gap: 6px; margin-bottom: 22px; }
.amt { font-family: var(--font-display); font-size: 40px; font-weight: 700; color: var(--fg-1); }
.formule.hot .amt { color: #fff; }
.cur { font-size: 13px; color: var(--fg-3); }
.formule.hot .cur { color: var(--fg-on-dark-2); }
.feats { display: flex; flex-direction: column; gap: 11px; margin-bottom: 26px; flex: 1; }
.feat { display: flex; align-items: center; gap: 9px; font-size: 13.5px; color: var(--fg-2); }
.formule.hot .feat { color: var(--fg-on-dark-2); }

.tables-sec { padding: 40px 0 96px; background: var(--nova-paper); }
.group { margin-bottom: 40px; }
.g-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.g-ic { width: 38px; height: 38px; border-radius: var(--r-md); background: var(--nova-navy); display: grid; place-items: center; }
.g-title { font-family: var(--font-display); font-size: 24px; font-weight: 600; margin: 0; color: var(--fg-1); }
.table { background: #fff; border: 1px solid var(--border-1); border-radius: var(--r-lg); overflow: hidden; box-shadow: var(--shadow-xs); }
.row {
  display: grid;
  grid-template-columns: 1.1fr 1.4fr auto;
  gap: 16px;
  align-items: center;
  padding: 16px 22px;
  border-top: 1px solid var(--border-1);
}
.row.first { border-top: none; }
.row.is-mobile { grid-template-columns: 1fr auto; gap: 4px 12px; padding: 14px 16px; }
.r-name { font-weight: 600; font-size: 14.5px; color: var(--fg-1); }
.r-desc { font-size: 13px; color: var(--fg-3); line-height: 1.5; }
.r-desc.m { font-size: 12px; line-height: 1.45; grid-column: 1; }
.r-price {
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 15px;
  color: var(--nova-teal);
  white-space: nowrap;
  text-align: right;
}
.row.is-mobile .r-price { grid-column: 2; grid-row: 1 / span 2; }
.r-cur { font-size: 11px; font-weight: 500; color: var(--fg-3); margin-left: 4px; }

@media (max-width: 759px) { .formules-sec { padding: 44px 0 32px; } }
</style>
