<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, type Section } from '@/lib/api'
import { isBuiltInSectionType } from '@/composables/useSiteContent'
import { getTemplate, templateUses, type FieldKey } from '@/lib/templates'
import NIcon from '@/components/base/NIcon.vue'
import NButton from '@/components/base/NButton.vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import IconPicker from '@/components/dashboard/IconPicker.vue'
import ImageField from '@/components/dashboard/ImageField.vue'
import TemplatePickerModal from '@/components/dashboard/TemplatePickerModal.vue'
import CmsContentSection from '@/components/sections/CmsContentSection.vue'

const inputClass =
  'w-full box-border font-sans text-fg-1 bg-nova-paper border border-line-strong rounded-sm px-3.5 py-3 outline-none mt-2 transition-[border-color,box-shadow,background] duration-nova focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)] focus:bg-nova-surface'
const labelClass = 'block text-[11px] font-semibold tracking-wider uppercase text-fg-2 mt-4'

const sections = ref<Section[]>([])
const editingId = ref<number | null>(null)
const loading = ref(true)
const error = ref('')
const saveState = ref<'idle' | 'saving' | 'saved'>('saved')
const flash = ref('')
const showTemplates = ref(false)

const cur = computed(() => sections.value.find((s) => s.id === editingId.value) ?? null)
const curIsBuiltIn = computed(() => (cur.value ? isBuiltInSectionType(cur.value.type) : false))
const curTemplate = computed(() => getTemplate(cur.value?.template || 'text'))
const curItems = computed<any[]>(() => {
  const d = cur.value?.data as any
  return d && Array.isArray(d.items) ? d.items : []
})

function uses(field: FieldKey): boolean {
  return !!cur.value && !curIsBuiltIn.value && templateUses(cur.value.template || 'text', field)
}
function ensureData() {
  if (!cur.value) return
  if (!cur.value.data || typeof cur.value.data !== 'object') cur.value.data = {}
}

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
function onEdit() {
  saveState.value = 'saving'
  clearTimeout(saveTimer)
  saveTimer = setTimeout(saveCurrent, 600)
}
async function saveCurrent() {
  const s = cur.value
  if (!s) return
  try {
    await api.put(`/admin/sections/${s.id}`, {
      type: s.type,
      template: s.template,
      title: s.title,
      body: s.body,
      icon: s.icon,
      image: s.image,
      data: s.data,
      visible: s.visible,
    })
    saveState.value = 'saved'
  } catch {
    saveState.value = 'idle'
    error.value = 'Échec de l’enregistrement.'
  }
}

async function toggleVisible(s: Section) {
  s.visible = s.visible ? 0 : 1
  try {
    await api.put(`/admin/sections/${s.id}`, { visible: s.visible })
  } catch {
    s.visible = s.visible ? 0 : 1
  }
}

async function pickTemplate(key: string) {
  showTemplates.value = false
  const t = getTemplate(key)
  try {
    const data = await api.post<{ section: Section }>('/admin/sections', {
      page: 'home',
      type: t.defaults.type,
      template: t.key,
      title: t.defaults.title,
      body: t.defaults.body,
      icon: t.defaults.icon || '',
      image: t.defaults.image || '',
      data: t.defaults.data || {},
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

/* items (cards / gallery) */
function addItem() {
  if (!cur.value) return
  ensureData()
  if (!Array.isArray(cur.value.data.items)) cur.value.data.items = []
  cur.value.data.items.push(
    curTemplate.value.itemShape === 'image'
      ? { image: '', caption: '' }
      : { icon: 'sparkles', title: 'Nouvel élément', desc: '' },
  )
  onEdit()
}
function removeItem(i: number) {
  cur.value?.data.items.splice(i, 1)
  onEdit()
}

/* drag reorder */
const dragIndex = ref<number | null>(null)
function onDragStart(i: number) {
  dragIndex.value = i
}
function onDragOver(i: number) {
  if (dragIndex.value === null || dragIndex.value === i) return
  const [moved] = sections.value.splice(dragIndex.value, 1)
  sections.value.splice(i, 0, moved)
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
</script>

<template>
  <TemplatePickerModal :open="showTemplates" @pick="pickTemplate" @close="showTemplates = false" />

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
    Ajoutez, modifiez et réorganisez les sections visibles par vos clients. Chaque modèle respecte le design du site.
  </p>

  <p v-if="error" class="text-err text-[13px] mb-4">{{ error }}</p>

  <div v-if="!loading" class="grid grid-cols-1 desk:grid-cols-[340px_1fr] gap-6 items-start">
    <!-- Sections list -->
    <div class="flex flex-col gap-2.5">
      <span class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">Sections ({{ sections.length }})</span>
      <div
        v-for="(s, i) in sections"
        :key="s.id"
        class="bg-nova-surface border rounded-md px-[15px] py-[13px] cursor-pointer transition-[border-color,box-shadow] duration-nova"
        :class="[editingId === s.id ? 'border-nova-teal shadow-nova-sm' : 'border-line', !s.visible && 'opacity-55']"
        draggable="true"
        @click="editingId = s.id"
        @dragstart="onDragStart(i)"
        @dragover.prevent="onDragOver(i)"
        @drop="onDrop"
        @dragend="onDrop"
      >
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-2 min-w-0">
            <NIcon name="grip-vertical" :size="15" color="#aeb9bc" />
            <span class="font-glyphic text-[10px] tracking-[0.14em] uppercase text-nova-teal font-semibold truncate">
              {{ isBuiltInSectionType(s.type) ? s.type : s.type || 'Personnalisée' }}
            </span>
            <span v-if="!isBuiltInSectionType(s.type)" class="text-[9px] text-fg-3 uppercase tracking-wider shrink-0">
              · {{ getTemplate(s.template).label }}
            </span>
          </span>
          <span class="flex gap-1 shrink-0">
            <button class="bg-transparent border-0 cursor-pointer p-0.5 grid place-items-center rounded hover:bg-nova-fog" title="Visibilité" @click.stop="toggleVisible(s)">
              <NIcon :name="s.visible ? 'eye' : 'eye-off'" :size="15" color="#6b7d83" />
            </button>
            <button v-if="!isBuiltInSectionType(s.type)" class="bg-transparent border-0 cursor-pointer p-0.5 grid place-items-center rounded hover:bg-nova-fog" title="Supprimer" @click.stop="removeSection(s)">
              <NIcon name="trash-2" :size="14" color="#6b7d83" />
            </button>
          </span>
        </div>
        <div class="text-[13.5px] font-semibold text-fg-1 mt-1.5 truncate">{{ s.title }}</div>
      </div>
      <button
        class="flex items-center justify-center gap-2 p-[13px] rounded-md border-[1.5px] border-dashed border-line-strong bg-transparent cursor-pointer text-nova-teal font-sans text-[13px] font-semibold hover:border-nova-teal"
        @click="showTemplates = true"
      >
        <NIcon name="plus" :size="16" /> Ajouter une section
      </button>
    </div>

    <!-- Editor + preview -->
    <div v-if="cur" class="flex flex-col gap-5">
      <div class="bg-nova-surface border border-line rounded-lg p-[26px] shadow-nova-xs">
        <div class="flex justify-between items-center mb-1">
          <span class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">Éditer la section</span>
          <span class="flex items-center gap-1.5 text-[11px]" :class="saveState === 'saving' ? 'text-warn' : 'text-ok'">
            <span class="w-[7px] h-[7px] rounded-full bg-current" />
            {{ saveState === 'saving' ? 'Enregistrement…' : 'Enregistré' }}
          </span>
        </div>

        <template v-if="curIsBuiltIn">
          <p class="mt-3 mb-0 text-[13px] text-fg-3 leading-relaxed">
            Bloc intégré à la page d'accueil (<b class="text-fg-2">{{ cur.type }}</b>). Vous pouvez en modifier le titre et le texte ; le design est géré par le site.
          </p>
        </template>
        <template v-else>
          <label class="block text-[11px] font-semibold tracking-wider uppercase text-fg-2 mt-1">Modèle : {{ curTemplate.label }}</label>
        </template>

        <!-- eyebrow / type -->
        <template v-if="uses('eyebrow')">
          <label :class="labelClass">Intitulé (au-dessus du titre)</label>
          <input v-model="cur.type" :class="inputClass" placeholder="Ex. Nos services" @input="onEdit" />
        </template>

        <!-- icon -->
        <template v-if="uses('icon')">
          <label :class="labelClass">Logo / icône</label>
          <div class="mt-2"><IconPicker v-model="cur.icon" @update:model-value="onEdit" /></div>
        </template>

        <!-- title -->
        <label :class="labelClass">Titre principal</label>
        <input v-model="cur.title" :class="[inputClass, 'font-display text-xl font-semibold']" @input="onEdit" />

        <!-- body -->
        <template v-if="!uses('items') || curTemplate.key === 'cards' || curTemplate.key === 'gallery'">
          <label :class="labelClass">{{ uses('items') ? 'Introduction' : 'Contenu' }}</label>
          <textarea v-model="cur.body" rows="3" :class="[inputClass, 'text-sm resize-y']" @input="onEdit" />
        </template>

        <!-- image -->
        <template v-if="uses('image')">
          <label :class="labelClass">Image</label>
          <div class="mt-2"><ImageField v-model="cur.image" :height="160" @update:model-value="onEdit" /></div>
        </template>

        <!-- button (cta) -->
        <template v-if="uses('button')">
          <label :class="labelClass">Texte du bouton</label>
          <input v-model="(cur.data as any).buttonLabel" :class="inputClass" placeholder="Demander un devis" @input="onEdit" />
          <label :class="labelClass">Lien du bouton</label>
          <input v-model="(cur.data as any).buttonLink" :class="inputClass" placeholder="/contact" @input="onEdit" />
        </template>

        <!-- items (cards / gallery) -->
        <template v-if="uses('items')">
          <label :class="labelClass">{{ curTemplate.itemShape === 'image' ? 'Images' : 'Éléments' }}</label>
          <div class="flex flex-col gap-3 mt-2">
            <div
              v-for="(it, i) in curItems"
              :key="i"
              class="border border-line rounded-md p-3 bg-nova-paper"
            >
              <div class="flex justify-between items-start gap-3">
                <!-- feature item -->
                <template v-if="curTemplate.itemShape !== 'image'">
                  <IconPicker v-model="it.icon" @update:model-value="onEdit" />
                  <div class="flex-1">
                    <input v-model="it.title" :class="[inputClass, '!mt-0 font-semibold']" placeholder="Titre" @input="onEdit" />
                    <input v-model="it.desc" :class="inputClass" placeholder="Description" @input="onEdit" />
                  </div>
                </template>
                <!-- image item -->
                <template v-else>
                  <div class="flex-1">
                    <ImageField v-model="it.image" :height="120" @update:model-value="onEdit" />
                    <input v-model="it.caption" :class="inputClass" placeholder="Légende (optionnel)" @input="onEdit" />
                  </div>
                </template>
                <button class="text-fg-3 hover:text-err p-1 shrink-0" title="Retirer" @click="removeItem(i)">
                  <NIcon name="trash-2" :size="15" />
                </button>
              </div>
            </div>
            <button
              class="flex items-center justify-center gap-2 p-2.5 rounded-md border border-dashed border-line-strong text-nova-teal text-[12px] font-semibold hover:border-nova-teal"
              @click="addItem"
            >
              <NIcon name="plus" :size="14" /> Ajouter {{ curTemplate.itemShape === 'image' ? 'une image' : 'un élément' }}
            </button>
          </div>
        </template>
      </div>

      <!-- live preview -->
      <div>
        <span class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">Aperçu en direct</span>
        <div class="mt-2.5 rounded-lg overflow-hidden border border-line">
          <!-- custom templated section: true WYSIWYG -->
          <CmsContentSection v-if="!curIsBuiltIn" :key="cur.id + cur.template" :section="cur" />
          <!-- built-in block: simplified preview -->
          <div v-else class="relative" :class="cur.template === 'hero' ? 'bg-nova-navy-900' : 'bg-nova-surface'">
            <img v-if="cur.template === 'hero'" src="/assets/compass-mark-white.png" alt="" class="absolute -right-10 -top-10 w-[200px] opacity-[0.08]" />
            <div class="p-10 px-[38px] relative">
              <NEyebrow :on-dark="cur.template === 'hero'">{{ cur.type }}</NEyebrow>
              <h2 class="font-display text-[34px] font-semibold tracking-tight my-3" :class="cur.template === 'hero' ? 'text-white' : 'text-fg-1'">{{ cur.title || 'Titre…' }}</h2>
              <p class="text-[15px] leading-relaxed m-0 max-w-[520px] whitespace-pre-line" :class="cur.template === 'hero' ? 'text-fg-on-dark-2' : 'text-fg-2'">{{ cur.body }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <p v-else class="text-fg-3">Chargement…</p>
</template>
