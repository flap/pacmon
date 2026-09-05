<script setup>
/*
 * Indicador do powerup em 2 etapas:
 * 1. hasCap = true   -> bone do Ash equipado (slot pokebola destrava)
 * 2. powerActive = true -> pokebola ativada (modo captura)
 * Pokebola sem bone aparece esmaecida/inativa.
 */
defineProps({
  hasCap: { type: Boolean, default: false },
  powerActive: { type: Boolean, default: false },
  timeLeft: { type: Number, default: 0 }, // segundos restantes do powerup
})
</script>

<template>
  <div class="pm-powerup">
    <div class="pm-powerup__slot" :class="{ 'is-on': hasCap }" title="Boné do Ash">
      <span class="pm-powerup__icon">🧢</span>
      <span class="pm-powerup__tag pm-display">BONÉ</span>
    </div>

    <span class="pm-powerup__arrow pm-display">→</span>

    <div
      class="pm-powerup__slot pm-powerup__slot--ball"
      :class="{ 'is-on': powerActive, 'is-locked': !hasCap }"
      title="Pokébola (só ativa com o boné)"
    >
      <span class="pm-powerup__icon">⚪</span>
      <span class="pm-powerup__tag pm-display">
        {{ powerActive ? timeLeft + 's' : 'POKÉBOLA' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.pm-powerup {
  display: flex;
  align-items: center;
  gap: var(--pm-space-3);
}
.pm-powerup__slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--pm-space-1);
  padding: var(--pm-space-2) var(--pm-space-3);
  border-radius: var(--pm-radius-md);
  background: var(--pm-surface);
  box-shadow: inset 0 0 0 2px var(--pm-text-muted);
  opacity: 0.5;
  transition: all var(--pm-dur-normal) var(--pm-ease);
}
.pm-powerup__slot.is-on {
  opacity: 1;
  box-shadow: inset 0 0 0 2px var(--pm-color-ash-blue), var(--pm-glow-power);
}
.pm-powerup__slot--ball.is-on {
  box-shadow: inset 0 0 0 2px var(--pm-color-pokeball-red), var(--pm-glow-pokeball);
  animation: pm-pulse var(--pm-dur-slow) infinite alternate;
}
.pm-powerup__slot.is-locked { filter: grayscale(1); }
.pm-powerup__icon { font-size: var(--pm-fs-lg); }
.pm-powerup__tag { font-size: var(--pm-fs-xs); color: var(--pm-text-secondary); }
.pm-powerup__arrow { color: var(--pm-text-muted); }

@keyframes pm-pulse {
  from { transform: scale(1); }
  to { transform: scale(1.08); }
}
</style>
