<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettings } from '@/composables/useSettings'
import { supabase } from '@/lib/supabase'
import NContainer from '@/components/base/NContainer.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NPill from '@/components/base/NPill.vue'
import NField from '@/components/base/NField.vue'
import PhoneInput from '@/components/base/PhoneInput.vue'
import NIcon from '@/components/base/NIcon.vue'
import NSectionHeader from '@/components/base/NSectionHeader.vue'
import PageBanner from '@/components/sections/PageBanner.vue'

const { get, load } = useSettings()
onMounted(load)

const SERVICES_OPTS = ['Identité visuelle', 'Supports imprimés', 'Réseaux sociaux', 'Motion design', '3D / 2D', 'Photo / Reportage', 'Site web (UX/UI)', 'Autre']
const CONTACTS = computed<[string, string, string][]>(() => [
  ['mail', 'E-mail', get('contact_email', 'contact@novagraphikvisu.com')],
  ['phone', 'Téléphone', get('contact_phone', '+228 97 99 63 46')],
  ['map-pin', 'Localisation', get('contact_location', 'Lomé, Togo')],
])
const socials = computed<[string, string][]>(() =>
  (
    [
      ['instagram', get('social_instagram')],
      ['facebook', get('social_facebook')],
      ['youtube', get('social_youtube')],
      ['tiktok', get('social_tiktok')],
    ] as [string, string][]
  ).filter((s) => s[1]),
)

// Devis requests are emailed to contact@novagraphikvisu.com by the `send-quote`
// Supabase Edge Function, which builds a branded HTML email (Nova logo + a
// "Télécharger la pièce jointe" button) and sends it through Resend. The Resend
// key stays server-side. Any attached file is first uploaded to Supabase Storage
// and its download link is included in the email. If the function is ever
// unreachable, we fall back to FormSubmit so a request is never lost.
const DEVIS_INBOX = 'contact@novagraphikvisu.com'

const sel = ref<string[]>(['Identité visuelle'])
const sent = ref(false)
const sending = ref(false)
const sendError = ref('')
const file = ref<File | null>(null)
const fileError = ref('')
let resetTimer: ReturnType<typeof setTimeout>

function onFile(e: Event) {
  fileError.value = ''
  const f = (e.target as HTMLInputElement).files?.[0] ?? null
  if (f && f.size > 10 * 1024 * 1024) {
    fileError.value = 'Fichier trop volumineux (max 10 Mo).'
    file.value = null
    ;(e.target as HTMLInputElement).value = ''
    return
  }
  file.value = f
}

async function uploadFile(): Promise<{ url: string; name: string }> {
  const f = file.value
  if (!f) return { url: '', name: '' }
  const ext = f.name.includes('.') ? f.name.slice(f.name.lastIndexOf('.')) : ''
  const path = `devis/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
  const { error } = await supabase.storage
    .from('quote-files')
    .upload(path, f, { contentType: f.type || undefined })
  if (error) throw error
  return { url: supabase.storage.from('quote-files').getPublicUrl(path).data.publicUrl, name: f.name }
}

async function sendViaFunction(fileUrl: string, fileName: string) {
  const { data, error } = await supabase.functions.invoke('send-quote', {
    body: {
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      services: sel.value.join(', ') || '—',
      message: message.value.trim(),
      file_url: fileUrl,
      file_name: fileName,
    },
  })
  if (error || !(data as { ok?: boolean } | null)?.ok) throw error ?? new Error('send-quote failed')
}

async function sendViaFormSubmit(fileUrl: string) {
  const body: Record<string, string> = {
    Nom: name.value.trim(),
    Email: email.value.trim(),
    'Téléphone': phone.value.trim(),
    'Type de service': sel.value.join(', ') || '—',
    Message: message.value.trim(),
    _subject: `Nouvelle demande de devis — ${name.value.trim()}`,
    _template: 'table',
    _replyto: email.value.trim(),
  }
  if (fileUrl) body['Fichier joint'] = fileUrl
  const res = await fetch(`https://formsubmit.co/ajax/${DEVIS_INBOX}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`FormSubmit ${res.status}`)
}
function toggleService(s: string) {
  const i = sel.value.indexOf(s)
  if (i >= 0) sel.value.splice(i, 1)
  else sel.value.push(s)
}
const name = ref('')
const email = ref('')
const phone = ref('')
const message = ref('')
const errors = ref<{ name?: string; email?: string; phone?: string; message?: string }>({})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  const next: { name?: string; email?: string; phone?: string; message?: string } = {}
  if (!name.value.trim()) next.name = 'Indiquez votre nom.'
  const mail = email.value.trim()
  if (!mail) next.email = 'Indiquez votre e-mail.'
  else if (!EMAIL_RE.test(mail)) next.email = 'Adresse e-mail invalide.'
  if (!phone.value.trim()) next.phone = 'Indiquez votre numéro de téléphone.'
  if (!message.value.trim()) next.message = 'Décrivez votre projet.'
  errors.value = next
  return Object.keys(next).length === 0
}

async function submit() {
  if (!validate() || sending.value) return
  sending.value = true
  sendError.value = ''
  try {
    const { url, name: fname } = await uploadFile()
    try {
      await sendViaFunction(url, fname)
    } catch {
      // Edge function unreachable → don't lose the request.
      await sendViaFormSubmit(url)
    }
    sent.value = true
    // Re-show a fresh form automatically after a few seconds.
    clearTimeout(resetTimer)
    resetTimer = setTimeout(reset, 5000)
  } catch {
    sendError.value = `L'envoi a échoué. Réessayez, ou écrivez-nous directement à ${DEVIS_INBOX}.`
  } finally {
    sending.value = false
  }
}
function reset() {
  clearTimeout(resetTimer)
  sent.value = false
  sending.value = false
  sendError.value = ''
  name.value = ''
  email.value = ''
  phone.value = ''
  message.value = ''
  sel.value = ['Identité visuelle']
  file.value = null
  fileError.value = ''
  errors.value = {}
}
</script>

<template>
  <div>
    <PageBanner
      eyebrow="Contact · Devis"
      title="Parlons de votre projet"
      intro="Décrivez-nous votre besoin — nous revenons vers vous sous 24 h avec une proposition sur mesure."
    />
    <section class="py-11 tab:py-16 pb-16 tab:pb-24 bg-nova-paper">
      <NContainer>
        <div
          class="grid items-start gap-10 tab:gap-14 grid-cols-1 desk:grid-cols-[1fr_1.3fr]"
        >
          <div>
            <NSectionHeader eyebrow="Coordonnées" title="Nova Graphik" />
            <div class="flex flex-col gap-[18px] mt-7">
              <div v-for="c in CONTACTS" :key="c[1]" class="flex items-center gap-3.5">
                <div class="w-11 h-11 rounded-md bg-nova-fog grid place-items-center shrink-0">
                  <NIcon :name="c[0]" :size="18" color="#02735e" />
                </div>
                <div>
                  <div class="text-[11px] tracking-wider uppercase text-fg-3 font-semibold">{{ c[1] }}</div>
                  <div class="text-[15px] text-fg-1 font-medium">{{ c[2] }}</div>
                </div>
              </div>
            </div>
            <div class="mt-8 flex gap-3">
              <a
                v-for="[icon, href] in socials"
                :key="icon"
                :href="href"
                target="_blank"
                rel="noopener"
                class="w-[42px] h-[42px] rounded-md bg-nova-navy grid place-items-center cursor-pointer hover:bg-nova-navy-700 transition-colors duration-nova"
              >
                <NIcon :name="icon" :size="18" color="#fff" />
              </a>
            </div>
          </div>

          <div
            class="bg-nova-surface border border-line rounded-xl shadow-nova-md p-6 tab:p-8 desk:p-[38px]"
          >
            <div v-if="sent" class="text-center py-10">
              <div class="w-16 h-16 rounded-full bg-nova-lime grid place-items-center mx-auto mb-[22px]">
                <NIcon name="check" :size="30" color="#042b16" :stroke-width="2.5" />
              </div>
              <h3 class="font-display text-[28px] font-semibold m-0 mb-2 text-fg-1">Demande envoyée !</h3>
              <p class="text-[15px] text-fg-2 m-0 mb-6">Merci — nous vous répondons sous 24 h.</p>
              <NButton variant="ghost" @click="reset">Nouvelle demande</NButton>
            </div>
            <template v-else>
              <NEyebrow class="mb-5">Demander un devis</NEyebrow>
              <div class="grid gap-4 grid-cols-1 tab:grid-cols-2">
                <NField v-model="name" label="Nom complet" placeholder="Votre nom" :error="errors.name" />
                <NField v-model="email" type="email" label="E-mail" placeholder="vous@marque.tg" :error="errors.email" />
                <PhoneInput v-model="phone" label="Téléphone" :error="errors.phone" class="tab:col-span-2" />
              </div>
              <div class="mt-4">
                <label class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">Type de service <span class="font-normal text-fg-3 normal-case tracking-normal">(choix multiple)</span></label>
                <div class="flex flex-wrap gap-2 mt-2">
                  <NPill v-for="s in SERVICES_OPTS" :key="s" :active="sel.includes(s)" @click="toggleService(s)">{{ s }}</NPill>
                </div>
              </div>
              <div class="mt-4">
                <label class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">Votre projet</label>
                <textarea
                  v-model="message"
                  rows="4"
                  placeholder="Décrivez votre besoin, vos délais, votre budget…"
                  :aria-invalid="errors.message ? true : undefined"
                  class="w-full box-border font-sans text-sm text-fg-1 bg-nova-paper border rounded-sm px-3.5 py-3 outline-none mt-2 resize-y transition-[border-color,box-shadow,background] duration-nova focus:bg-nova-surface"
                  :class="
                    errors.message
                      ? 'border-err focus:border-err focus:shadow-[0_0_0_3px_rgba(192,57,43,0.15)]'
                      : 'border-line-strong focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)]'
                  "
                />
                <p v-if="errors.message" class="text-err text-[12px] mt-1.5 mb-0">{{ errors.message }}</p>
              </div>
              <div class="mt-4">
                <label class="block text-[11px] font-semibold tracking-wider uppercase text-fg-2">Pièce jointe <span class="font-normal text-fg-3 normal-case tracking-normal">(optionnel — brief, logo, doc… max 10 Mo)</span></label>
                <label class="mt-2 inline-flex max-w-full items-center gap-2.5 cursor-pointer border border-dashed border-line-strong rounded-sm px-3.5 py-2.5 text-[13px] text-fg-2 hover:border-nova-teal transition-colors duration-nova">
                  <NIcon name="plus" :size="16" color="#02735e" />
                  <span v-if="file" class="text-fg-1 font-medium truncate max-w-[240px]">{{ file.name }}</span>
                  <span v-else>Choisir un fichier…</span>
                  <input type="file" class="hidden" @change="onFile" />
                </label>
                <p v-if="fileError" class="text-err text-[12px] mt-1.5 mb-0">{{ fileError }}</p>
              </div>
              <NButton variant="accent" size="lg" icon="arrow-right" block class="mt-[22px]" :disabled="sending" @click="submit">
                {{ sending ? 'Envoi…' : 'Envoyer ma demande' }}
              </NButton>
              <p v-if="sendError" class="text-err text-[13px] mt-3 mb-0">{{ sendError }}</p>
            </template>
          </div>
        </div>
      </NContainer>
    </section>
  </div>
</template>
