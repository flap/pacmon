# PacMon — Design System

Design system do jogo **Pacman com Pokémons**. Tema arcade retrô cruzado com o universo Pokémon. Todos os tokens são CSS custom properties com prefixo `--pm-*`; classes utilitárias e componentes usam prefixo `pm-` / `Pm`.

## Arquivos

| Arquivo | Papel |
|---------|-------|
| `src/design-system/tokens.css` | Fonte única da verdade dos tokens (cores, tipografia, espaçamento, sombras, z-index, animação) |
| `src/design-system/base.css` | Reset, importa tokens + fonte arcade, utilitários de layout e acessibilidade |
| `src/components/ui/*` | Componentes de UI reutilizáveis |

Importe uma vez em `src/main.js`:

```js
import '@/design-system/base.css'
```

## Princípios

1. **Token primeiro** — nunca use cor/tamanho literal em componente; use `var(--pm-*)`.
2. **Arcade legível** — a fonte display (`Press Start 2P`) é forte, mas custa legibilidade: use só em títulos, HUD e números grandes. Texto corrido usa a fonte body.
3. **Contraste alto** — texto claro sobre superfícies escuras (fundo de labirinto).
4. **Acessível** — foco visível, respeito a `prefers-reduced-motion`, alvos de toque adequados.

## Paleta

### Marca
- `--pm-color-pacman` `#ffd23f` — amarelo Pacman (jogador, destaques)
- `--pm-color-pokeball-red` `#ee1515` — vermelho pokébola (powerup ativo)
- `--pm-color-ash-blue` `#3b5ba5` — azul do boné do Ash (pré-powerup)

### Tipos de Pokémon (badges e barras de força)
- `--pm-type-grass` `#78c850` (Bulbasaur)
- `--pm-type-fire` `#f08030` (Charizard)
- `--pm-type-electric` `#f8d030` (Pikachu)
- `--pm-type-normal` `#a8a878` (Snorlax)
- `--pm-type-water`, `--pm-type-psychic`

### Superfícies
- `--pm-bg-void` fundo geral · `--pm-bg-board` tabuleiro · `--pm-wall` parede · `--pm-surface` / `--pm-surface-raised` painéis

### Feedback
- `--pm-success` · `--pm-warning` · `--pm-danger` · `--pm-info`

## Tipografia

- Display: `var(--pm-font-display)` — arcade, títulos/HUD.
- Body: `var(--pm-font-body)` — texto corrido.
- Escala: `--pm-fs-xs` (10px) → `--pm-fs-2xl` (48px).

## Espaçamento

Escala base de 4px: `--pm-space-1` (4px) … `--pm-space-12` (48px). Use sempre múltiplos da escala.

## Raio e sombra

- Raio: `--pm-radius-sm/md/lg/pill`.
- Sombra: `--pm-shadow-sm/md/lg`.
- Brilho temático: `--pm-glow-pacman`, `--pm-glow-pokeball`, `--pm-glow-power`.

## Utilitários (base.css)

- `.pm-display` — aplica fonte arcade.
- `.pm-stack` / `.pm-row` / `.pm-center` — layouts flex comuns.
- `.pm-text-secondary` / `.pm-text-muted` — cor de texto.
- `.pm-visually-hidden` — esconde visualmente mantendo em leitores de tela.

## Componentes

| Componente | Uso |
|-----------|-----|
| `PmButton` | Ações (start, restart). Variantes: `primary`, `danger`, `ghost`. |
| `PmBadge` | Rótulo de tipo/força de Pokémon. Prop `type` mapeia cor de tipo. |
| `PmPanel` | Card/painel de superfície elevada. |
| `PmStat` | Item de HUD (label + valor grande em fonte arcade). |
| `PmPowerupIndicator` | Estado do powerup em 2 etapas: boné do Ash → pokébola. |

### Convenção de props
- Variantes por string (`variant="primary"`).
- Tamanhos por string (`size="sm|md|lg"`).
- Eventos nativos repassados (`@click`).

## Regras de jogo refletidas na UI

- **Combate por hierarquia (força):** o HUD mostra a força atual do Pacman (`PmStat`). Cada Pokémon inimigo exibe sua força via `PmBadge`. Confronto: maior força vence.
- **Powerup em 2 etapas:** `PmPowerupIndicator` mostra primeiro o slot do **boné** (azul Ash). Só depois de equipar o boné o slot da **pokébola** fica ativável (vermelho). Pokébola sem boné = inativa (visualmente esmaecida).
- **Até 3 espécies por rodada:** o HUD pode listar até 3 `PmBadge` representando as espécies ativas na rodada.
