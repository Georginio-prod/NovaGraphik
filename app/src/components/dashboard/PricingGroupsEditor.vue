<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NIcon from '@/components/base/NIcon.vue'
import IconPicker from '@/components/dashboard/IconPicker.vue'

// Manage the detailed pricing grid BY GROUP (the section headers on the public
// "Grille tarifaire" page: Identité visuelle, Supports imprimés, …).
//
// The backend stores a flat list of pricing_items where `group_title` +
// `group_icon` define the visual grouping. This editor presents that as real
// groups: rename a group (propagated to all its items in one go), change its
// icon, add/remove a whole group, and edit prices/labels inline.

interface Item {
  id: number
  group_title: string
  group_icon: string
  name: string
  description: string
  price: string
  visible: number
  position: number
}
interface Group {
  key: number // stable local id so editing the title never re-groups mid-type
  title: string
  icon: string
  items: Item[]
}

const groups = ref<Group[]>([])
const loading = ref(true)
const error = ref('')
const saveState = ref<'idle' | 'saving' | 'saved'>('saved')

const inputClass =
  'w-full box-border font-sans text-fg-1 bg-nova-paper border border-line-strong rounded-sm px-3 py-2.5 outline-none transition-[border-color,box-shadow,background] duration-nova focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)] focus:bg-nova-surface'

let keySeq = 0

onMounted(load)

async function load() {
  loading.value = true
  try {
    const data = await api.get<{ items: Item[] }>('/admin/pricing-items')
    // Group by group_title, preserving first-seen order.
    const byTitle = new Map<string, Group>()
    for (const it of data.items) {
      const t = it.group_title || 'Sans groupe'
      let g = byTitle.get(t)
      if (!g) {
        g = { key: keySeq++, title: t, icon: it.group_icon || 'sparkles', items: [] }
        byTitle.set(t, g)
      }
      g.items.push(it)
    }
    groups.value = [...byTitle.values()]
  } catch {
    error.value = 'Impossible de charger la grille tarifaire.'
  } finally {
    loading.value = false
  }
}

// ── Debounced persistence (keyed so concurrent edits don't clobber) ──────────
const timers = new Map<string, ReturnType<typeof setTimeout>>()
function debounce(key: string, fn: () => Promise<unknown>) {
  saveState.value = 'saving'
  clearTimeout(timers.get(key))
  timers.set(
    key,
    setTimeout(async () => {
      try {
        await fn()
        saveState.value = 'saved'
      } catch {
        saveState.value = 'idle'
        error.value = 'Échec de l’enregistrement.'
      }
    }, 600),
  )
}

function saveItem(it: Item) {
  debounce(`item-${it.id}`, () =>
    api.put(`/admin/pricing-items/${it.id}`, {
      name: it.name,
      description: it.description,
      price: it.price,
    }),
  )
}

// Rename / re-icon a whole group → write group_title + group_icon to every item.
function saveGroup(g: Group) {
  for (const it of g.items) {
    it.group_title = g.title
    it.group_icon = g.icon
  }
  debounce(`group-${g.key}`, async () => {
    await Promise.all(
      g.items.map((it) =>
        api.put(`/admin/pricing-items/${it.id}`, { group_title: g.title, group_icon: g.icon }),
      ),
    )
  })
}

async function addItem(g: Group) {
  try {
    saveState.value = 'saving'
    const { item } = await api.post<{ item: Item }>('/admin/pricing-items', {
      group_title: g.title,
      group_icon: g.icon,
      name: 'Nouvelle prestation',
      description: '',
      price: '',
    })
    g.items.push(item)
    saveState.value = 'saved'
  } catch {
    error.value = 'Impossible d’ajouter la prestation.'
  }
}

async function removeItem(g: Group, it: Item) {
  g.items = g.items.filter((x) => x.id !== it.id)
  try {
    await api.del(`/admin/pricing-items/${it.id}`)
  } catch {
    error.value = 'Suppression impossible.'
    load()
  }
}

async function addGroup() {
  try {
    saveState.value = 'saving'
    const title = 'Nouveau groupe'
    const { item } = await api.post<{ item: Item }>('/admin/pricing-items', {
      group_title: title,
      group_icon: 'sparkles',
      name: 'Nouvelle prestation',
      description: '',
      price: '',
    })
    groups.value.push({ key: keySeq++, title, icon: 'sparkles', items: [item] })
    saveState.value = 'saved'
  } catch {
    error.value = 'Impossible d’ajouter le groupe.'
  }
}

async function removeGroup(g: Group) {
  if (!confirm(`Supprimer le groupe « ${g.title} » et ses ${g.items.length} prestation(s) ?`)) return
  const snapshot = g.items.slice()
  groups.value = groups.value.filter((x) => x.key !== g.key)
  try {
    await Promise.all(snapshot.map((it) => api.del(`/admin/pricing-items/${it.id}`)))
  } catch {
    error.value = 'Suppression du groupe impossible.'
    load()
  }
}
</script>

<template>
  <div class="flex justify-between items-center mb-1.5 gap-4">
    <div>
      <NEyebrow>Tableau de bord</NEyebrow>
      <h1 class="font-display text-[28px] tab:text-[32px] font-semibold mt-1.5 mb-0 text-fg-1">
        Grille tarifaire détaillée
      </h1>
    </div>
    <span class="flex items-center gap-1.5 text-[11px]" :class="saveState === 'saving' ? 'text-warn' : 'text-ok'">
      <span class="w-[7px] h-[7px] rounded-full bg-current" />
      {{ saveState === 'saving' ? 'Enregistrement…' : 'Enregistré' }}
    </span>
  </div>
  <p class="text-[13.5px] text-fg-3 my-1 mb-6">
    Les prestations regroupées par section (Identité visuelle, Supports imprimés…). Renommez une
    section, changez son icône, ajoutez des prestations et mettez à jour les prix.
  </p>
  <p v-if="error" class="text-err text-[13px] mb-4">{{ error }}</p>

  <div v-if="!loading" class="flex flex-col gap-6 max-w-[860px]">
    <!-- Each group -->
    <div
      v-for="g in groups"
      :key="g.key"
      class="bg-nova-surface border border-line rounded-lg p-4 tab:p-5 shadow-nova-xs"
    >
      <!-- Group header: icon + title + delete -->
      <div class="flex items-center gap-3 flex-wrap">
        <IconPicker v-model="g.icon" @update:model-value="saveGroup(g)" />
        <input
          v-model="g.title"
          class="flex-1 min-w-[180px] font-display text-[20px] font-semibold text-fg-1 bg-transparent border-b border-transparent hover:border-line focus:border-nova-lime outline-none py-1"
          placeholder="Nom de la section"
          @input="saveGroup(g)"
        />
        <button
          class="p-2 text-fg-3 hover:text-err shrink-0"
          title="Supprimer la section"
          @click="removeGroup(g)"
        >
          <NIcon name="trash-2" :size="16" />
        </button>
      </div>

      <!-- Items -->
      <div class="mt-4 flex flex-col gap-2.5">
        <div
          v-for="it in g.items"
          :key="it.id"
          class="grid grid-cols-1 tab:grid-cols-[1.1fr_1.6fr_0.7fr_auto] gap-2 tab:gap-3 items-center border border-line rounded-md p-2.5"
        >
          <input
            v-model="it.name"
            :class="inputClass"
            placeholder="Prestation (ex. Logo professionnel)"
            @input="saveItem(it)"
          />
          <input
            v-model="it.description"
            :class="inputClass"
            placeholder="Description du livrable"
            @input="saveItem(it)"
          />
          <div class="flex items-center gap-1">
            <input
              v-model="it.price"
              :class="[inputClass, 'text-right']"
              placeholder="25 000"
              @input="saveItem(it)"
            />
            <span class="text-[11px] text-fg-3 shrink-0">FCFA</span>
          </div>
          <button
            class="p-2 text-fg-3 hover:text-err justify-self-end"
            title="Supprimer la prestation"
            @click="removeItem(g, it)"
          >
            <NIcon name="trash-2" :size="14" />
          </button>
        </div>

        <button
          class="flex items-center justify-center gap-2 p-2.5 rounded-md border border-dashed border-line-strong text-nova-teal text-[12px] font-semibold hover:border-nova-teal"
          @click="addItem(g)"
        >
          <NIcon name="plus" :size="14" /> Ajouter une prestation
        </button>
      </div>
    </div>

    <!-- Add a whole group -->
    <button
      class="flex items-center justify-center gap-2 p-[14px] rounded-md border-[1.5px] border-dashed border-line-strong text-nova-teal text-[13px] font-semibold hover:border-nova-teal"
      @click="addGroup"
    >
      <NIcon name="plus" :size="16" /> Ajouter une section
    </button>
  </div>
  <p v-else class="text-fg-3">Chargement…</p>
</template>
