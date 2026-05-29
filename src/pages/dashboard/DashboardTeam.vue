<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, type TeamMember } from '@/lib/api'
import { novaGrad } from '@/lib/gradients'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NButton from '@/components/base/NButton.vue'
import NIcon from '@/components/base/NIcon.vue'
import ImageField from '@/components/dashboard/ImageField.vue'

const inputClass =
  'w-full box-border font-sans text-fg-1 bg-nova-paper border border-line-strong rounded-sm px-3.5 py-3 outline-none mt-2 transition-[border-color,box-shadow,background] duration-nova focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)] focus:bg-nova-surface'
const labelClass = 'block text-[11px] font-semibold tracking-wider uppercase text-fg-2 mt-4'

const members = ref<TeamMember[]>([])
const editingId = ref<number | null>(null)
const loading = ref(true)
const error = ref('')
const saveState = ref<'idle' | 'saving' | 'saved'>('saved')

const cur = computed(() => members.value.find((m) => m.id === editingId.value) ?? null)
const parentOptions = computed(() => members.value.filter((m) => m.id !== editingId.value))

onMounted(load)

async function load() {
  loading.value = true
  try {
    const d = await api.get<{ members: TeamMember[] }>('/admin/team')
    members.value = d.members
    editingId.value = d.members[0]?.id ?? null
  } catch {
    error.value = 'Impossible de charger l’équipe.'
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
  const m = cur.value
  if (!m) return
  try {
    await api.put(`/admin/team/${m.id}`, {
      name: m.name,
      role: m.role,
      bio: m.bio,
      photo: m.photo,
      parent_id: m.parent_id,
      visible: m.visible,
    })
    saveState.value = 'saved'
  } catch {
    saveState.value = 'idle'
    error.value = 'Échec de l’enregistrement.'
  }
}
function setParent(e: Event) {
  if (!cur.value) return
  const v = (e.target as HTMLSelectElement).value
  cur.value.parent_id = v ? Number(v) : null
  onEdit()
}
async function addMember() {
  try {
    const d = await api.post<{ member: TeamMember }>('/admin/team', {
      name: 'Nouveau membre',
      role: 'Rôle',
      bio: '',
      photo: '',
    })
    members.value.push(d.member)
    editingId.value = d.member.id
  } catch {
    error.value = 'Impossible d’ajouter le membre.'
  }
}
async function removeMember(m: TeamMember) {
  const idx = members.value.findIndex((x) => x.id === m.id)
  members.value = members.value.filter((x) => x.id !== m.id)
  if (editingId.value === m.id) editingId.value = members.value[Math.max(0, idx - 1)]?.id ?? null
  try {
    await api.del(`/admin/team/${m.id}`)
  } catch {
    error.value = 'Suppression impossible.'
    load()
  }
}
async function toggleVisible(m: TeamMember) {
  m.visible = m.visible ? 0 : 1
  try {
    await api.put(`/admin/team/${m.id}`, { visible: m.visible })
  } catch {
    m.visible = m.visible ? 0 : 1
  }
}

const dragIndex = ref<number | null>(null)
function onDragStart(i: number) {
  dragIndex.value = i
}
function onDragOver(i: number) {
  if (dragIndex.value === null || dragIndex.value === i) return
  const [moved] = members.value.splice(dragIndex.value, 1)
  members.value.splice(i, 0, moved)
  dragIndex.value = i
}
async function onDrop() {
  dragIndex.value = null
  try {
    await api.put('/admin/team/reorder', { ids: members.value.map((m) => m.id) })
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
      <h1 class="font-display text-[32px] font-semibold mt-1.5 mb-0 text-fg-1">Équipe</h1>
    </div>
    <span class="flex items-center gap-1.5 text-[11px]" :class="saveState === 'saving' ? 'text-warn' : 'text-ok'">
      <span class="w-[7px] h-[7px] rounded-full bg-current" />
      {{ saveState === 'saving' ? 'Enregistrement…' : 'Enregistré' }}
    </span>
  </div>
  <p class="text-[13.5px] text-fg-3 my-1 mb-[26px]">
    Ajoutez vos membres (photo, nom, rôle, présentation). Le champ « Supérieur » construit l'organigramme affiché sur le site.
  </p>
  <p v-if="error" class="text-err text-[13px] mb-4">{{ error }}</p>

  <div v-if="!loading" class="grid grid-cols-1 desk:grid-cols-[340px_1fr] gap-6 items-start">
    <!-- list -->
    <div class="flex flex-col gap-2.5">
      <span class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">Membres ({{ members.length }})</span>
      <div
        v-for="(m, i) in members"
        :key="m.id"
        class="bg-nova-surface border rounded-md p-3 cursor-pointer transition-[border-color,box-shadow] duration-nova flex items-center gap-3"
        :class="[editingId === m.id ? 'border-nova-teal shadow-nova-sm' : 'border-line', !m.visible && 'opacity-55']"
        draggable="true"
        @click="editingId = m.id"
        @dragstart="onDragStart(i)"
        @dragover.prevent="onDragOver(i)"
        @drop="onDrop"
        @dragend="onDrop"
      >
        <NIcon name="grip-vertical" :size="15" color="#aeb9bc" />
        <div class="w-10 h-10 rounded-full overflow-hidden shrink-0" :style="!m.photo ? { background: novaGrad(i) } : {}">
          <img v-if="m.photo" :src="m.photo" :alt="m.name" class="w-full h-full object-cover" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[13.5px] font-semibold text-fg-1 truncate">{{ m.name }}</div>
          <div class="text-[11px] text-fg-3 truncate">{{ m.role }}</div>
        </div>
        <button class="p-1 text-fg-3 hover:text-fg-1" title="Visibilité" @click.stop="toggleVisible(m)">
          <NIcon :name="m.visible ? 'eye' : 'eye-off'" :size="15" />
        </button>
        <button class="p-1 text-fg-3 hover:text-err" title="Supprimer" @click.stop="removeMember(m)">
          <NIcon name="trash-2" :size="14" />
        </button>
      </div>
      <button
        class="flex items-center justify-center gap-2 p-[13px] rounded-md border-[1.5px] border-dashed border-line-strong text-nova-teal text-[13px] font-semibold hover:border-nova-teal"
        @click="addMember"
      >
        <NIcon name="plus" :size="16" /> Ajouter un membre
      </button>
    </div>

    <!-- editor -->
    <div v-if="cur" class="bg-nova-surface border border-line rounded-lg p-[26px] shadow-nova-xs max-w-[560px]">
      <span class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">Fiche du membre</span>
      <div class="mt-3 grid grid-cols-1 tab:grid-cols-[160px_1fr] gap-5 items-start">
        <div>
          <label class="block text-[11px] font-semibold tracking-wider uppercase text-fg-2 mb-2">Photo</label>
          <ImageField v-model="cur.photo" :height="160" @update:model-value="onEdit" />
        </div>
        <div>
          <label class="block text-[11px] font-semibold tracking-wider uppercase text-fg-2">Nom</label>
          <input v-model="cur.name" :class="[inputClass, 'font-display text-lg font-semibold']" @input="onEdit" />
          <label :class="labelClass">Rôle</label>
          <input v-model="cur.role" :class="inputClass" placeholder="Ex. Graphiste Designer" @input="onEdit" />
          <label :class="labelClass">Supérieur (organigramme)</label>
          <select :value="cur.parent_id ?? ''" :class="inputClass" @change="setParent">
            <option value="">— Aucun (racine) —</option>
            <option v-for="p in parentOptions" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
      </div>
      <label :class="labelClass">Présentation</label>
      <textarea v-model="cur.bio" rows="5" :class="[inputClass, 'text-sm resize-y']" placeholder="Quelques lignes sur ce membre…" @input="onEdit" />
      <div class="mt-4">
        <NButton variant="ghost" size="sm" icon="arrow-up-right" :to="`/equipe/${cur.slug}`">Voir la page publique</NButton>
      </div>
    </div>
  </div>
  <p v-else class="text-fg-3">Chargement…</p>
</template>
