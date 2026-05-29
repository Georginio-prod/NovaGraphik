<script setup lang="ts">
defineProps<{
  label?: string
  placeholder?: string
  type?: string
  error?: string
}>()
const model = defineModel<string>()
</script>

<template>
  <div>
    <label v-if="label" class="text-[11px] font-semibold tracking-wider uppercase text-fg-2">{{ label }}</label>
    <input
      v-model="model"
      :type="type || 'text'"
      :placeholder="placeholder"
      :aria-invalid="error ? true : undefined"
      class="w-full box-border font-sans text-sm text-fg-1 bg-nova-paper border rounded-sm px-3.5 py-3 outline-none mt-2 transition-[border-color,box-shadow,background] duration-nova focus:bg-nova-surface"
      :class="
        error
          ? 'border-err focus:border-err focus:shadow-[0_0_0_3px_rgba(192,57,43,0.15)]'
          : 'border-line-strong focus:border-nova-lime focus:shadow-[0_0_0_3px_rgba(12,242,93,0.18)]'
      "
    />
    <p v-if="error" class="text-err text-[12px] mt-1.5 mb-0">{{ error }}</p>
  </div>
</template>
