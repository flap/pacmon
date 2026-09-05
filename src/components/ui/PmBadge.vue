<script setup>
const TYPE_COLORS = {
  grass: 'var(--pm-type-grass)',
  fire: 'var(--pm-type-fire)',
  electric: 'var(--pm-type-electric)',
  normal: 'var(--pm-type-normal)',
  water: 'var(--pm-type-water)',
  psychic: 'var(--pm-type-psychic)',
}

const props = defineProps({
  type: { type: String, default: 'normal' },
  label: { type: String, required: true },
  strength: { type: Number, default: null },
})

const color = () => TYPE_COLORS[props.type] || 'var(--pm-type-normal)'
</script>

<template>
  <span class="pm-badge pm-display" :style="{ '--badge-color': color() }">
    <span class="pm-badge__label">{{ label }}</span>
    <span v-if="strength !== null" class="pm-badge__strength">{{ strength }}</span>
  </span>
</template>

<style scoped>
.pm-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--pm-space-2);
  font-size: var(--pm-fs-xs);
  padding: var(--pm-space-1) var(--pm-space-2);
  border-radius: var(--pm-radius-pill);
  background: color-mix(in srgb, var(--badge-color) 25%, var(--pm-surface));
  box-shadow: inset 0 0 0 2px var(--badge-color);
  color: var(--pm-text-primary);
  white-space: nowrap;
}
.pm-badge__strength {
  background: var(--badge-color);
  color: var(--pm-text-on-accent);
  border-radius: var(--pm-radius-pill);
  padding: 0 var(--pm-space-2);
}
</style>
