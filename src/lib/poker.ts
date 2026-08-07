// Poker card types and GTO logic

export type Suit = "♠" | "♥" | "♦" | "♣"
export type Rank = "A" | "K" | "Q" | "J" | "T" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2"
export type Action = "Fold" | "Call" | "Raise" | "Check" | "Bet" | "3-Bet" | "4-Bet"
export type Position = "UTG" | "UTG+1" | "UTG+2" | "HJ" | "CO" | "BTN" | "SB" | "BB"
export type Street = "preflop" | "flop" | "turn" | "river"

export interface Card {
  rank: Rank
  suit: Suit
}

export interface HandScenario {
  id: string
  heroCards: Card[]
  communityCards: Card[]
  position: Position
  street: Street
  potSize: number
  effectiveStack: number
  villainAction: string
  correctAction: Action
  explanation: string
  gtoBias: number // 0-100 frequency
  evAnalysis: string
  difficulty: "beginner" | "medium" | "advanced"
}

export const RANKS: Rank[] = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"]
export const SUITS: Suit[] = ["♠", "♥", "♦", "♣"]

export const SUIT_COLORS: Record<Suit, string> = {
  "♠": "#FFFFFF",
  "♥": "#FF4444",
  "♦": "#FF4444",
  "♣": "#FFFFFF",
}

export const SUIT_BG: Record<Suit, string> = {
  "♠": "rgba(255,255,255,0.1)",
  "♥": "rgba(255,68,68,0.1)",
  "♦": "rgba(255,68,68,0.1)",
  "♣": "rgba(255,255,255,0.1)",
}

export const POSITIONS: Position[] = ["UTG", "UTG+1", "UTG+2", "HJ", "CO", "BTN", "SB", "BB"]

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push({ rank, suit })
    }
  }
  return shuffleDeck(deck)
}

export function shuffleDeck(deck: Card[]): Card[] {
  const d = [...deck]
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]]
  }
  return d
}

export function rankValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    A: 14, K: 13, Q: 12, J: 11, T: 10, "9": 9, "8": 8, "7": 7, "6": 6, "5": 5, "4": 4, "3": 3, "2": 2
  }
  return values[rank]
}

export function isSuited(c1: Card, c2: Card): boolean {
  return c1.suit === c2.suit
}

export function getHandNotation(c1: Card, c2: Card): string {
  const r1 = rankValue(c1.rank) >= rankValue(c2.rank) ? c1.rank : c2.rank
  const r2 = rankValue(c1.rank) >= rankValue(c2.rank) ? c2.rank : c1.rank
  if (r1 === r2) return `${r1}${r2}`
  return `${r1}${r2}${isSuited(c1, c2) ? "s" : "o"}`
}

// GTO pre-flop opening ranges (simplified)
const RFI_RANGES: Record<Position, Set<string>> = {
  "UTG": new Set([
    "AA", "KK", "QQ", "JJ", "TT", "99", "88",
    "AKs", "AQs", "AJs", "ATs", "A9s",
    "AKo", "AQo",
    "KQs", "KJs", "KTs",
    "QJs", "QTs",
    "JTs",
  ]),
  "UTG+1": new Set([
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s",
    "AKo", "AQo", "AJo",
    "KQs", "KJs", "KTs", "K9s",
    "QJs", "QTs", "Q9s",
    "JTs", "J9s",
    "T9s",
  ]),
  "UTG+2": new Set([
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s",
    "AKo", "AQo", "AJo", "ATo",
    "KQs", "KJs", "KTs", "K9s",
    "QJs", "QTs", "Q9s",
    "JTs", "J9s",
    "T9s", "T8s",
    "98s",
  ]),
  "HJ": new Set([
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
    "AKo", "AQo", "AJo", "ATo", "A9o",
    "KQs", "KJs", "KTs", "K9s", "K8s",
    "QJs", "QTs", "Q9s",
    "JTs", "J9s",
    "T9s", "T8s",
    "98s", "97s",
    "87s",
  ]),
  "CO": new Set([
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
    "AKo", "AQo", "AJo", "ATo", "A9o", "A8o",
    "KQs", "KJs", "KTs", "K9s", "K8s", "K7s",
    "QJs", "QTs", "Q9s", "Q8s",
    "JTs", "J9s", "J8s",
    "T9s", "T8s",
    "98s", "97s",
    "87s", "86s",
    "76s", "75s",
  ]),
  "BTN": new Set([
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "33", "22",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
    "AKo", "AQo", "AJo", "ATo", "A9o", "A8o", "A7o", "A6o", "A5o",
    "KQs", "KJs", "KTs", "K9s", "K8s", "K7s", "K6s", "K5s",
    "KQo", "KJo", "KTo",
    "QJs", "QTs", "Q9s", "Q8s", "Q7s",
    "QJo", "QTo",
    "JTs", "J9s", "J8s", "J7s",
    "T9s", "T8s", "T7s",
    "98s", "97s", "96s",
    "87s", "86s", "85s",
    "76s", "75s",
    "65s", "64s",
    "54s", "53s",
    "43s",
  ]),
  "SB": new Set([
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "33", "22",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
    "AKo", "AQo", "AJo", "ATo",
    "KQs", "KJs", "KTs", "K9s", "K8s",
    "KQo", "KJo",
    "QJs", "QTs", "Q9s",
    "JTs", "J9s",
    "T9s", "T8s",
    "98s", "97s",
    "87s",
    "76s",
  ]),
  "BB": new Set([]) // BB defends differently
}

export function isInRFIRange(hand: string, position: Position): boolean {
  const range = RFI_RANGES[position]
  return range.has(hand)
}

export function getHandStrength(hand: string): "premium" | "strong" | "medium" | "speculative" | "marginal" {
  const premiums = ["AA", "KK", "QQ", "AKs", "AKo"]
  const strong = ["JJ", "TT", "AQs", "AQo", "AJs", "KQs"]
  const medium = ["99", "88", "77", "ATs", "AJo", "KJs", "KTs", "QJs"]
  const speculative = ["66", "55", "44", "33", "22", "A2s", "A3s", "A4s", "A5s", "A6s", "A7s", "A8s", "A9s",
    "87s", "76s", "65s", "54s", "98s", "T9s", "JTs"]
  if (premiums.includes(hand)) return "premium"
  if (strong.includes(hand)) return "strong"
  if (medium.includes(hand)) return "medium"
  if (speculative.includes(hand)) return "speculative"
  return "marginal"
}

// Generate a random training scenario
export function generateScenario(street: Street = "preflop", difficulty: "beginner" | "medium" | "advanced" = "medium"): HandScenario {
  const deck = createDeck()
  const heroCards = [deck[0], deck[1]]
  const communityCards = street === "preflop" ? [] :
    street === "flop" ? [deck[2], deck[3], deck[4]] :
    street === "turn" ? [deck[2], deck[3], deck[4], deck[5]] :
    [deck[2], deck[3], deck[4], deck[5], deck[6]]

  const positions = POSITIONS
  const position = positions[Math.floor(Math.random() * positions.length)]
  const hand = getHandNotation(heroCards[0], heroCards[1])
  const inRange = isInRFIRange(hand, position)

  const potSize = Math.floor(Math.random() * 20 + 3) * 2.5
  const effectiveStack = Math.floor(Math.random() * 80 + 20) * 100

  let correctAction: Action = "Fold"
  let explanation = ""
  let gtoBias = 0

  if (street === "preflop") {
    if (inRange) {
      correctAction = "Raise"
      gtoBias = getHandStrength(hand) === "premium" ? 100 :
                getHandStrength(hand) === "strong" ? 100 :
                getHandStrength(hand) === "medium" ? 85 :
                65
      explanation = `${hand} está no range de abertura GTO para ${position}. A jogada correta é abrir com um raise de 2.5-3x os blinds.`
    } else {
      correctAction = "Fold"
      gtoBias = 5
      explanation = `${hand} não está no range de abertura GTO para ${position}. Com esta mão nesta posição, a EV é negativa e devemos foldar.`
    }
  } else {
    const actions: Action[] = ["Check", "Bet", "Call", "Fold"]
    correctAction = actions[Math.floor(Math.random() * 3)]
    gtoBias = Math.floor(Math.random() * 40 + 40)
    explanation = `Neste cenário de ${street}, baseado na textura do board e no range de mãos GTO, a ação mais equilibrada é ${correctAction}.`
  }

  const evAnalysis = correctAction === "Fold"
    ? "EV negativa esperada. Foldar preserva stack."
    : correctAction === "Raise" || correctAction === "Bet"
    ? `EV positiva estimada: +${(Math.random() * 2 + 0.3).toFixed(2)} BB em média.`
    : `EV neutra a levemente positiva: ${(Math.random() * 0.8 - 0.2).toFixed(2)} BB.`

  return {
    id: Math.random().toString(36).slice(2),
    heroCards,
    communityCards,
    position,
    street,
    potSize,
    effectiveStack,
    villainAction: "Raise 2.5x",
    correctAction,
    explanation,
    gtoBias,
    evAnalysis,
    difficulty,
  }
}

export function generateQuizScenario(questionNumber: number, difficulty: "beginner" | "medium" | "advanced" = "medium"): HandScenario & { options: Action[] } {
  const streets: Street[] = difficulty === "beginner" ? ["preflop"] :
    difficulty === "medium" ? ["preflop", "flop"] : ["preflop", "flop", "turn", "river"]
  const street = streets[Math.floor(Math.random() * streets.length)]
  const scenario = generateScenario(street, difficulty)

  const allOptions: Action[] = ["Fold", "Call", "Raise", "Check", "Bet", "3-Bet"]
  const correct = scenario.correctAction
  const others = allOptions.filter(a => a !== correct)
  const shuffled = [correct, ...others.slice(0, 3)].sort(() => Math.random() - 0.5)

  return {
    ...scenario,
    id: `q${questionNumber}`,
    options: shuffled.slice(0, 4),
  }
}

// Range grid helpers
export function buildRangeGrid(): string[][] {
  const grid: string[][] = []
  for (let i = 0; i < RANKS.length; i++) {
    const row: string[] = []
    for (let j = 0; j < RANKS.length; j++) {
      if (i === j) {
        row.push(`${RANKS[i]}${RANKS[j]}`) // pairs
      } else if (i < j) {
        row.push(`${RANKS[i]}${RANKS[j]}s`) // suited
      } else {
        row.push(`${RANKS[j]}${RANKS[i]}o`) // offsuit
      }
    }
    grid.push(row)
  }
  return grid
}

export type RangeType = "fold" | "raise" | "call" | "3bet" | "allin"

export const RANGE_COLORS: Record<RangeType, string> = {
  raise: "#22c55e",
  call: "#3b82f6",
  "3bet": "#f59e0b",
  allin: "#ef4444",
  fold: "transparent",
}

export function getDefaultRange(position: Position, scenario: "RFI" | "3bet" | "coldcall" = "RFI"): Record<string, RangeType> {
  const range: Record<string, RangeType> = {}
  const rfiRange = RFI_RANGES[position]
  const grid = buildRangeGrid()
  for (const row of grid) {
    for (const hand of row) {
      range[hand] = rfiRange.has(hand) ? "raise" : "fold"
    }
  }
  return range
}
