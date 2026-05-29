<script setup lang="ts">
import { useViewport } from '@/composables/useViewport'
import NIcon from '@/components/base/NIcon.vue'
import NButton from '@/components/base/NButton.vue'

const { isMobile } = useViewport()

const contacts: [string, string][] = [
  ['mail', 'Novagraphiksat@gmail.com'],
  ['phone', '+228 97 99 63 46'],
  ['map-pin', 'Lomé, Togo'],
]
const socials: [string, string][] = [
  ['instagram', 'Instagram'],
  ['facebook', 'Facebook'],
  ['youtube', 'YouTube'],
]
</script>

<template>
  <footer class="footer">
    <img src="/assets/compass-mark-white.png" alt="" class="bg-mark" />
    <div class="inner" :class="{ 'is-mobile': isMobile }">
      <div class="grid" :class="{ 'is-mobile': isMobile }">
        <div class="brand-col">
          <img src="/assets/logo-nova-mark-white.png" alt="Nova Graphik" class="flogo" />
          <p class="desc">
            Agence créative — communication visuelle, design graphique &amp; présence digitale des marques.
          </p>
        </div>

        <div>
          <div class="ftitle">Contacts</div>
          <a v-for="[icon, label] in contacts" :key="label" class="flink">
            <NIcon :name="icon" :size="15" color="var(--nova-lime)" />{{ label }}
          </a>
        </div>

        <div>
          <div class="ftitle">Réseaux sociaux</div>
          <a v-for="[icon, label] in socials" :key="label" class="flink">
            <NIcon :name="icon" :size="15" color="var(--nova-lime)" />{{ label }}
          </a>
        </div>

        <div>
          <div class="ftitle">S'abonner</div>
          <p class="sub-desc">Recevez nos derniers projets.</p>
          <div class="sub-row">
            <input placeholder="E-mail" class="sub-input" />
            <NButton variant="accent" size="sm">→</NButton>
          </div>
        </div>
      </div>

      <div class="bottom" :class="{ 'is-mobile': isMobile }">
        <span class="tagline">L'ESSENCE DU RAFFINEMENT</span>
        <span class="copy">© 2026 Nova Graphik. Tous droits réservés.</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--nova-navy-900);
  color: #fff;
  position: relative;
  overflow: hidden;
}
.bg-mark {
  position: absolute;
  right: -80px;
  bottom: -80px;
  width: 360px;
  opacity: 0.06;
  pointer-events: none;
}
.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 72px 32px 32px;
  position: relative;
}
.inner.is-mobile { padding: 48px 20px 28px; }

.grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1.3fr;
  gap: 40px;
}
.grid.is-mobile { grid-template-columns: 1fr 1fr; gap: 28px; }
.grid.is-mobile .brand-col { grid-column: 1 / -1; }

.flogo { width: 130px; margin-bottom: 18px; display: block; }
.desc {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--fg-on-dark-2);
  max-width: 280px;
  margin: 0;
}
.ftitle {
  font-family: var(--font-glyphic);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--nova-lime);
  margin-bottom: 16px;
}
.flink {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13.5px;
  margin-bottom: 11px;
  cursor: pointer;
  color: var(--fg-on-dark-2);
  transition: color var(--dur);
}
.flink:hover { color: #fff; }
.sub-desc { font-size: 13px; color: var(--fg-on-dark-2); margin: 0 0 12px; }
.sub-row { display: flex; gap: 8px; }
.sub-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--r-sm);
  padding: 10px 12px;
  color: #fff;
  font-size: 13px;
  font-family: var(--font-sans);
  outline: none;
}
.sub-input::placeholder { color: var(--fg-on-dark-3); }

.bottom {
  margin-top: 56px;
  padding-top: 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.bottom.is-mobile { margin-top: 36px; }
.tagline {
  font-family: var(--font-glyphic);
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--fg-on-dark-3);
}
.copy { font-size: 12px; color: var(--fg-on-dark-3); }
</style>
