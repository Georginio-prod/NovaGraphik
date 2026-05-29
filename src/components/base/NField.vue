<script setup lang="ts">
defineProps<{
  label?: string
  placeholder?: string
  type?: string
}>()
const model = defineModel<string>()
</script>

<template>
  <div class="n-field">
    <label v-if="label" class="field-label">{{ label }}</label>
    <input
      v-model="model"
      :type="type || 'text'"
      :placeholder="placeholder"
      class="field-input"
    />
  </div>
</template>

<style scoped>
.field-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fg-2);
}
.field-input {
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
  transition: border-color var(--dur), box-shadow var(--dur), background var(--dur);
}
.field-input:focus {
  border-color: var(--nova-lime);
  box-shadow: 0 0 0 3px rgba(12, 242, 93, 0.18);
  background: #fff;
}
</style>
