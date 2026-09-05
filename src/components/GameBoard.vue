<script setup>
import { computed } from 'vue'
import { COLS, ROWS } from '@/game/maze.js'
import { POKEMON } from '@/game/pokemon.js'

const props = defineProps({
  state: { type: Object, required: true },
})

const CELL = 24 // px por célula

const boardStyle = computed(() => ({
  width: `${COLS * CELL}px`,
  height: `${ROWS * CELL}px`,
}))

function px(v) {
  return `${v * CELL}px`
}

const pacmanRotation = computed(() => {
  return { up: -90, down: 90, left: 180, right: 0 }[props.state.pacman.dir] || 0
})

const visibleItems = computed(() => props.state.items.filter((i) => !i.taken))
const visibleEnemies = computed(() => props.state.enemies.filter((e) => e.alive))
const pelletList = computed(() => Array.from(props.state.pellets).map((k) => {
  const [x, y] = k.split(',').map(Number)
  return { x, y, k }
}))
const fogList = computed(() => Array.from(props.state.fog).map((k) => {
  const [x, y] = k.split(',').map(Number)
  return { x, y, k }
}))
</script>

<template>
  <div class="board" :style="boardStyle">
    <!-- paredes -->
    <template v-for="(row, y) in state.grid" :key="y">
      <div
        v-for="(cell, x) in row"
        :key="`${x},${y}`"
        v-show="cell === 1"
        class="wall"
        :style="{ left: px(x), top: px(y), width: px(1), height: px(1) }"
      />
    </template>

    <!-- pastilhas -->
    <div
      v-for="p in pelletList"
      :key="p.k"
      class="pellet"
      :style="{ left: px(p.x), top: px(p.y) }"
    />

    <!-- névoa "agonia": camada visual sobre as células afetadas -->
    <div
      v-for="f in fogList"
      :key="`fog-${f.k}`"
      class="fog"
      :style="{ left: px(f.x), top: px(f.y), width: px(1), height: px(1) }"
    />

    <!-- itens: boné e pokébola -->
    <div
      v-for="(item, i) in visibleItems"
      :key="`item-${i}`"
      class="item"
      :style="{ left: px(item.x), top: px(item.y) }"
    >
      {{ item.kind === 'cap' ? '🧢' : '⚪' }}
    </div>

    <!-- inimigos pokemon (sprite da PokeAPI, com fallback emoji) -->
    <div
      v-for="e in visibleEnemies"
      :key="e.id"
      class="enemy"
      :class="{ frightened: state.powerActive }"
      :style="{ left: px(e.x), top: px(e.y) }"
      :title="`${POKEMON[e.species].name} (força ${e.strength})`"
    >
      <img v-if="e.image" :src="e.image" :alt="POKEMON[e.species].name" class="enemy__sprite" />
      <span v-else class="enemy__emoji">{{ POKEMON[e.species].sprite }}</span>
      <!-- barra de força (cai quando a névoa drena) -->
      <span class="enemy__hp">
        <span
          class="enemy__hp-fill"
          :style="{ width: Math.round((e.strength / e.maxStrength) * 100) + '%' }"
        />
      </span>
    </div>

    <!-- pacman -->
    <div
      class="pacman"
      :class="{ powered: state.powerActive }"
      :style="{ left: px(state.pacman.x), top: px(state.pacman.y), transform: `rotate(${pacmanRotation}deg)` }"
    >
      <div class="pacman__body" />
    </div>
  </div>
</template>

<style scoped>
.board {
  position: relative;
  background: var(--pm-bg-board);
  border-radius: var(--pm-radius-md);
  overflow: hidden;
  box-shadow: var(--pm-shadow-lg);
}
.wall {
  position: absolute;
  background: var(--pm-wall);
  box-shadow: inset 0 0 4px var(--pm-wall-glow);
  border-radius: 3px;
}
.pellet {
  position: absolute;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
}
.pellet::after {
  content: '';
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--pm-color-pacman);
  opacity: 0.7;
}
.item, .enemy, .pacman {
  position: absolute;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  transition: left var(--pm-dur-fast) linear, top var(--pm-dur-fast) linear;
  z-index: var(--pm-z-entities);
}
.enemy.frightened { filter: hue-rotate(180deg) brightness(0.8); }

/* sprite da PokeAPI dentro do inimigo */
.enemy { flex-direction: column; }
.enemy__sprite {
  width: 22px; height: 22px;
  object-fit: contain;
  image-rendering: auto;
  filter: drop-shadow(0 0 3px rgba(0,0,0,0.6));
}
.enemy__emoji { font-size: 18px; line-height: 1; }
.enemy__hp {
  position: absolute;
  bottom: 0; left: 3px; right: 3px;
  height: 3px;
  background: rgba(0,0,0,0.5);
  border-radius: 2px;
  overflow: hidden;
}
.enemy__hp-fill {
  display: block;
  height: 100%;
  background: var(--pm-success);
  transition: width var(--pm-dur-fast) linear;
}

/* névoa "agonia" */
.fog {
  position: absolute;
  z-index: var(--pm-z-entities);
  pointer-events: none;
  background: radial-gradient(
    circle at center,
    rgba(150, 90, 200, 0.55),
    rgba(90, 40, 130, 0.35)
  );
  border-radius: 6px;
  animation: fog-drift var(--pm-dur-slow) ease-in-out infinite alternate;
  box-shadow: 0 0 10px rgba(150, 90, 200, 0.5);
}
@keyframes fog-drift {
  from { opacity: 0.5; transform: scale(0.92); }
  to { opacity: 0.85; transform: scale(1.04); }
}
.pacman__body {
  width: 18px; height: 18px;
  background: var(--pm-color-pacman);
  border-radius: 50%;
  box-shadow: var(--pm-glow-pacman);
  /* "boca" do pacman */
  clip-path: polygon(100% 25%, 45% 50%, 100% 75%, 100% 100%, 0 100%, 0 0, 100% 0);
}
.pacman.powered .pacman__body {
  background: var(--pm-color-pokeball-red);
  box-shadow: var(--pm-glow-pokeball);
}
</style>
