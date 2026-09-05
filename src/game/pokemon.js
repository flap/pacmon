/*
 * Dados de dominio do PacMon.
 * Hierarquia por FORCA: pokemons mais fortes derrotam os mais fracos.
 * A cada rodada, ate 3 especies diferentes podem aparecer como inimigos.
 */

export const POKEMON = {
  bulbasaur: { id: 'bulbasaur', name: 'Bulbasaur', type: 'grass', strength: 50, sprite: '🌿' },
  pikachu: { id: 'pikachu', name: 'Pikachu', type: 'electric', strength: 80, sprite: '⚡' },
  charizard: { id: 'charizard', name: 'Charizard', type: 'fire', strength: 100, sprite: '🔥' },
  snorlax: { id: 'snorlax', name: 'Snorlax', type: 'normal', strength: 150, sprite: '💤' },
}

export const POKEMON_LIST = Object.values(POKEMON)

/** Força inicial do Pacman (jogador). Sobe a cada captura. */
export const PACMAN_BASE_STRENGTH = 60

/** Quanto de força o Pacman ganha ao capturar um Pokémon. */
export const CAPTURE_STRENGTH_GAIN = 25

/** Duração do powerup (pokébola ativa), em segundos. */
export const POWERUP_DURATION = 8

/**
 * Configuração das rodadas. `species` lista até 3 ids de POKEMON.
 * Rodadas mais avançadas trazem espécies mais fortes.
 */
export const ROUNDS = [
  { round: 1, species: ['bulbasaur', 'pikachu'] },
  { round: 2, species: ['bulbasaur', 'pikachu', 'charizard'] },
  { round: 3, species: ['pikachu', 'charizard', 'snorlax'] },
]

/** Retorna a config da rodada (faz wrap se passar do fim, aumentando dificuldade). */
export function getRound(roundNumber) {
  const idx = (roundNumber - 1) % ROUNDS.length
  return ROUNDS[idx]
}

/** Resolve o resultado de um confronto entre duas forças. */
export function resolveCombat(attackerStrength, defenderStrength) {
  if (attackerStrength > defenderStrength) return 'win'
  if (attackerStrength < defenderStrength) return 'lose'
  return 'draw'
}
