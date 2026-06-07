<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, type PortfolioItem } from '@/lib/api'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NIcon from '@/components/base/NIcon.vue'
import { novaGrad } from '@/lib/gradients'
import ImageField from '@/components/dashboard/ImageField.vue'
import MediaField from '@/components/dashboard/MediaField.vue'

const inputClass =
  'w-full box-border font-sans text-fg-1 bg-nova-paper border border-line-strong rounded-sm px-3.5 py-3 outline-none mt-2 transition-[border-color,box-shadow,background] duration-nova focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)] focus:bg-nova-surface'
const labelClass = 'block text-[11px] font-semibold tracking-wider uppercase text-fg-2 mt-4'

const items = ref<PortfolioItem[]>([])
const editingId = ref<number | null>(null)
const loading = ref(true)
const error = ref('')
const saveState = ref<'idle' | 'saving' | 'saved'>('saved')

const cur = computed(() => items.value.find((i) => i.id === editingId.value) ?? null)
const knownCategories = computed(() => [...new Set(items.value.map((i) => i.category).filter(Boolean))])

onMounted(load)

async function load() {
  loading.value = true
  try {
    const d = await api.get<{ items: PortfolioItem[] }>('/admin/portfolio')
    items.value = d.items
    editingId.value = d.items[0]?.id ?? null
  } catch {
    error.value = 'Impossible de charger le portfolio.'
  } finally {
    loading.value = false
  }
}

let timer: ReturnType<typeof setTimeout> | undefined
function onEdit() {
  saveState.value = 'saving'
  clearTimeout(timer)
  timer = setTimeout(save, 600)
}
async function save() {
  const it = cur.value
  if (!it) return
  try {
    await api.put(`/admin/portfolio/${it.id}`, {
      title: it.title,
      category: it.category,
      description: it.description,
      cover_image: it.cover_image,
      images: (it.images || []).filter(Boolean),
      external_url: it.external_url || '',
      visible: it.visible,
    })
    saveState.value = 'saved'
  } catch {
    saveState.value = 'idle'
    error.value = 'Échec de l’enregistrement.'
  }
}
async function addItem() {
  try {
    const d = await api.post<{ item: PortfolioItem }>('/admin/portfolio', {
      title: 'Nouvelle réalisation',
      category: knownCategories.value[0] || 'Logo',
      description: '',
    })
    items.value.push(d.item)
    editingId.value = d.item.id
  } catch {
    error.value = 'Impossible d’ajouter la réalisation.'
  }
}
async function removeItem(it: PortfolioItem) {
  const idx = items.value.findIndex((x) => x.id === it.id)
  items.value = items.value.filter((x) => x.id !== it.id)
  if (editingId.value === it.id) editingId.value = items.value[Math.max(0, idx - 1)]?.id ?? null
  try {
    await api.del(`/admin/portfolio/${it.id}`)
  } catch {
    error.value = 'Suppression impossible.'
    load()
  }
}
async function toggleVisible(it: PortfolioItem) {
  it.visible = it.visible ? 0 : 1
  try {
    await api.put(`/admin/portfolio/${it.id}`, { visible: it.visible })
  } catch {
    it.visible = it.visible ? 0 : 1
  }
}
function addImage() {
  if (!cur.value) return
  if (!Array.isArray(cur.value.images)) cur.value.images = []
  cur.value.images.push('')
}
function setImage(i: number, url: string) {
  if (cur.value) {
    cur.value.images[i] = url
    onEdit()
  }
}
function removeImage(i: number) {
  cur.value?.images.splice(i, 1)
  onEdit()
}

const dragIndex = ref<number | null>(null)
function onDragStart(i: number) {
  dragIndex.value = i
}
function onDragOver(i: number) {
  if (dragIndex.value === null || dragIndex.value === i) return
  const [moved] = items.value.splice(dragIndex.value, 1)
  items.value.splice(i, 0, moved)
  dragIndex.value = i
}
async function onDrop() {
  dragIndex.value = null
  try {
    await api.put('/admin/portfolio/reorder', { ids: items.value.map((i) => i.id) })
  } catch {
    error.value = 'Réorganisation non enregistrée.'
    load()
  }
}
</script>

<template>
  <div class="flex justify-between items-center mb-1.5 gap-4">
    <div>
      <NEyebrow>Tableau de bord</NEyebrow>
      <h1 class="font-display text-[32px] font-semibold mt-1.5 mb-0 text-fg-1">Portfolios</h1>
    </div>
    <span class="flex items-center gap-1.5 text-[11px]" :class="saveState === 'saving' ? 'text-warn' : 'text-ok'">
      <span class="w-[7px] h-[7px] rounded-full bg-current" />
      {{ saveState === 'saving' ? 'Enregistrement…' : 'Enregistré' }}
    </span>
  </div>
  <p class="text-[13.5px] text-fg-3 my-1 mb-[26px]">
    Ajoutez vos réalisations (image de couverture, catégorie, galerie). Elles s'affichent sur la page Portfolios et ouvrent une page projet.
  </p>
  <p v-if="error" class="text-err text-[13px] mb-4">{{ error }}</p>

  <div v-if="!loading" class="grid grid-cols-1 desk:grid-cols-[340px_1fr] gap-6 items-start">
    <!-- list -->
    <div class="flex flex-col gap-2.5">
      <span class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">Réalisations ({{ items.length }})</span>
      <div
        v-for="(it, i) in items"
        :key="it.id"
        class="bg-nova-surface border rounded-md p-3 cursor-pointer transition-[border-color,box-shadow] duration-nova flex items-center gap-3"
        :class="[editingId === it.id ? 'border-nova-teal shadow-nova-sm' : 'border-line', !it.visible && 'opacity-55']"
        draggable="true"
        @click="editingId = it.id"
        @dragstart="onDragStart(i)"
        @dragover.prevent="onDragOver(i)"
        @drop="onDrop"
        @dragend="onDrop"
      >
        <NIcon name="grip-vertical" :size="15" color="#aeb9bc" />
        <div class="w-12 h-10 rounded overflow-hidden shrink-0" :style="!it.cover_image ? { background: novaGrad(i) } : {}">
          <img v-if="it.cover_image" :src="it.cover_image" :alt="it.title" class="w-full h-full object-cover" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[13.5px] font-semibold text-fg-1 truncate">{{ it.title }}</div>
          <div class="text-[11px] text-fg-3 truncate">{{ it.category }}</div>
        </div>
        <button class="p-1 text-fg-3 hover:text-fg-1" title="Visibilité" @click.stop="toggleVisible(it)">
          <NIcon :name="it.visible ? 'eye' : 'eye-off'" :size="15" />
        </button>
        <button class="p-1 text-fg-3 hover:text-err" title="Supprimer" @click.stop="removeItem(it)">
          <NIcon name="trash-2" :size="14" />
        </button>
      </div>
      <button
        class="flex items-center justify-center gap-2 p-[13px] rounded-md border-[1.5px] border-dashed border-line-strong text-nova-teal text-[13px] font-semibold hover:border-nova-teal"
        @click="addItem"
      >
        <NIcon name="plus" :size="16" /> Ajouter une réalisation
      </button>
    </div>

    <!-- editor -->
    <div v-if="cur" class="bg-nova-surface border border-line rounded-lg p-[26px] shadow-nova-xs max-w-[640px]">
      <span class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">Détails de la réalisation</span>

      <label :class="labelClass">Image de couverture</label>
      <div class="mt-2"><ImageField v-model="cur.cover_image" :height="200" @update:model-value="onEdit" /></div>

      <label :class="labelClass">Titre</label>
      <input v-model="cur.title" :class="[inputClass, 'font-display text-lg font-semibold']" @input="onEdit" />

      <label :class="labelClass">Catégorie</label>
      <input v-model="cur.category" :class="inputClass" list="pf-cats" placeholder="Ex. Logo, Motion design…" @input="onEdit" />
      <datalist id="pf-cats">
        <option v-for="c in knownCategories" :key="c" :value="c" />
      </datalist>

      <label :class="labelClass">Description</label>
      <textarea v-model="cur.description" rows="4" :class="[inputClass, 'text-sm resize-y']" @input="onEdit" />

      <label :class="labelClass">Lien externe (projet en ligne)</label>
      <input v-model="cur.external_url" :class="inputClass" placeholder="https://… (optionnel)" @input="onEdit" />

      <label :class="labelClass">Galerie (images & vidéos)</label>
      <p class="text-[12px] text-fg-3 mt-1">Ajoutez des photos ou des vidéos (.mp4, .webm…). Les vidéos sont lisibles sur la page projet.</p>
      <div class="grid grid-cols-2 tab:grid-cols-3 gap-3 mt-2">
        <div v-for="(img, i) in cur.images" :key="i" class="relative">
          <MediaField :model-value="img" :height="110" @update:model-value="(v: string) => setImage(i, v)" />
          <button class="absolute top-1 right-1 bg-nova-surface/90 rounded p-1 text-fg-3 hover:text-err shadow-nova-xs" title="Retirer" @click="removeImage(i)">
            <NIcon name="trash-2" :size="13" />
          </button>
        </div>
        <button
          class="h-[110px] rounded-md border-[1.5px] border-dashed border-line-strong text-nova-teal text-[12px] font-semibold grid place-items-center hover:border-nova-teal"
          @click="addImage"
        >
          <span class="flex flex-col items-center gap-1"><NIcon name="plus" :size="16" /> Image / vidéo</span>
        </button>
      </div>

      <div class="mt-5">
        <NButton variant="ghost" size="sm" icon="arrow-up-right" :to="`/portfolio/${cur.slug}`">Voir la page projet</NButton>
      </div>
    </div>
  </div>
  <p v-else class="text-fg-3">Chargement…</p>
</template>
