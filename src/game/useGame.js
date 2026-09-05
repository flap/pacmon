import { reactive, readonly, computed } from 'vue'
import { parseMaze, isWall, COLS, ROWS } from './maze.js'
import {
  POKEMON,
  PACMAN_BASE_STRENGTH,
  CAPTURE_STRENGTH_GAIN,
  POWERUP_DURATION,
  getRound,
  resolveCombat,
  hydratePokemonData,
} from './pokemon.js'

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

// ---- Névoa "agonia" (v1.2) ----
const FOG_STRENGTH_DRAIN = 6 // força perdida por passo enquanto o inimigo está na névoa
const FOG_MIN_STRENGTH = 10 // piso: a força do inimigo não cai abaixo disso
const FOG_LIFETIME_MS = 6000 // quanto tempo uma mancha de névoa dura
const FOG_SPAWN_EVERY_MS = 5000 // intervalo entre surgimentos de névoa

/**
 * Composable central do jogo. Encapsula todo o estado e as regras:
 * - movimento em grade
 * - combate por hierarquia de força
 * - powerup em 2 etapas (boné -> pokébola)
 * - rodadas com até 3 espécies de inimigos
 */
export function useGame() {
  const state = reactive({
    status: 'idle', // idle | running | won | lost
    round: 1,
    score: 0,
    lives: 3,
    grid: [],
    pellets: new Set(),
    pacman: { x: 1, y: 1, dir: 'right', nextDir: 'right', strength: PACMAN_BASE_STRENGTH },
    enemies: [], // { id, species, x, y, strength, alive }
    items: [], // { x, y, kind, taken }
    hasCap: false,
    powerActive: false,
    powerTimer: 0, // segundos restantes
    activeSpecies: [], // ids das espécies da rodada
    fog: new Set(), // células cobertas pela névoa "agonia" ("x,y")
  })

  let loopHandle = null
  let lastTick = 0
  let fogOrigins = [] // pontos candidatos onde a névoa pode surgir
  let fogSpawnAcc = 0 // acumulador de tempo para spawn de névoa
  let fogPatches = [] // manchas ativas: { cells: string[], expiresAt }

  const totalPellets = computed(() => state.pellets.size)

  function loadRound(roundNumber) {
    const parsed = parseMaze()
    state.grid = parsed.grid
    state.pellets = parsed.pellets
    state.pacman.x = parsed.pacmanStart.x
    state.pacman.y = parsed.pacmanStart.y
    state.pacman.dir = 'right'
    state.pacman.nextDir = 'right'

    // powerup reseta a cada rodada
    state.hasCap = false
    state.powerActive = false
    state.powerTimer = 0
    state.items = parsed.items.map((i) => ({ ...i, taken: false }))

    // névoa "agonia" reseta a cada rodada
    fogOrigins = parsed.fogOrigins
    fogPatches = []
    fogSpawnAcc = 0
    state.fog = new Set()

    // até 3 espécies da rodada, distribuídas nos spawns
    const cfg = getRound(roundNumber)
    state.activeSpecies = cfg.species
    state.enemies = parsed.enemySpawns.map((spawn, i) => {
      const speciesId = cfg.species[i % cfg.species.length]
      const p = POKEMON[speciesId]
      return {
        id: `${speciesId}-${i}`,
        species: speciesId,
        x: spawn.x,
        y: spawn.y,
        strength: p.strength, // força atual (pode cair na névoa)
        maxStrength: p.strength, // força original da espec (para exibir % / recuperar)
        image: p.image, // sprite da PokeAPI (pode ser null -> fallback emoji)
        alive: true,
      }
    })
  }

  async function start() {
    state.status = 'running'
    state.round = 1
    state.score = 0
    state.lives = 3
    state.pacman.strength = PACMAN_BASE_STRENGTH

    // busca sprites/nomes reais da PokeAPI (tolerante a falha; força continua da espec)
    try {
      await hydratePokemonData()
    } catch {
      /* offline: segue com emojis de fallback */
    }

    loadRound(state.round)
    lastTick = performance.now()
    tickLoop()
  }

  function setDirection(dir) {
    if (!DIRS[dir]) return
    state.pacman.nextDir = dir
  }

  function canMove(x, y) {
    return !isWall(state.grid, x, y)
  }

  function movePacman() {
    const p = state.pacman
    // tenta virar na direção desejada
    const nd = DIRS[p.nextDir]
    if (nd && canMove(p.x + nd.x, p.y + nd.y)) {
      p.dir = p.nextDir
    }
    const d = DIRS[p.dir]
    let nx = p.x + d.x
    let ny = p.y + d.y

    // túnel horizontal (wrap nas bordas laterais)
    if (nx < 0) nx = COLS - 1
    if (nx >= COLS) nx = 0

    if (canMove(nx, ny)) {
      p.x = nx
      p.y = ny
    }

    collectAt(p.x, p.y)
  }

  function collectAt(x, y) {
    const key = `${x},${y}`
    // pastilha
    if (state.pellets.has(key)) {
      state.pellets.delete(key)
      state.score += 10
      if (state.pellets.size === 0) winRound()
    }
    // itens (boné / pokébola)
    const item = state.items.find((i) => !i.taken && i.x === x && i.y === y)
    if (item) collectItem(item)
  }

  /** Regra do powerup em 2 etapas. */
  function collectItem(item) {
    if (item.kind === 'cap') {
      item.taken = true
      state.hasCap = true
      state.score += 50
    } else if (item.kind === 'ball') {
      // pokébola só ativa se o boné já foi equipado
      if (!state.hasCap) return // sem boné, não faz nada (fica no mapa)
      item.taken = true
      activatePower()
    }
  }

  function activatePower() {
    state.powerActive = true
    state.powerTimer = POWERUP_DURATION
    state.score += 100
  }

  // ---- Névoa "agonia" (v1.2) ----
  // Surge periodicamente numa origem candidata, cobrindo a célula e as
  // células de caminho adjacentes. Enquanto um inimigo está sobre a névoa,
  // sua força é drenada a cada passo (com piso). A névoa some após um tempo.

  function neighborsPath(x, y) {
    const cells = [`${x},${y}`]
    for (const d of Object.values(DIRS)) {
      const nx = x + d.x
      const ny = y + d.y
      if (!isWall(state.grid, nx, ny)) cells.push(`${nx},${ny}`)
    }
    return cells
  }

  function spawnFog() {
    if (fogOrigins.length === 0) return
    const origin = fogOrigins[Math.floor(Math.random() * fogOrigins.length)]
    const cells = neighborsPath(origin.x, origin.y)
    fogPatches.push({ cells, expiresAt: performance.now() + FOG_LIFETIME_MS })
    rebuildFogSet()
  }

  function rebuildFogSet() {
    const set = new Set()
    for (const patch of fogPatches) for (const c of patch.cells) set.add(c)
    state.fog = set
  }

  function updateFog(dt) {
    // expira manchas antigas
    const now = performance.now()
    const before = fogPatches.length
    fogPatches = fogPatches.filter((p) => p.expiresAt > now)
    if (fogPatches.length !== before) rebuildFogSet()

    // spawn periódico
    fogSpawnAcc += dt
    if (fogSpawnAcc >= FOG_SPAWN_EVERY_MS) {
      fogSpawnAcc = 0
      spawnFog()
    }
  }

  /** Drena força dos inimigos que estão dentro da névoa (com piso). */
  function applyFogDrain() {
    if (state.fog.size === 0) return
    for (const e of state.enemies) {
      if (!e.alive) continue
      if (state.fog.has(`${e.x},${e.y}`)) {
        e.strength = Math.max(FOG_MIN_STRENGTH, e.strength - FOG_STRENGTH_DRAIN)
      }
    }
  }

  function moveEnemies() {
    for (const e of state.enemies) {
      if (!e.alive) continue
      // IA simples: escolhe uma direção válida aleatória, com viés a perseguir/fugir
      const options = Object.values(DIRS).filter((d) => canMove(e.x + d.x, e.y + d.y))
      if (options.length === 0) continue
      const dx = state.pacman.x - e.x
      const dy = state.pacman.y - e.y
      const chase = !state.powerActive // foge quando powerup ativo
      options.sort((a, b) => {
        const sa = a.x * Math.sign(dx) + a.y * Math.sign(dy)
        const sb = b.x * Math.sign(dx) + b.y * Math.sign(dy)
        return chase ? sb - sa : sa - sb
      })
      // 60% segue o melhor, 40% aleatório (evita travar)
      const pick = Math.random() < 0.6 ? options[0] : options[Math.floor(Math.random() * options.length)]
      e.x += pick.x
      e.y += pick.y
    }
  }

  /** Combate por hierarquia de força quando Pacman e inimigo se encontram. */
  function checkCollisions() {
    for (const e of state.enemies) {
      if (!e.alive) continue
      if (e.x !== state.pacman.x || e.y !== state.pacman.y) continue

      if (state.powerActive) {
        // com pokébola ativa: captura direto
        capture(e)
      } else {
        // sem powerup: decide pela força (hierarquia)
        const result = resolveCombat(state.pacman.strength, e.strength)
        if (result === 'win') {
          capture(e)
        } else {
          loseLife()
          return
        }
      }
    }
  }

  function capture(enemy) {
    enemy.alive = false
    state.score += 200
    state.pacman.strength += CAPTURE_STRENGTH_GAIN
    if (state.enemies.every((e) => !e.alive)) winRound()
  }

  function loseLife() {
    state.lives -= 1
    if (state.lives <= 0) {
      state.status = 'lost'
      stopLoop()
      return
    }
    // reposiciona o Pacman no início
    const parsed = parseMaze()
    state.pacman.x = parsed.pacmanStart.x
    state.pacman.y = parsed.pacmanStart.y
  }

  function winRound() {
    state.round += 1
    state.status = 'running'
    loadRound(state.round)
  }

  // Loop de jogo em passos discretos de grade (estilo arcade).
  const STEP_MS = 180
  let acc = 0

  function tickLoop() {
    loopHandle = requestAnimationFrame((now) => {
      const dt = now - lastTick
      lastTick = now
      acc += dt

      // powerup countdown
      if (state.powerActive) {
        state.powerTimer -= dt / 1000
        if (state.powerTimer <= 0) {
          state.powerActive = false
          state.powerTimer = 0
        }
      }

      // névoa "agonia": spawn/expiração acontece em tempo real (não por passo)
      if (state.status === 'running') updateFog(dt)

      while (acc >= STEP_MS) {
        acc -= STEP_MS
        if (state.status === 'running') {
          movePacman()
          moveEnemies()
          applyFogDrain()
          checkCollisions()
        }
      }

      if (state.status === 'running') tickLoop()
    })
  }

  function stopLoop() {
    if (loopHandle) cancelAnimationFrame(loopHandle)
    loopHandle = null
  }

  return {
    state: readonly(state),
    start,
    setDirection,
    stopLoop,
    totalPellets,
    POKEMON,
  }
}
