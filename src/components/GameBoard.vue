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

    <!-- itens: boné e pokébola -->
    <div
      v-for="(item, i) in visibleItems"
      :key="`item-${i}`"
      class="item"
      :style="{ left: px(item.x), top: px(item.y) }"
    >
      {{ item.kind === 'cap' ? '🧢' : '⚪' }}
    </div>

    <!-- inimigos pokemon -->
    <div
      v-for="e in visibleEnemies"
      :key="e.id"
      class="enemy"
      :class="{ frightened: state.powerActive }"
      :style="{ left: px(e.x), top: px(e.y) }"
      :title="`${POKEMON[e.species].name} (força ${e.strength})`"
    >
      {{ POKEMON[e.species].sprite }}
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
