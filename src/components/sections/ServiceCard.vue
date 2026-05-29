<script setup lang="ts">
import NIcon from '@/components/base/NIcon.vue'

defineProps<{ icon: string; title: string; desc: string }>()
</script>

<template>
  <div class="svc">
    <div class="ic">
      <NIcon :name="icon" :size="22" />
    </div>
    <h3 class="t">{{ title }}</h3>
    <p class="d">{{ desc }}</p>
  </div>
</template>

<style scoped>
.svc {
  background: #fff;
  border-radius: var(--r-lg);
  padding: 26px 22px;
  border: 1px solid var(--border-1);
  box-shadow: var(--shadow-xs);
  transition: all var(--dur) var(--ease-out);
}
.svc:hover {
  border-color: var(--nova-teal-300);
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}
.ic {
  width: 46px;
  height: 46px;
  border-radius: var(--r-md);
  background: var(--nova-fog);
  display: grid;
  place-items: center;
  color: var(--nova-teal);
  transition: background var(--dur), color var(--dur);
}
.svc:hover .ic { background: var(--nova-lime); color: #042b16; }
.t {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 600;
  margin: 18px 0 6px;
  color: var(--fg-1);
  letter-spacing: -0.01em;
}
.d { font-size: 13px; line-height: 1.55; color: var(--fg-3); margin: 0; }
</style>
