<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { api, type Section } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import { isBuiltInSectionType } from '@/composables/useSiteContent'
import NIcon from '@/components/base/NIcon.vue'
import NButton from '@/components/base/NButton.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'

const router = useRouter()
const { logout } = useAuth()

const DASH_NAV: [string, string][] = [
  ['layout-dashboard', "Vue d'ensemble"],
  ['file-text', 'Pages'],
  ['image', 'Portfolios'],
  ['pen-line', 'Blogs'],
  ['users', 'Partenaires'],
  ['tag', 'Tarifs'],
  ['settings', 'Réglages'],
]

const inputClass =
  'w-full box-border font-sans text-fg-1 bg-nova-paper border border-line-strong rounded-sm px-3.5 py-3 outline-none mt-2 transition-[border-color,box-shadow,background] duration-nova focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)] focus:bg-nova-surface'

const sections = ref<Section[]>([])
const editingId = ref<number | null>(null)
const loading = ref(true)
const error = ref('')
const saveState = ref<'idle' | 'saving' | 'saved'>('saved')
const flash = ref('')

const cur = computed(() => sections.value.find((s) => s.id === editingId.value) ?? null)
const curIsBuiltIn = computed(() => (cur.value ? isBuiltInSectionType(cur.value.type) : false))

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await api.get<{ sections: Section[] }>('/admin/sections?page=home')
    sections.value = data.sections
    editingId.value = data.sections[0]?.id ?? null
  } catch {
    error.value = 'Impossible de charger les sections.'
  } finally {
    loading.value = false
  }
}

let saveTimer: ReturnType<typeof setTimeout> | undefined
function scheduleSave() {
  saveState.value = 'saving'
  clearTimeout(saveTimer)
  saveTimer = setTimeout(saveCurrent, 600)
}

async function saveCurrent() {
  const s = cur.value
  if (!s) return
  try {
    await api.put(`/admin/sections/${s.id}`, { title: s.title, body: s.body, type: s.type, visible: s.visible })
    saveState.value = 'saved'
  } catch {
    saveState.value = 'idle'
    error.value = 'Échec de l’enregistrement.'
  }
}

function onEdit() {
  scheduleSave()
}

async function toggleVisible(s: Section) {
  s.visible = s.visible ? 0 : 1
  try {
    await api.put(`/admin/sections/${s.id}`, { visible: s.visible })
  } catch {
    s.visible = s.visible ? 0 : 1
  }
}

async function addSection() {
  try {
    const data = await api.post<{ section: Section }>('/admin/sections', {
      page: 'home',
      type: 'Nouvelle section',
      title: 'Nouveau titre',
      body: 'Votre contenu ici…',
    })
    sections.value.push(data.section)
    editingId.value = data.section.id
  } catch {
    error.value = 'Impossible d’ajouter la section.'
  }
}

async function removeSection(s: Section) {
  const idx = sections.value.findIndex((x) => x.id === s.id)
  sections.value = sections.value.filter((x) => x.id !== s.id)
  if (editingId.value === s.id) editingId.value = sections.value[Math.max(0, idx - 1)]?.id ?? null
  try {
    await api.del(`/admin/sections/${s.id}`)
  } catch {
    error.value = 'Suppression impossible.'
    load()
  }
}

const dragIndex = ref<number | null>(null)
function onDragStart(i: number) {
  dragIndex.value = i
}
function onDragOver(i: number) {
  if (dragIndex.value === null || dragIndex.value === i) return
  const arr = sections.value
  const [moved] = arr.splice(dragIndex.value, 1)
  arr.splice(i, 0, moved)
  dragIndex.value = i
}
async function onDrop() {
  dragIndex.value = null
  try {
    await api.put('/admin/sections/reorder', { ids: sections.value.map((s) => s.id) })
  } catch {
    error.value = 'Réorganisation non enregistrée.'
    load()
  }
}

async function publish() {
  await saveCurrent()
  try {
    await api.put('/admin/sections/reorder', { ids: sections.value.map((s) => s.id) })
  } catch { /* non-blocking */ }
  flash.value = 'Modifications publiées'
  setTimeout(() => (flash.value = ''), 2400)
}

function openPreview() {
  window.open('/', '_blank')
}
function signOut() {
  logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-nova-fog font-sans">
    <aside
      class="hidden min-[901px]:flex w-[248px] shrink-0 sticky top-0 h-screen box-border flex-col bg-nova-navy-900 text-white py-6 px-4"
    >
      <img src="/assets/logo-nova-mark-white.png" alt="Nova" class="w-[110px] mx-2 mb-7 mt-1.5" />
      <nav class="flex flex-col gap-1">
        <div
          v-for="([ic, label], i) in DASH_NAV"
          :key="label"
          class="flex items-center gap-[11px] px-3.5 py-[11px] rounded-sm cursor-pointer text-[13.5px] text-fg-on-dark-2 transition-[background,color] duration-nova"
          :class="i === 0 && 'bg-nova-lime/15 text-nova-lime font-semibold'"
        >
          <NIcon :name="ic" :size="17" />{{ label }}
        </div>
      </nav>
      <div class="mt-auto flex flex-col gap-2">
        <RouterLink
          to="/"
          class="flex items-center gap-2.5 px-3.5 py-[11px] rounded-sm cursor-pointer text-[13px] text-fg-on-dark-2 border border-white/15 no-underline hover:text-white hover:border-white/30"
        >
          <NIcon name="arrow-left" :size="16" /> Retour au site
        </RouterLink>
        <button
          class="flex items-center gap-2.5 px-3.5 py-[11px] rounded-sm cursor-pointer text-[13px] text-fg-on-dark-2 border border-white/15 bg-transparent font-sans w-full text-left hover:text-white hover:border-white/30"
          @click="signOut"
        >
          <NIcon name="log-out" :size="16" /> Déconnexion
        </button>
      </div>
    </aside>

    <main class="flex-1 p-7 px-9 overflow-auto">
      <div class="flex justify-between items-center mb-1.5 gap-4">
        <div>
          <NEyebrow>Tableau de bord</NEyebrow>
          <h1 class="font-display text-[32px] font-semibold mt-1.5 mb-0 text-fg-1">Page d'accueil</h1>
        </div>
        <div class="flex gap-2.5 items-center">
          <transition
            enter-active-class="transition-opacity duration-nova"
            enter-from-class="opacity-0"
            leave-active-class="transition-opacity duration-nova"
            leave-to-class="opacity-0"
          >
            <span v-if="flash" class="inline-flex items-center gap-1.5 text-xs text-ok font-semibold">
              <NIcon name="check" :size="14" /> {{ flash }}
            </span>
          </transition>
          <NButton variant="ghost" size="sm" icon="eye" @click="openPreview">Aperçu</NButton>
          <NButton variant="accent" size="sm" icon="check" @click="publish">Publier</NButton>
        </div>
      </div>
      <p class="text-[13.5px] text-fg-3 my-1 mb-[26px]">
        Ajoutez, modifiez et réorganisez les titres et sections visibles par vos clients.
      </p>

      <p v-if="error" class="text-err text-[13px] mb-4">{{ error }}</p>

      <div v-if="!loading" class="grid grid-cols-1 min-[901px]:grid-cols-[320px_1fr] gap-6 items-start">
        <div class="flex flex-col gap-2.5">
          <div class="flex justify-between items-center">
            <span class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">
              Sections ({{ sections.length }})
            </span>
          </div>
          <div
            v-for="(s, i) in sections"
            :key="s.id"
            class="bg-nova-surface border rounded-md px-[15px] py-[13px] cursor-pointer transition-[border-color,box-shadow] duration-nova"
            :class="[
              editingId === s.id ? 'border-nova-teal shadow-nova-sm' : 'border-line',
              !s.visible && 'opacity-55',
            ]"
            draggable="true"
            @click="editingId = s.id"
            @dragstart="onDragStart(i)"
            @dragover.prevent="onDragOver(i)"
            @drop="onDrop"
            @dragend="onDrop"
          >
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2">
                <NIcon name="grip-vertical" :size="15" color="#aeb9bc" />
                <span class="font-glyphic text-[10px] tracking-[0.14em] uppercase text-nova-teal font-semibold truncate max-w-[140px]">
                  {{ isBuiltInSectionType(s.type) ? s.type : (s.type || 'Personnalisée') }}
                </span>
              </span>
              <span class="flex gap-1">
                <button class="bg-transparent border-0 cursor-pointer p-0.5 grid place-items-center rounded hover:bg-nova-fog" title="Visibilité" @click.stop="toggleVisible(s)">
                  <NIcon :name="s.visible ? 'eye' : 'eye-off'" :size="15" color="#6b7d83" />
                </button>
                <button class="bg-transparent border-0 cursor-pointer p-0.5 grid place-items-center rounded hover:bg-nova-fog" title="Supprimer" @click.stop="removeSection(s)">
                  <NIcon name="trash-2" :size="14" color="#6b7d83" />
                </button>
              </span>
            </div>
            <div class="text-[13.5px] font-semibold text-fg-1 mt-1.5 truncate">{{ s.title }}</div>
          </div>
          <button
            class="flex items-center justify-center gap-2 p-[13px] rounded-md border-[1.5px] border-dashed border-line-strong bg-transparent cursor-pointer text-nova-teal font-sans text-[13px] font-semibold hover:border-nova-teal"
            @click="addSection"
          >
            <NIcon name="plus" :size="16" /> Ajouter une section
          </button>
        </div>

        <div v-if="cur" class="flex flex-col gap-5">
          <div class="bg-nova-surface border border-line rounded-lg p-[26px] shadow-nova-xs">
            <div class="flex justify-between items-center mb-[18px]">
              <span class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">Éditer la section</span>
              <span
                class="flex items-center gap-1.5 text-[11px]"
                :class="saveState === 'saving' ? 'text-warn' : 'text-ok'"
              >
                <span class="w-[7px] h-[7px] rounded-full bg-current" />
                {{ saveState === 'saving' ? 'Enregistrement…' : 'Enregistré' }}
              </span>
            </div>
            <template v-if="curIsBuiltIn">
              <label class="block text-[11px] font-semibold tracking-wider uppercase text-fg-2">Bloc de page</label>
              <p class="mt-2 mb-0 text-sm text-fg-2 font-semibold">{{ cur.type }}</p>
              <p class="mt-1.5 mb-0 text-xs text-fg-3 leading-relaxed">
                Section intégrée à la mise en page d’accueil (hero, services, portfolios ou équipe).
              </p>
            </template>
            <template v-else>
              <label class="block text-[11px] font-semibold tracking-wider uppercase text-fg-2">Libellé de section</label>
              <input
                v-model="cur.type"
                :class="inputClass"
                placeholder="Ex. À propos, Témoignages…"
                @input="onEdit"
              />
              <p class="mt-1.5 mb-0 text-xs text-fg-3 leading-relaxed">
                Petit titre affiché au-dessus du contenu sur le site (en vert sarcelle).
              </p>
            </template>
            <label class="block text-[11px] font-semibold tracking-wider uppercase text-fg-2 mt-4">Titre principal</label>
            <input v-model="cur.title" :class="[inputClass, 'font-display text-xl font-semibold']" @input="onEdit" />
            <label class="block text-[11px] font-semibold tracking-wider uppercase text-fg-2 mt-4">Contenu</label>
            <textarea v-model="cur.body" rows="5" :class="[inputClass, 'text-sm resize-y']" @input="onEdit" />
          </div>

          <div>
            <span class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">Aperçu en direct</span>
            <div
              class="mt-2.5 rounded-lg overflow-hidden border border-line relative"
              :class="cur.type === 'Hero' ? 'bg-nova-navy-900' : 'bg-nova-surface'"
            >
              <img
                v-if="cur.type === 'Hero'"
                src="/assets/compass-mark-white.png"
                alt=""
                class="absolute -right-10 -top-10 w-[200px] opacity-[0.08]"
              />
              <div class="p-10 px-[38px] relative">
                <NEyebrow :on-dark="cur.type === 'Hero'">
                  {{ curIsBuiltIn ? cur.type : cur.type || 'Libellé…' }}
                </NEyebrow>
                <h2
                  class="font-display text-[34px] font-semibold tracking-tight my-3"
                  :class="cur.type === 'Hero' ? 'text-white' : 'text-fg-1'"
                >{{ cur.title || 'Titre…' }}</h2>
                <p
                  class="text-[15px] leading-relaxed m-0 max-w-[520px] whitespace-pre-line"
                  :class="cur.type === 'Hero' ? 'text-fg-on-dark-2' : 'text-fg-2'"
                >{{ cur.body || 'Contenu…' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-fg-3">Chargement…</p>
    </main>
  </div>
</template>
