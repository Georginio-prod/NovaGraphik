<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@/lib/api'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NIcon from '@/components/base/NIcon.vue'
import IconPicker from '@/components/dashboard/IconPicker.vue'
import ImageField from '@/components/dashboard/ImageField.vue'
import QrField from '@/components/dashboard/QrField.vue'
import PromoCodesField from '@/components/dashboard/PromoCodesField.vue'

type Field = {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'icon' | 'image' | 'url' | 'list' | 'bool' | 'select' | 'qr' | 'codes'
  placeholder?: string
  rows?: number
  /** When the field type === 'list', show this label above */
  itemLabel?: string
  /** When the field type === 'select', the choices to offer */
  options?: { value: string; label: string }[]
  /** Forwarded to ImageField for type === 'image' */
  aspect?: number
  round?: boolean
  /** Hide the format picker in the cropper (type === 'image') */
  lockFormat?: boolean
}

const props = defineProps<{
  /** API resource segment (e.g. 'nav', 'services', 'articles') */
  endpoint: string
  /** Page title + subtitle */
  title: string
  subtitle?: string
  /** Editable fields */
  fields: Field[]
  /** Function returning the label shown in the left list (item) → string */
  itemLabel: (item: any) => string
  itemSubLabel?: (item: any) => string | undefined
  /** Default values for a new item */
  newDefaults: Record<string, any>
  /** Optional title for the "Add" button */
  addLabel?: string
}>()

const items = ref<any[]>([])
const editingId = ref<number | null>(null)
const loading = ref(true)
const error = ref('')
const saveState = ref<'idle' | 'saving' | 'saved'>('saved')

const cur = computed(() => items.value.find((i) => i.id === editingId.value) ?? null)

const inputClass =
  'w-full box-border font-sans text-fg-1 bg-nova-paper border border-line-strong rounded-sm px-3.5 py-3 outline-none mt-2 transition-[border-color,box-shadow,background] duration-nova focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)] focus:bg-nova-surface'
const labelClass = 'block text-[11px] font-semibold tracking-wider uppercase text-fg-2 mt-4'

onMounted(load)

async function load() {
  loading.value = true
  try {
    const data = await api.get<{ items: any[] }>(`/admin/${props.endpoint}`)
    items.value = data.items
    editingId.value = data.items[0]?.id ?? null
  } catch {
    error.value = 'Impossible de charger les éléments.'
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
    const payload: Record<string, any> = { visible: it.visible }
    for (const f of props.fields) payload[f.key] = it[f.key]
    await api.put(`/admin/${props.endpoint}/${it.id}`, payload)
    saveState.value = 'saved'
  } catch {
    saveState.value = 'idle'
    error.value = 'Échec de l’enregistrement.'
  }
}
async function add() {
  try {
    const data = await api.post<{ item: any }>(`/admin/${props.endpoint}`, { ...props.newDefaults })
    items.value.push(data.item)
    editingId.value = data.item.id
  } catch {
    error.value = 'Impossible d’ajouter.'
  }
}
async function remove(it: any) {
  const idx = items.value.findIndex((x) => x.id === it.id)
  items.value = items.value.filter((x) => x.id !== it.id)
  if (editingId.value === it.id) editingId.value = items.value[Math.max(0, idx - 1)]?.id ?? null
  try {
    await api.del(`/admin/${props.endpoint}/${it.id}`)
  } catch {
    error.value = 'Suppression impossible.'
    load()
  }
}
async function toggleVisible(it: any) {
  it.visible = it.visible ? 0 : 1
  try {
    await api.put(`/admin/${props.endpoint}/${it.id}`, { visible: it.visible })
  } catch {
    it.visible = it.visible ? 0 : 1
  }
}

/* drag reorder */
const dragIndex = ref<number | null>(null)
function onDragStart(i: number) { dragIndex.value = i }
function onDragOver(i: number) {
  if (dragIndex.value === null || dragIndex.value === i) return
  const [moved] = items.value.splice(dragIndex.value, 1)
  items.value.splice(i, 0, moved)
  dragIndex.value = i
}
async function onDrop() {
  dragIndex.value = null
  try {
    await api.put(`/admin/${props.endpoint}/reorder`, { ids: items.value.map((i) => i.id) })
  } catch {
    error.value = 'Réorganisation non enregistrée.'
    load()
  }
}

/* list field helpers (for arrays like features) */
function addToList(field: string) {
  if (!cur.value) return
  if (!Array.isArray(cur.value[field])) cur.value[field] = []
  cur.value[field].push('')
  onEdit()
}
function removeFromList(field: string, i: number) {
  cur.value?.[field].splice(i, 1)
  onEdit()
}
</script>

<template>
  <div class="flex justify-between items-center mb-1.5 gap-4">
    <div>
      <NEyebrow>Tableau de bord</NEyebrow>
      <h1 class="font-display text-[32px] font-semibold mt-1.5 mb-0 text-fg-1">{{ title }}</h1>
    </div>
    <span class="flex items-center gap-1.5 text-[11px]" :class="saveState === 'saving' ? 'text-warn' : 'text-ok'">
      <span class="w-[7px] h-[7px] rounded-full bg-current" />
      {{ saveState === 'saving' ? 'Enregistrement…' : 'Enregistré' }}
    </span>
  </div>
  <p v-if="subtitle" class="text-[13.5px] text-fg-3 my-1 mb-[26px]">{{ subtitle }}</p>
  <p v-if="error" class="text-err text-[13px] mb-4">{{ error }}</p>

  <div v-if="!loading" class="grid grid-cols-1 desk:grid-cols-[340px_1fr] gap-6 items-start">
    <!-- list -->
    <div class="flex flex-col gap-2.5">
      <span class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">
        {{ items.length }} élément{{ items.length > 1 ? 's' : '' }}
      </span>
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
        <div class="min-w-0 flex-1">
          <div class="text-[13.5px] font-semibold text-fg-1 truncate">{{ itemLabel(it) }}</div>
          <div v-if="itemSubLabel?.(it)" class="text-[11px] text-fg-3 truncate">{{ itemSubLabel?.(it) }}</div>
        </div>
        <button class="p-1 text-fg-3 hover:text-fg-1" title="Visibilité" @click.stop="toggleVisible(it)">
          <NIcon :name="it.visible ? 'eye' : 'eye-off'" :size="15" />
        </button>
        <button class="p-1 text-fg-3 hover:text-err" title="Supprimer" @click.stop="remove(it)">
          <NIcon name="trash-2" :size="14" />
        </button>
      </div>
      <button
        class="flex items-center justify-center gap-2 p-[13px] rounded-md border-[1.5px] border-dashed border-line-strong text-nova-teal text-[13px] font-semibold hover:border-nova-teal"
        @click="add"
      >
        <NIcon name="plus" :size="16" /> {{ addLabel || 'Ajouter' }}
      </button>
    </div>

    <!-- editor -->
    <div v-if="cur" class="bg-nova-surface border border-line rounded-lg p-[26px] shadow-nova-xs max-w-[640px]">
      <span class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">Édition</span>
      <template v-for="f in fields" :key="f.key">
        <label :class="labelClass">{{ f.label }}</label>
        <div v-if="f.type === 'icon'" class="mt-2"><IconPicker v-model="cur[f.key]" @update:model-value="onEdit" /></div>
        <div v-else-if="f.type === 'qr'" class="mt-2"><QrField v-model="cur[f.key]" :placeholder="f.placeholder" @update:model-value="onEdit" /></div>
        <div v-else-if="f.type === 'codes'" class="mt-2"><PromoCodesField v-model="cur[f.key]" :seed="cur.title" @update:model-value="onEdit" /></div>
        <div v-else-if="f.type === 'image'" class="mt-2"><ImageField v-model="cur[f.key]" :height="140" :aspect="f.aspect" :round="f.round" :lock-format="f.lockFormat" @update:model-value="onEdit" /></div>
        <select
          v-else-if="f.type === 'select'"
          v-model="cur[f.key]"
          :class="inputClass"
          @change="onEdit"
        >
          <option v-for="o in f.options || []" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
        <input
          v-else-if="f.type === 'url'"
          v-model="cur[f.key]"
          type="url"
          :class="inputClass"
          :placeholder="f.placeholder || 'https://…'"
          @input="onEdit"
        />
        <textarea
          v-else-if="f.type === 'textarea'"
          v-model="cur[f.key]"
          :rows="f.rows || 4"
          :class="[inputClass, 'text-sm resize-y']"
          :placeholder="f.placeholder"
          @input="onEdit"
        />
        <div v-else-if="f.type === 'bool'" class="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            :id="`bool-${f.key}`"
            :checked="!!cur[f.key]"
            class="w-4 h-4 accent-nova-lime"
            @change="(e) => { cur[f.key] = (e.target as HTMLInputElement).checked ? 1 : 0; onEdit() }"
          />
          <label :for="`bool-${f.key}`" class="text-[13px] text-fg-2">{{ f.placeholder || 'Activer' }}</label>
        </div>
        <div v-else-if="f.type === 'list'" class="mt-2 flex flex-col gap-2">
          <div v-for="(v, i) in ((cur[f.key] || []) as any[])" :key="i" class="flex gap-2 items-center">
            <input
              :value="v"
              :class="[inputClass, '!mt-0']"
              :placeholder="f.itemLabel || 'Élément'"
              @input="(e) => { cur[f.key][i] = (e.target as HTMLInputElement).value; onEdit() }"
            />
            <button class="p-2 text-fg-3 hover:text-err" @click="removeFromList(f.key, i)">
              <NIcon name="trash-2" :size="14" />
            </button>
          </div>
          <button
            class="flex items-center justify-center gap-2 p-2.5 rounded-md border border-dashed border-line-strong text-nova-teal text-[12px] font-semibold hover:border-nova-teal"
            @click="addToList(f.key)"
          >
            <NIcon name="plus" :size="14" /> {{ f.itemLabel ? `Ajouter ${f.itemLabel.toLowerCase()}` : 'Ajouter' }}
          </button>
        </div>
        <input
          v-else
          v-model="cur[f.key]"
          :class="inputClass"
          :placeholder="f.placeholder"
          @input="onEdit"
        />
      </template>
    </div>
  </div>
  <p v-else class="text-fg-3">Chargement…</p>
</template>
