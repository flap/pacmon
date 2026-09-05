<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | danger | ghost
  size: { type: String, default: 'md' },          // sm | md | lg
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <button
    class="pm-btn pm-display"
    :class="[`pm-btn--${variant}`, `pm-btn--${size}`]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped>
.pm-btn {
  border: none;
  cursor: pointer;
  border-radius: var(--pm-radius-md);
  color: var(--pm-text-on-accent);
  transition: transform var(--pm-dur-fast) var(--pm-ease),
    box-shadow var(--pm-dur-fast) var(--pm-ease),
    filter var(--pm-dur-fast) var(--pm-ease);
}
.pm-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.05); }
.pm-btn:active:not(:disabled) { transform: translateY(0); }
.pm-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* Tamanhos */
.pm-btn--sm { font-size: var(--pm-fs-xs); padding: var(--pm-space-2) var(--pm-space-3); }
.pm-btn--md { font-size: var(--pm-fs-sm); padding: var(--pm-space-3) var(--pm-space-6); }
.pm-btn--lg { font-size: var(--pm-fs-md); padding: var(--pm-space-4) var(--pm-space-8); }

/* Variantes */
.pm-btn--primary { background: var(--pm-color-pacman); box-shadow: var(--pm-glow-pacman); }
.pm-btn--danger {
  background: var(--pm-color-pokeball-red);
  color: var(--pm-text-primary);
  box-shadow: var(--pm-glow-pokeball);
}
.pm-btn--ghost {
  background: transparent;
  color: var(--pm-text-primary);
  box-shadow: inset 0 0 0 2px var(--pm-text-muted);
}
</style>
