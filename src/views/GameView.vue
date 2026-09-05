<script setup>
import { onMounted, onUnmounted, computed } from 'vue'
import { useGame } from '@/game/useGame.js'
import { POKEMON } from '@/game/pokemon.js'
import GameBoard from '@/components/GameBoard.vue'
import PmPanel from '@/components/ui/PmPanel.vue'
import PmButton from '@/components/ui/PmButton.vue'
import PmStat from '@/components/ui/PmStat.vue'
import PmBadge from '@/components/ui/PmBadge.vue'
import PmPowerupIndicator from '@/components/ui/PmPowerupIndicator.vue'

const { state, start, setDirection, stopLoop } = useGame()

const KEY_MAP = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
}

function onKey(e) {
  const dir = KEY_MAP[e.key]
  if (dir) {
    e.preventDefault()
    setDirection(dir)
  }
}

const roundSpecies = computed(() => state.activeSpecies.map((id) => POKEMON[id]))
const powerTimeLeft = computed(() => Math.ceil(state.powerTimer))

const overlayTitle = computed(
  () => ({ idle: 'PacMon', won: 'Você venceu!', lost: 'Game Over' }[state.status] || ''),
)
const overlayMessage = computed(
  () =>
    ({
      idle: 'Colete as pastilhas, derrote os Pokémons pela força e capture com a pokébola.',
      won: 'Todos os Pokémons capturados!',
      lost: 'Suas vidas acabaram. Tente de novo!',
    }[state.status] || ''),
)

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  stopLoop()
})
</script>

<template>
  <main class="game">
    <header class="game__header">
      <h1 class="game__title pm-display">PacMon ⚡</h1>
      <p class="pm-text-secondary">Pacman com Pokémons — capture pela força, ative a pokébola com o boné do Ash</p>
    </header>

    <div class="game__layout">
      <!-- HUD lateral -->
      <aside class="game__sidebar">
        <PmPanel title="Placar">
          <div class="hud-stats">
            <PmStat label="SCORE" :value="state.score" />
            <PmStat label="VIDAS" :value="state.lives" accent="var(--pm-color-pokeball-red)" />
            <PmStat label="RODADA" :value="state.round" accent="var(--pm-info)" />
            <PmStat label="FORÇA" :value="state.pacman.strength" accent="var(--pm-success)" />
          </div>
        </PmPanel>

        <PmPanel title="Powerup">
          <PmPowerupIndicator
            :has-cap="state.hasCap"
            :power-active="state.powerActive"
            :time-left="powerTimeLeft"
          />
          <p class="hint pm-text-muted">
            Pegue o 🧢 boné primeiro. Só depois a ⚪ pokébola ativa o modo captura.
          </p>
        </PmPanel>

        <PmPanel title="Pokémons da rodada">
          <div class="species">
            <PmBadge
              v-for="p in roundSpecies"
              :key="p.id"
              :type="p.type"
              :label="p.name"
              :strength="p.strength"
            />
          </div>
        </PmPanel>
      </aside>

      <!-- Tabuleiro -->
      <section class="game__stage">
        <GameBoard :state="state" />

        <!-- Overlays de estado -->
        <div v-if="state.status !== 'running'" class="overlay">
          <PmPanel :title="overlayTitle">
            <div class="overlay__content">
              <p class="pm-text-secondary">{{ overlayMessage }}</p>
              <PmButton variant="primary" size="lg" @click="start">
                {{ state.status === 'idle' ? 'JOGAR' : 'JOGAR DE NOVO' }}
              </PmButton>
            </div>
          </PmPanel>
        </div>
      </section>
    </div>

    <footer class="game__footer pm-text-muted">
      Controles: setas ou W A S D
    </footer>
  </main>
</template>

<style scoped>
.game {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--pm-space-8) var(--pm-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--pm-space-6);
}
.game__title { font-size: var(--pm-fs-xl); color: var(--pm-color-pacman); }
.game__header { text-align: center; }
.game__layout {
  display: flex;
  gap: var(--pm-space-6);
  align-items: flex-start;
  justify-content: center;
  flex-wrap: wrap;
}
.game__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--pm-space-4);
  width: 240px;
}
.hud-stats { display: grid; grid-template-columns: 1fr 1fr; gap: var(--pm-space-4); }
.species { display: flex; flex-direction: column; gap: var(--pm-space-2); align-items: flex-start; }
.hint { font-size: var(--pm-fs-sm); margin-top: var(--pm-space-3); }
.game__stage { position: relative; }
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 6, 15, 0.82);
  border-radius: var(--pm-radius-md);
  z-index: var(--pm-z-overlay);
}
.overlay__content {
  display: flex;
  flex-direction: column;
  gap: var(--pm-space-6);
  align-items: center;
  text-align: center;
}
.game__footer { text-align: center; font-size: var(--pm-fs-sm); }
</style>
