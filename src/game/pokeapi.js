/*
 * Serviço de integração com a PokeAPI (https://pokeapi.co).
 * Busca sprite oficial, nome e tipo de cada Pokémon.
 *
 * Observações de design:
 * - O jogo roda 100% client-side; as chamadas partem do browser.
 * - Resultados são cacheados em memória (e localStorage) para evitar refetch.
 * - Se a API estiver indisponível (offline), cai num fallback local para o
 *   jogo continuar jogável — a FORÇA nunca depende da API (vem da espec).
 */

const API_BASE = 'https://pokeapi.co/api/v2/pokemon'
const LS_KEY = 'pacmon:pokeapi-cache:v1'

// cache em memória
const memCache = new Map()

// hidrata cache a partir do localStorage (se existir)
try {
  const raw = localStorage.getItem(LS_KEY)
  if (raw) {
    const obj = JSON.parse(raw)
    for (const [k, v] of Object.entries(obj)) memCache.set(k, v)
  }
} catch {
  /* localStorage indisponível — segue só com cache em memória */
}

function persist() {
  try {
    const obj = Object.fromEntries(memCache.entries())
    localStorage.setItem(LS_KEY, JSON.stringify(obj))
  } catch {
    /* ignore */
  }
}

/**
 * Busca os dados de um Pokémon pela PokeAPI.
 * @param {string} nameOrId - nome (ex: 'pikachu') ou id numérico.
 * @returns {Promise<{name:string, sprite:string|null, types:string[], apiId:number}|null>}
 */
export async function fetchPokemon(nameOrId) {
  const key = String(nameOrId).toLowerCase()
  if (memCache.has(key)) return memCache.get(key)

  try {
    const res = await fetch(`${API_BASE}/${key}`)
    if (!res.ok) throw new Error(`PokeAPI ${res.status}`)
    const data = await res.json()

    const sprite =
      data.sprites?.other?.['official-artwork']?.front_default ||
      data.sprites?.front_default ||
      null

    const result = {
      name: capitalize(data.name),
      sprite,
      types: (data.types || []).map((t) => t.type.name),
      apiId: data.id,
    }
    memCache.set(key, result)
    persist()
    return result
  } catch (err) {
    console.warn(`[pokeapi] falha ao buscar "${key}":`, err.message)
    return null // deixa o chamador aplicar fallback
  }
}

/** Busca vários Pokémons em paralelo, tolerando falhas individuais. */
export async function fetchMany(names) {
  const entries = await Promise.all(
    names.map(async (n) => [String(n).toLowerCase(), await fetchPokemon(n)]),
  )
  return Object.fromEntries(entries)
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}
