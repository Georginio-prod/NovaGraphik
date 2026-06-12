<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { api } from '@/lib/api'
import { createOrder } from '@/composables/useOrders'
import { promoUrl } from '@/lib/site'
import type { Promotion, PromoCode } from '@/lib/api'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NIcon from '@/components/base/NIcon.vue'
import NButton from '@/components/base/NButton.vue'
import NField from '@/components/base/NField.vue'
import NPlaceholder from '@/components/base/NPlaceholder.vue'
import NQrCode from '@/components/base/NQrCode.vue'
import PhoneInput from '@/components/base/PhoneInput.vue'
import CtaBand from '@/components/sections/CtaBand.vue'

const route = useRoute()
const promo = ref<Promotion | null>(null)
const loading = ref(true)
const notFound = ref(false)

const codes = computed<PromoCode[]>(() => (promo.value?.codes || []).filter((c) => c.code))
// QR code: the explicit target if set, otherwise this promotion's page on the
// live site so a scan always lands somewhere useful.
const qrValue = computed(() => promo.value?.qr_target?.trim() || (promo.value ? promoUrl(promo.value.slug) : ''))

async function load(opts?: { silent?: boolean }) {
  const silent = opts?.silent ?? false
  if (!silent) {
    loading.value = true
    notFound.value = false
  }
  try {
    const slug = String(route.params.slug)
    const data = await api.get<{ item: Promotion }>(`/promotions/${slug}`)
    promo.value = data.item
    selectedCode.value = (data.item.codes || []).find((c) => c.code)?.code || ''
  } catch {
    if (!silent) notFound.value = true
  } finally {
    if (!silent) loading.value = false
  }
}

function onVisible() {
  if (document.visibilityState === 'visible' && promo.value) void load({ silent: true })
}
onMounted(() => {
  void load()
  document.addEventListener('visibilitychange', onVisible)
})
onBeforeUnmount(() => document.removeEventListener('visibilitychange', onVisible))
watch(() => route.params.slug, () => load())

// ── Order form ──────────────────────────────────────────────────────────────
const selectedCode = ref('')
const name = ref('')
const email = ref('')
const phone = ref('')
const message = ref('')
const errors = ref<{ name?: string; email?: string; phone?: string }>({})
const sending = ref(false)
const sent = ref(false)
const sendError = ref('')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const currentOffer = computed<PromoCode | undefined>(() => codes.value.find((c) => c.code === selectedCode.value))

function copyCode(code: string) {
  navigator.clipboard?.writeText(code).catch(() => {})
}

function validate() {
  const next: typeof errors.value = {}
  if (!name.value.trim()) next.name = 'Indiquez votre nom.'
  const mail = email.value.trim()
  if (!mail) next.email = 'Indiquez votre e-mail.'
  else if (!EMAIL_RE.test(mail)) next.email = 'Adresse e-mail invalide.'
  if (!phone.value.trim()) next.phone = 'Indiquez votre téléphone.'
  errors.value = next
  return Object.keys(next).length === 0
}

async function submit() {
  if (!promo.value || sending.value) return
  if (!validate()) return
  sending.value = true
  sendError.value = ''
  try {
    await createOrder(
      {
        promotion_id: promo.value.id > 0 ? promo.value.id : null,
        promotion_title: promo.value.title,
        promo_code: selectedCode.value || '',
        offer_label: currentOffer.value?.label || '',
        customer_name: name.value.trim(),
        customer_email: email.value.trim(),
        customer_phone: phone.value.trim(),
        message: message.value.trim(),
      },
      promo.value.merchant_email || '',
    )
    sent.value = true
  } catch {
    sendError.value = "L'envoi a échoué. Réessayez dans un instant."
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="loading" class="py-32 text-center text-fg-3">Chargement…</div>

    <div v-else-if="notFound" class="py-32 text-center">
      <h1 class="font-display text-3xl font-semibold text-fg-1 mb-3">Promotion introuvable</h1>
      <RouterLink to="/promotions" class="text-nova-teal font-semibold">← Retour aux promotions</RouterLink>
    </div>

    <template v-else-if="promo">
      <!-- Hero -->
      <section class="bg-nova-navy-900 text-white">
        <NContainer>
          <div class="grid items-center gap-8 tab:gap-12 py-10 tab:py-16 grid-cols-1 desk:grid-cols-[1.1fr_1fr]">
            <div>
              <RouterLink to="/promotions" class="inline-flex items-center gap-1.5 text-fg-on-dark-2 text-[13px] hover:text-white mb-5">
                <NIcon name="arrow-left" :size="15" /> Toutes les promotions
              </RouterLink>
              <NEyebrow class="!text-nova-lime">{{ promo.category }}<template v-if="promo.merchant_name"> · {{ promo.merchant_name }}</template></NEyebrow>
              <h1 class="font-display text-[38px] tab:text-[48px] font-semibold leading-[1.05] tracking-tight mt-3 mb-4">{{ promo.title }}</h1>
              <p v-if="promo.subtitle" class="text-[17px] text-fg-on-dark-2 leading-relaxed m-0 max-w-[560px]">{{ promo.subtitle }}</p>
              <div v-if="promo.valid_until" class="inline-flex items-center gap-2 mt-6 rounded-full bg-white/10 px-4 py-2 text-[13px] text-white">
                <NIcon name="calendar" :size="15" /> Valable jusqu'au {{ promo.valid_until }}
              </div>
            </div>
            <div class="rounded-xl overflow-hidden shadow-nova-lg">
              <NPlaceholder :idx="0" :height="360" radius="rounded-none" :src="promo.image || undefined" label="Promotion" />
            </div>
          </div>
        </NContainer>
      </section>

      <section class="py-12 tab:py-16 bg-nova-paper">
        <NContainer>
          <div class="grid gap-10 tab:gap-14 grid-cols-1 desk:grid-cols-[1.2fr_1fr] items-start">
            <!-- Left: details + codes -->
            <div>
              <template v-if="promo.details">
                <NEyebrow>La promotion</NEyebrow>
                <p class="text-[15.5px] leading-relaxed text-fg-2 mt-3 whitespace-pre-line">{{ promo.details }}</p>
              </template>

              <div v-if="codes.length" class="mt-9">
                <NEyebrow>Codes promo Nova</NEyebrow>
                <p class="text-[13.5px] text-fg-3 mt-1.5 mb-4">Chaque code commence par <strong class="text-nova-teal">NOVA</strong> — il atteste que l'offre vous est proposée par Nova Graphik.</p>
                <div class="grid gap-3 grid-cols-1 tab:grid-cols-2">
                  <div
                    v-for="c in codes"
                    :key="c.code"
                    class="rounded-lg border p-4 transition-[border-color,box-shadow] duration-nova cursor-pointer"
                    :class="selectedCode === c.code ? 'border-nova-teal shadow-nova-sm bg-nova-surface' : 'border-line bg-nova-surface hover:border-nova-teal/60'"
                    @click="selectedCode = c.code"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <span class="font-mono font-semibold tracking-wide text-nova-teal text-[15px]">{{ c.code }}</span>
                      <span v-if="c.discount" class="rounded-full bg-nova-lime/20 text-nova-green text-[12px] font-bold px-2.5 py-0.5">{{ c.discount }}</span>
                    </div>
                    <div v-if="c.label" class="font-semibold text-fg-1 text-[14.5px] mt-2">{{ c.label }}</div>
                    <p v-if="c.description" class="text-[12.5px] text-fg-3 leading-snug m-0 mt-1">{{ c.description }}</p>
                    <button type="button" class="mt-2.5 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-nova-teal hover:underline" @click.stop="copyCode(c.code)">
                      <NIcon name="copy" :size="13" /> Copier le code
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="qrValue" class="mt-9 flex items-center gap-5">
                <NQrCode :value="qrValue" :size="120" />
                <div>
                  <NEyebrow>Scannez</NEyebrow>
                  <p class="text-[13px] text-fg-3 mt-1.5 m-0 max-w-[240px]">Accédez directement à cette offre sur novagraphikvisu.com depuis votre téléphone.</p>
                </div>
              </div>

              <div v-if="promo.conditions" class="mt-9 rounded-lg bg-nova-fog border border-line p-5">
                <div class="text-[11px] font-semibold tracking-wider uppercase text-fg-3 mb-2">Conditions</div>
                <p class="text-[13px] text-fg-2 leading-relaxed m-0 whitespace-pre-line">{{ promo.conditions }}</p>
              </div>
            </div>

            <!-- Right: order form -->
            <div class="bg-nova-surface border border-line rounded-xl shadow-nova-md p-6 tab:p-8 desk:sticky desk:top-24">
              <div v-if="sent" class="text-center py-8">
                <div class="w-16 h-16 rounded-full bg-nova-lime grid place-items-center mx-auto mb-5">
                  <NIcon name="check" :size="30" color="#042b16" :stroke-width="2.5" />
                </div>
                <h3 class="font-display text-[26px] font-semibold m-0 mb-2 text-fg-1">Commande enregistrée !</h3>
                <p class="text-[14.5px] text-fg-2 m-0 mb-1">Votre code <strong class="text-nova-teal font-mono">{{ selectedCode }}</strong> est bien pris en compte.</p>
                <p class="text-[13px] text-fg-3 m-0">Vous recevez une confirmation par e-mail.</p>
              </div>
              <template v-else>
                <NEyebrow class="mb-1.5">Commander avec ce code</NEyebrow>
                <h3 class="font-display text-[24px] font-semibold m-0 mb-5 text-fg-1">Profiter de l'offre</h3>

                <div v-if="codes.length">
                  <label class="block text-[11px] font-semibold tracking-wider uppercase text-fg-2 mb-2">Offre choisie</label>
                  <select v-model="selectedCode" class="w-full box-border font-sans text-fg-1 bg-nova-paper border border-line-strong rounded-sm px-3.5 py-3 outline-none mb-4 focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)]">
                    <option v-for="c in codes" :key="c.code" :value="c.code">
                      {{ c.code }}{{ c.label ? ' — ' + c.label : '' }}
                    </option>
                  </select>
                </div>

                <div class="grid gap-4 grid-cols-1">
                  <NField v-model="name" label="Nom complet" placeholder="Votre nom" :error="errors.name" />
                  <NField v-model="email" type="email" label="E-mail" placeholder="vous@email.com" :error="errors.email" />
                  <PhoneInput v-model="phone" label="Téléphone" :error="errors.phone" />
                  <div>
                    <label class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">Message (optionnel)</label>
                    <textarea
                      v-model="message"
                      rows="3"
                      placeholder="Précisez votre demande, une date, une quantité…"
                      class="w-full box-border font-sans text-sm text-fg-1 bg-nova-paper border border-line-strong rounded-sm px-3.5 py-3 outline-none mt-2 resize-y focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)] focus:bg-nova-surface"
                    />
                  </div>
                </div>
                <NButton variant="accent" size="lg" icon="arrow-right" block class="mt-5" :disabled="sending" @click="submit">
                  {{ sending ? 'Envoi…' : 'Valider ma commande' }}
                </NButton>
                <p v-if="sendError" class="text-err text-[13px] mt-3 mb-0">{{ sendError }}</p>
                <p class="text-[11.5px] text-fg-3 mt-3 m-0 leading-snug">En validant, votre demande est transmise à Nova Graphik<template v-if="promo.merchant_name"> et à {{ promo.merchant_name }}</template>.</p>
              </template>
            </div>
          </div>
        </NContainer>
      </section>

      <CtaBand />
    </template>
  </div>
</template>
