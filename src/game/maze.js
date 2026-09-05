/*
 * Labirinto do PacMon.
 * Legenda:
 *  1 = parede
 *  0 = caminho (com pastilha/ponto)
 *  C = boné do Ash (etapa 1 do powerup)
 *  B = pokébola (etapa 2 — só ativa se já tiver o boné)
 *  P = posição inicial do Pacman
 *  E = spawn de inimigo (Pokémon)
 */

export const MAZE = [
  '1111111111111111111',
  '1C00000001000000B01',
  '1011011101011101101',
  '1000000000000000001',
  '1011101111111011101',
  '1000001000001000001',
  '1111101110111011111',
  '1000000E010E0000001',
  '1011011101011101101',
  '10000000P0000000001',
  '1011011101011101101',
  '1000000E010E0000001',
  '1111101110111011111',
  '1000001000001000001',
  '1011101111111011101',
  '1000000000000000001',
  '1011011101011101101',
  '1B00000001000000C01',
  '1111111111111111111',
]

export const TILE = {
  WALL: '1',
  PATH: '0',
  CAP: 'C',
  BALL: 'B',
  PACMAN: 'P',
  ENEMY: 'E',
}

export const ROWS = MAZE.length
export const COLS = MAZE[0].length

/** Converte o mapa de strings numa matriz mutável de células. */
export function parseMaze() {
  const grid = []
  const pellets = new Set()
  let pacmanStart = { x: 1, y: 1 }
  const enemySpawns = []
  const items = [] // { x, y, kind: 'cap' | 'ball' }

  for (let y = 0; y < ROWS; y++) {
    const row = []
    for (let x = 0; x < COLS; x++) {
      const ch = MAZE[y][x]
      if (ch === TILE.WALL) {
        row.push(1)
      } else {
        row.push(0)
        // toda célula de caminho ganha uma pastilha, exceto onde há entidade
        if (ch === TILE.PATH) pellets.add(`${x},${y}`)
        if (ch === TILE.PACMAN) pacmanStart = { x, y }
        if (ch === TILE.ENEMY) enemySpawns.push({ x, y })
        if (ch === TILE.CAP) items.push({ x, y, kind: 'cap' })
        if (ch === TILE.BALL) items.push({ x, y, kind: 'ball' })
      }
    }
    grid.push(row)
  }

  return { grid, pellets, pacmanStart, enemySpawns, items }
}

export function isWall(grid, x, y) {
  if (y < 0 || y >= ROWS || x < 0 || x >= COLS) return true
  return grid[y][x] === 1
}
