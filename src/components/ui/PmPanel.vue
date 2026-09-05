<script setup>
defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <section class="pm-panel">
    <h2 v-if="title" class="pm-panel__title pm-display">{{ title }}</h2>
    <div class="pm-panel__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.pm-panel {
  background: var(--pm-surface-raised);
  border-radius: var(--pm-radius-lg);
  padding: var(--pm-space-6);
  box-shadow: var(--pm-shadow-md);
  border: 2px solid color-mix(in srgb, var(--pm-wall-glow) 30%, transparent);
}
.pm-panel__title {
  font-size: var(--pm-fs-sm);
  color: var(--pm-color-pacman);
  margin-bottom: var(--pm-space-4);
}
</style>
