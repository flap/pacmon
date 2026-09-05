/*
 * Dados de dominio do PacMon.
 * Hierarquia por FORCA: pokemons mais fortes derrotam os mais fracos.
 * A cada rodada, ate 3 especies diferentes podem aparecer como inimigos.
 *
 * v1.2: os campos name/type/sprite podem ser ENRIQUECIDOS via PokeAPI,
 * mas a FORCA (strength) permanece fixa conforme a especificacao.
 */

import { fetchMany } from './pokeapi.js'

export const POKEMON = {
  // apiName = nome usado na PokeAPI (bulbasaur, pikachu, ...)
  bulbasaur: { id: 'bulbasaur', apiName: 'bulbasaur', name: 'Bulbasaur', type: 'grass', strength: 50, sprite: '🌿', image: null },
  pikachu: { id: 'pikachu', apiName: 'pikachu', name: 'Pikachu', type: 'electric', strength: 80, sprite: '⚡', image: null },
  charizard: { id: 'charizard', apiName: 'charizard', name: 'Charizard', type: 'fire', strength: 100, sprite: '🔥', image: null },
  snorlax: { id: 'snorlax', apiName: 'snorlax', name: 'Snorlax', type: 'normal', strength: 150, sprite: '💤', image: null },
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

let hydrated = false

/**
 * Enriquece POKEMON com dados reais da PokeAPI (imagem, nome, tipo).
 * A FORCA nunca é alterada — vem da espec. Idempotente e tolerante a falha:
 * se a API falhar, mantém emoji/nome locais e o jogo segue.
 */
export async function hydratePokemonData() {
  if (hydrated) return POKEMON
  const names = POKEMON_LIST.map((p) => p.apiName)
  const data = await fetchMany(names)

  for (const p of POKEMON_LIST) {
    const api = data[p.apiName]
    if (api) {
      p.image = api.sprite || null
      p.name = api.name || p.name
      // usa o tipo real como rótulo se conhecido pelo design system
      if (api.types?.length) p.apiType = api.types[0]
    }
  }
  hydrated = true
  return POKEMON
}
