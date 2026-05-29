<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { api, type Section } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
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

const sections = ref<Section[]>([])
const editingId = ref<number | null>(null)
const loading = ref(true)
const error = ref('')
const saveState = ref<'idle' | 'saving' | 'saved'>('saved')
const flash = ref('')

const cur = computed(() => sections.value.find((s) => s.id === editingId.value) ?? null)

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
      type: 'Texte',
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

/* --- drag-and-drop reorder --- */
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
  <div class="dash">
    <!-- Sidebar -->
    <aside class="sidebar">
      <img src="/assets/logo-nova-mark-white.png" alt="Nova" class="logo" />
      <nav class="snav">
        <div v-for="([ic, label], i) in DASH_NAV" :key="label" class="snav-item" :class="{ active: i === 0 }">
          <NIcon :name="ic" :size="17" />{{ label }}
        </div>
      </nav>
      <div class="sidebar-foot">
        <RouterLink to="/" class="foot-link"><NIcon name="arrow-left" :size="16" /> Retour au site</RouterLink>
        <button class="foot-link as-btn" @click="signOut"><NIcon name="log-out" :size="16" /> Déconnexion</button>
      </div>
    </aside>

    <!-- Main -->
    <main class="main">
      <div class="topbar">
        <div>
          <NEyebrow>Tableau de bord</NEyebrow>
          <h1>Page d'accueil</h1>
        </div>
        <div class="top-actions">
          <transition name="fade"><span v-if="flash" class="flash"><NIcon name="check" :size="14" /> {{ flash }}</span></transition>
          <NButton variant="ghost" size="sm" icon="eye" @click="openPreview">Aperçu</NButton>
          <NButton variant="accent" size="sm" icon="check" @click="publish">Publier</NButton>
        </div>
      </div>
      <p class="subtitle">Ajoutez, modifiez et réorganisez les titres et sections visibles par vos clients.</p>

      <p v-if="error" class="err">{{ error }}</p>

      <div v-if="!loading" class="grid">
        <!-- Sections list -->
        <div class="list">
          <div class="list-head">
            <span class="list-title">Sections ({{ sections.length }})</span>
          </div>
          <div
            v-for="(s, i) in sections"
            :key="s.id"
            class="sect-card"
            :class="{ selected: editingId === s.id, hidden: !s.visible }"
            draggable="true"
            @click="editingId = s.id"
            @dragstart="onDragStart(i)"
            @dragover.prevent="onDragOver(i)"
            @drop="onDrop"
            @dragend="onDrop"
          >
            <div class="sect-top">
              <span class="sect-type">
                <NIcon name="grip-vertical" :size="15" color="var(--nova-mist)" />
                <span class="type-label">{{ s.type }}</span>
              </span>
              <span class="sect-tools">
                <button class="icon-btn" title="Visibilité" @click.stop="toggleVisible(s)">
                  <NIcon :name="s.visible ? 'eye' : 'eye-off'" :size="15" color="var(--fg-3)" />
                </button>
                <button class="icon-btn" title="Supprimer" @click.stop="removeSection(s)">
                  <NIcon name="trash-2" :size="14" color="var(--fg-3)" />
                </button>
              </span>
            </div>
            <div class="sect-title">{{ s.title }}</div>
          </div>
          <button class="add-btn" @click="addSection"><NIcon name="plus" :size="16" /> Ajouter une section</button>
        </div>

        <!-- Editor + preview -->
        <div v-if="cur" class="editor-col">
          <div class="editor-card">
            <div class="editor-head">
              <span class="editor-label">Éditer la section</span>
              <span class="save-ind" :class="saveState">
                <span class="dot" /> {{ saveState === 'saving' ? 'Enregistrement…' : 'Enregistré' }}
              </span>
            </div>
            <label class="fl">Titre</label>
            <input v-model="cur.title" class="title-input" @input="onEdit" />
            <label class="fl" style="margin-top: 16px;">Contenu</label>
            <textarea v-model="cur.body" rows="3" class="body-input" @input="onEdit" />
          </div>

          <div class="preview-wrap">
            <span class="preview-label">Aperçu en direct</span>
            <div class="preview" :class="{ hero: cur.type === 'Hero' }">
              <img v-if="cur.type === 'Hero'" src="/assets/compass-mark-white.png" alt="" class="pmark" />
              <div class="preview-inner">
                <NEyebrow :on-dark="cur.type === 'Hero'">{{ cur.type }}</NEyebrow>
                <h2 :class="{ ondark: cur.type === 'Hero' }">{{ cur.title || 'Titre…' }}</h2>
                <p :class="{ ondark: cur.type === 'Hero' }">{{ cur.body }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="loading">Chargement…</p>
    </main>
  </div>
</template>

<style scoped>
.dash { display: flex; min-height: 100vh; background: var(--nova-fog); font-family: var(--font-sans); }

/* Sidebar */
.sidebar {
  width: 248px;
  background: var(--nova-navy-900);
  color: #fff;
  padding: 24px 16px;
  flex: none;
  position: sticky;
  top: 0;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.logo { width: 110px; margin: 6px 8px 28px; }
.snav { display: flex; flex-direction: column; gap: 4px; }
.snav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 14px;
  border-radius: var(--r-sm);
  cursor: pointer;
  font-size: 13.5px;
  color: var(--fg-on-dark-2);
  transition: background var(--dur), color var(--dur);
}
.snav-item:hover { background: rgba(255, 255, 255, 0.05); }
.snav-item.active { background: rgba(12, 242, 93, 0.14); color: var(--nova-lime); font-weight: 600; }
.sidebar-foot { margin-top: auto; display: flex; flex-direction: column; gap: 8px; }
.foot-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: var(--r-sm);
  cursor: pointer;
  font-size: 13px;
  color: var(--fg-on-dark-2);
  border: 1px solid rgba(255, 255, 255, 0.14);
  text-decoration: none;
  background: transparent;
  font-family: var(--font-sans);
  width: 100%;
  box-sizing: border-box;
}
.foot-link:hover { color: #fff; border-color: rgba(255, 255, 255, 0.32); }
.as-btn { text-align: left; }

/* Main */
.main { flex: 1; padding: 28px 36px; overflow: auto; }
.topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 16px; }
.topbar h1 { font-family: var(--font-display); font-size: 32px; font-weight: 600; margin: 6px 0 0; color: var(--fg-1); }
.top-actions { display: flex; gap: 10px; align-items: center; }
.flash { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ok); font-weight: 600; }
.subtitle { font-size: 13.5px; color: var(--fg-3); margin: 4px 0 26px; }
.err { color: var(--err); font-size: 13px; margin: 0 0 16px; }
.loading { color: var(--fg-3); }

.grid { display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: start; }

/* Sections list */
.list { display: flex; flex-direction: column; gap: 10px; }
.list-head { display: flex; justify-content: space-between; align-items: center; }
.list-title { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-2); }
.sect-card {
  background: #fff;
  border: 1px solid var(--border-1);
  border-radius: var(--r-md);
  padding: 13px 15px;
  cursor: pointer;
  transition: border-color var(--dur), box-shadow var(--dur);
}
.sect-card.selected { border-color: var(--nova-teal); box-shadow: var(--shadow-sm); }
.sect-card.hidden { opacity: 0.55; }
.sect-top { display: flex; align-items: center; justify-content: space-between; }
.sect-type { display: flex; align-items: center; gap: 8px; }
.type-label {
  font-family: var(--font-glyphic);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--nova-teal);
  font-weight: 600;
}
.sect-tools { display: flex; gap: 4px; }
.icon-btn { background: transparent; border: none; cursor: pointer; padding: 2px; display: grid; place-items: center; border-radius: 4px; }
.icon-btn:hover { background: var(--nova-fog); }
.sect-title { font-size: 13.5px; font-weight: 600; color: var(--fg-1); margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px;
  border-radius: var(--r-md);
  border: 1.5px dashed var(--border-2);
  background: transparent;
  cursor: pointer;
  color: var(--nova-teal);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
}
.add-btn:hover { border-color: var(--nova-teal); }

/* Editor */
.editor-col { display: flex; flex-direction: column; gap: 20px; }
.editor-card { background: #fff; border: 1px solid var(--border-1); border-radius: var(--r-lg); padding: 26px; box-shadow: var(--shadow-xs); }
.editor-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.editor-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-2); }
.save-ind { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--ok); }
.save-ind.saving { color: var(--warn); }
.save-ind .dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.fl { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-2); }
.title-input,
.body-input {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-sans);
  color: var(--fg-1);
  background: var(--nova-paper);
  border: 1px solid var(--border-2);
  border-radius: var(--r-sm);
  padding: 12px 14px;
  outline: none;
  margin-top: 8px;
  transition: border-color var(--dur), box-shadow var(--dur), background var(--dur);
}
.title-input { font-family: var(--font-display); font-size: 20px; font-weight: 600; }
.body-input { font-size: 14px; resize: vertical; }
.title-input:focus,
.body-input:focus { border-color: var(--nova-lime); box-shadow: 0 0 0 3px rgba(12, 242, 93, 0.18); background: #fff; }

/* Live preview */
.preview-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-2); }
.preview { margin-top: 10px; border-radius: var(--r-lg); overflow: hidden; border: 1px solid var(--border-1); background: #fff; position: relative; }
.preview.hero { background: var(--nova-navy-900); }
.pmark { position: absolute; right: -40px; top: -40px; width: 200px; opacity: 0.08; }
.preview-inner { padding: 40px 38px; position: relative; }
.preview-inner h2 { font-family: var(--font-display); font-size: 34px; font-weight: 600; letter-spacing: -0.02em; margin: 12px 0 10px; color: var(--fg-1); }
.preview-inner h2.ondark { color: #fff; }
.preview-inner p { font-size: 15px; line-height: 1.6; margin: 0; max-width: 520px; color: var(--fg-2); }
.preview-inner p.ondark { color: var(--fg-on-dark-2); }

.fade-enter-active, .fade-leave-active { transition: opacity var(--dur); }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .grid { grid-template-columns: 1fr; }
  .sidebar { display: none; }
}
</style>
