<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  accent: { type: String, default: 'var(--pm-color-pacman)' },
})
</script>

<template>
  <div class="pm-stat">
    <span class="pm-stat__label pm-display">{{ label }}</span>
    <span class="pm-stat__value pm-display" :style="{ color: accent }">{{ value }}</span>
  </div>
</template>

<style scoped>
.pm-stat {
  display: flex;
  flex-direction: column;
  gap: var(--pm-space-2);
  min-width: 84px;
}
.pm-stat__label {
  font-size: var(--pm-fs-xs);
  color: var(--pm-text-muted);
}
.pm-stat__value {
  font-size: var(--pm-fs-lg);
  text-shadow: 0 0 8px currentColor;
}
</style>
