<script setup lang="ts">
import { ref } from 'vue'
import { useViewport } from '@/composables/useViewport'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NPill from '@/components/base/NPill.vue'
import NField from '@/components/base/NField.vue'
import NIcon from '@/components/base/NIcon.vue'
import NSectionHeader from '@/components/base/NSectionHeader.vue'
import PageBanner from '@/components/sections/PageBanner.vue'

const { isMobile } = useViewport()

const SERVICES_OPTS = ['Identité visuelle', 'Supports imprimés', 'Réseaux sociaux', 'Motion design', '3D / 2D', 'Photo / Reportage', 'Site web (UX/UI)', 'Autre']
const CONTACTS: [string, string, string][] = [
  ['mail', 'E-mail', 'Novagraphiksat@gmail.com'],
  ['phone', 'Téléphone', '+228 97 99 63 46'],
  ['map-pin', 'Localisation', 'Lomé, Togo'],
]

const sel = ref('Identité visuelle')
const sent = ref(false)
const name = ref('')
const email = ref('')
const message = ref('')

function submit() {
  sent.value = true
}
function reset() {
  sent.value = false
  name.value = ''
  email.value = ''
  message.value = ''
  sel.value = 'Identité visuelle'
}
</script>

<template>
  <div>
    <PageBanner
      eyebrow="Contact · Devis"
      title="Parlons de votre projet"
      intro="Décrivez-nous votre besoin — nous revenons vers vous sous 24 h avec une proposition sur mesure."
    />
    <section class="sec">
      <NContainer>
        <div class="grid" :class="{ 'is-mobile': isMobile }">
          <!-- Left: coordinates -->
          <div>
            <NSectionHeader eyebrow="Coordonnées" title="Nova Graphik" />
            <div class="rows">
              <div v-for="c in CONTACTS" :key="c[1]" class="crow">
                <div class="c-ic"><NIcon :name="c[0]" :size="18" color="var(--nova-teal)" /></div>
                <div>
                  <div class="c-label">{{ c[1] }}</div>
                  <div class="c-value">{{ c[2] }}</div>
                </div>
              </div>
            </div>
            <div class="socials">
              <a v-for="s in ['instagram', 'facebook', 'youtube']" :key="s" class="social">
                <NIcon :name="s" :size="18" color="#fff" />
              </a>
            </div>
          </div>

          <!-- Right: form -->
          <div class="form-card" :class="{ 'is-mobile': isMobile }">
            <div v-if="sent" class="success">
              <div class="check"><NIcon name="check" :size="30" color="#042b16" :stroke-width="2.5" /></div>
              <h3>Demande envoyée !</h3>
              <p>Merci — nous vous répondons sous 24 h.</p>
              <NButton variant="ghost" @click="reset">Nouvelle demande</NButton>
            </div>
            <template v-else>
              <NEyebrow style="margin-bottom: 20px;">Demander un devis</NEyebrow>
              <div class="two" :class="{ 'is-mobile': isMobile }">
                <NField v-model="name" label="Nom complet" placeholder="Votre nom" />
                <NField v-model="email" label="E-mail" placeholder="vous@marque.tg" />
              </div>
              <div class="block">
                <label class="field-label">Type de service</label>
                <div class="svc-pills">
                  <NPill v-for="s in SERVICES_OPTS" :key="s" :active="sel === s" @click="sel = s">{{ s }}</NPill>
                </div>
              </div>
              <div class="block">
                <label class="field-label">Votre projet</label>
                <textarea
                  v-model="message"
                  rows="4"
                  placeholder="Décrivez votre besoin, vos délais, votre budget…"
                  class="nova-textarea"
                />
              </div>
              <NButton variant="accent" size="lg" icon="arrow-right" block style="margin-top: 22px;" @click="submit">
                Envoyer ma demande
              </NButton>
            </template>
          </div>
        </div>
      </NContainer>
    </section>
  </div>
</template>

<style scoped>
.sec { padding: 64px 0 96px; background: var(--nova-paper); }
.grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 56px; align-items: start; }
.grid.is-mobile { grid-template-columns: 1fr; gap: 40px; }

.rows { display: flex; flex-direction: column; gap: 18px; margin-top: 28px; }
.crow { display: flex; align-items: center; gap: 14px; }
.c-ic { width: 44px; height: 44px; border-radius: var(--r-md); background: var(--nova-fog); display: grid; place-items: center; flex: none; }
.c-label { font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-3); font-weight: 600; }
.c-value { font-size: 15px; color: var(--fg-1); font-weight: 500; }
.socials { margin-top: 32px; display: flex; gap: 12px; }
.social { width: 42px; height: 42px; border-radius: var(--r-md); background: var(--nova-navy); display: grid; place-items: center; cursor: pointer; }

.form-card {
  background: #fff;
  border: 1px solid var(--border-1);
  border-radius: var(--r-xl);
  padding: 38px;
  box-shadow: var(--shadow-md);
}
.form-card.is-mobile { padding: 24px; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.two.is-mobile { grid-template-columns: 1fr; }
.block { margin-top: 16px; }
.field-label { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-2); }
.svc-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.nova-textarea {
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
  resize: vertical;
  transition: border-color var(--dur), box-shadow var(--dur), background var(--dur);
}
.nova-textarea:focus { border-color: var(--nova-lime); box-shadow: 0 0 0 3px rgba(12, 242, 93, 0.18); background: #fff; }

.success { text-align: center; padding: 40px 0; }
.check { width: 64px; height: 64px; border-radius: 50%; background: var(--nova-lime); display: grid; place-items: center; margin: 0 auto 22px; }
.success h3 { font-family: var(--font-display); font-size: 28px; font-weight: 600; margin: 0 0 8px; color: var(--fg-1); }
.success p { font-size: 15px; color: var(--fg-2); margin: 0 0 24px; }

@media (max-width: 759px) { .sec { padding: 44px 0 64px; } }
</style>
