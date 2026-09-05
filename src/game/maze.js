/*
 * Labirinto do PacMon (v1.2 — tabuleiro maior).
 * Grade estritamente retangular: todas as linhas com a MESMA largura.
 * Legenda:
 *  1 = parede
 *  0 = caminho (com pastilha/ponto)
 *  C = boné do Ash (etapa 1 do powerup)
 *  B = pokébola (etapa 2 — só ativa se já tiver o boné)
 *  P = posição inicial do Pacman
 *  E = spawn de inimigo (Pokémon)
 *  F = ponto de origem candidato para a névoa "agonia"
 */

export const MAZE = [
  '1111111111111111111111111111',
  '1C000000000000000000000000C1',
  '1011110111110110111110111101',
  '1000000000000000000000000001',
  '1011110110111111110110111101',
  '1000000110000FF0000110000001',
  '1111110111110110111110111111',
  '1000000000000EE0000000000001',
  '1011110110111111110110111101',
  '1B00000110000000000110000001',
  '1011110110111111110110111101',
  '1000000000000FF0000000000001',
  '1011110111110110111110111101',
  '10000000000000P0000000000001',
  '1011110111110110111110111101',
  '1000000000000FF0000000000001',
  '1011110110111111110110111101',
  '1000000110000000000110000001',
  '1011110110111111110110111101',
  '1000000000000EE0000000000001',
  '1111110111110110111110111111',
  '1000000110000FF0000110000001',
  '1011110110111111110110111101',
  '1000000000000000000000000001',
  '1011110111110110111110111101',
  '1C000000000000000000000000B1',
  '1111111111111111111111111111',
]

export const TILE = {
  WALL: '1',
  PATH: '0',
  CAP: 'C',
  BALL: 'B',
  PACMAN: 'P',
  ENEMY: 'E',
  FOG: 'F',
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
  const fogOrigins = [] // { x, y } — pontos candidatos para a névoa surgir

  for (let y = 0; y < ROWS; y++) {
    const row = []
    for (let x = 0; x < COLS; x++) {
      const ch = MAZE[y][x]
      if (ch === TILE.WALL) {
        row.push(1)
      } else {
        row.push(0)
        if (ch === TILE.PATH) pellets.add(`${x},${y}`)
        if (ch === TILE.PACMAN) pacmanStart = { x, y }
        if (ch === TILE.ENEMY) enemySpawns.push({ x, y })
        if (ch === TILE.CAP) items.push({ x, y, kind: 'cap' })
        if (ch === TILE.BALL) items.push({ x, y, kind: 'ball' })
        if (ch === TILE.FOG) fogOrigins.push({ x, y })
      }
    }
    grid.push(row)
  }

  if (enemySpawns.length === 0) enemySpawns.push({ x: pacmanStart.x, y: pacmanStart.y - 1 })
  if (fogOrigins.length === 0) fogOrigins.push({ x: pacmanStart.x, y: pacmanStart.y })

  return { grid, pellets, pacmanStart, enemySpawns, items, fogOrigins }
}

export function isWall(grid, x, y) {
  if (y < 0 || y >= ROWS || x < 0 || x >= COLS) return true
  return grid[y][x] === 1
}
