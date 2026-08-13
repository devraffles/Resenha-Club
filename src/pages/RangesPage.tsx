import { useState, useMemo } from "react"
import {
  Box, VStack, HStack, Text, Heading, Flex, Grid, Badge
} from "@chakra-ui/react"
import { buildRangeGrid, getDefaultRange, RANGE_COLORS, type Position, type RangeType, RANKS } from "../lib/poker"

const POSITIONS: Position[] = ["UTG", "UTG+1", "UTG+2", "HJ", "CO", "BTN", "SB", "BB"]

const SCENARIOS = ["RFI", "3bet", "coldcall"] as const
type Scenario = typeof SCENARIOS[number]

const POSITION_COLORS: Record<Position, string> = {
  UTG: "#EF4444", "UTG+1": "#F97316", "UTG+2": "#EAB308",
  HJ: "#22C55E", CO: "#3B82F6", BTN: "#A855F7", SB: "#EC4899", BB: "#14B8A6"
}

export function RangesPage() {
  const [position, setPosition] = useState<Position>("BTN")
  const [scenario, setScenario] = useState<Scenario>("RFI")
  const [hoveredHand, setHoveredHand] = useState<string | null>(null)
  const [customRange, setCustomRange] = useState<Record<string, RangeType>>({})
  const [editMode, setEditMode] = useState(false)
  const [brushType, setBrushType] = useState<RangeType>("raise")

  const grid = useMemo(() => buildRangeGrid(), [])
  const defaultRange = useMemo(() => getDefaultRange(position, scenario as "RFI"), [position, scenario])

  const displayRange = editMode
    ? { ...defaultRange, ...customRange }
    : defaultRange

  const counts = useMemo(() => {
    const c: Record<RangeType, number> = { raise: 0, call: 0, "3bet": 0, allin: 0, fold: 0 }
    for (const v of Object.values(displayRange)) c[v]++
    return c
  }, [displayRange])

  const totalHands = RANKS.length * RANKS.length
  const handCount = totalHands - counts.fold

  function handleCellClick(hand: string) {
    if (!editMode) return
    setCustomRange(prev => ({
      ...prev,
      [hand]: prev[hand] === brushType ? "fold" : brushType,
    }))
  }

  const rangeLabels: Record<RangeType, string> = {
    raise: "Raise/Open",
    call: "Call",
    "3bet": "3-Bet",
    allin: "All-In",
    fold: "Fold",
  }

  return (
    <Box>
      <HStack justify="space-between" align="start" mb="6" flexWrap="wrap" gap="3">
        <Box>
          <Heading size="xl" fontWeight="black" color="white" mb="1">Visualização de Ranges</Heading>
          <Text color="gray.400" fontSize="sm">Explore ranges GTO pré-flop por posição e cenário</Text>
        </Box>
        <Box
          as="button"
          px="4" py="2" rounded="lg" fontSize="sm" fontWeight="semibold"
          borderWidth="1px"
          borderColor={editMode ? "gold.400" : "rgba(139,47,201,0.3)"}
          bg={editMode ? "rgba(245,158,11,0.15)" : "rgba(139,47,201,0.1)"}
          color={editMode ? "gold.400" : "gray.300"}
          onClick={() => setEditMode(!editMode)}
          transition="all 0.2s"
        >
          {editMode ? "✓ Modo Edição" : "✏ Editar Range"}
        </Box>
      </HStack>

      {/* Controls */}
      <Flex gap="4" mb="6" flexWrap="wrap">
        <Box>
          <Text fontSize="xs" color="gray.400" mb="2" textTransform="uppercase" letterSpacing="wide">Posição</Text>
          <HStack gap="2" flexWrap="wrap">
            {POSITIONS.map(pos => (
              <Box
                key={pos}
                as="button"
                px="3" py="2" rounded="lg" fontSize="xs" fontWeight="bold"
                cursor="pointer"
                borderWidth="1px"
                transition="all 0.15s"
                borderColor={position === pos ? POSITION_COLORS[pos] : "rgba(139,47,201,0.2)"}
                bg={position === pos ? `${POSITION_COLORS[pos]}22` : "rgba(26,0,48,0.5)"}
                color={position === pos ? POSITION_COLORS[pos] : "gray.400"}
                onClick={() => setPosition(pos)}
              >
                {pos}
              </Box>
            ))}
          </HStack>
        </Box>
        <Box>
          <Text fontSize="xs" color="gray.400" mb="2" textTransform="uppercase" letterSpacing="wide">Cenário</Text>
          <HStack gap="2">
            {SCENARIOS.map(s => (
              <Box
                key={s}
                as="button"
                px="3" py="2" rounded="lg" fontSize="xs" fontWeight="bold"
                cursor="pointer"
                borderWidth="1px"
                transition="all 0.15s"
                borderColor={scenario === s ? "gold.400" : "rgba(139,47,201,0.2)"}
                bg={scenario === s ? "rgba(245,158,11,0.15)" : "rgba(26,0,48,0.5)"}
                color={scenario === s ? "gold.400" : "gray.400"}
                onClick={() => setScenario(s)}
              >
                {s}
              </Box>
            ))}
          </HStack>
        </Box>
      </Flex>

      {/* Edit mode brush */}
      {editMode && (
        <Box mb="4" p="3" rounded="xl" bg="rgba(245,158,11,0.08)" borderWidth="1px" borderColor="rgba(245,158,11,0.2)">
          <Text fontSize="xs" color="gold.400" mb="2" fontWeight="semibold">Pincel Ativo:</Text>
          <HStack gap="2" flexWrap="wrap">
            {(["raise", "call", "3bet", "allin", "fold"] as RangeType[]).map(t => (
              <Box
                key={t}
                as="button"
                px="3" py="1.5" rounded="lg" fontSize="xs" fontWeight="semibold"
                cursor="pointer"
                borderWidth="1px"
                transition="all 0.15s"
                borderColor={brushType === t ? RANGE_COLORS[t] : "rgba(139,47,201,0.2)"}
                bg={brushType === t ? `${RANGE_COLORS[t]}33` : "transparent"}
                style={{ color: brushType === t ? RANGE_COLORS[t] : "#9CA3AF" }}
                onClick={() => setBrushType(t)}
              >
                {rangeLabels[t]}
              </Box>
            ))}
          </HStack>
        </Box>
      )}

      <Flex gap="6" flexDir={{ base: "column", xl: "row" }}>
        {/* Range grid */}
        <Box flex="1">
          <Box
            p={{ base: "3", md: "5" }}
            rounded="2xl"
            bg="rgba(26,0,48,0.8)"
            borderWidth="1px"
            borderColor="rgba(139,47,201,0.2)"
            overflowX="auto"
          >
            {/* Column headers */}
            <Grid
              templateColumns={`40px repeat(${RANKS.length}, 1fr)`}
              gap="0.5"
              mb="0.5"
            >
              <Box />
              {RANKS.map(r => (
                <Box key={r} textAlign="center" py="1">
                  <Text fontSize="2xs" color="gray.500" fontWeight="bold">{r}</Text>
                </Box>
              ))}
            </Grid>

            {grid.map((row, i) => (
              <Grid
                key={i}
                templateColumns={`40px repeat(${RANKS.length}, 1fr)`}
                gap="0.5"
                mb="0.5"
              >
                <Box display="flex" alignItems="center" justifyContent="center" py="1">
                  <Text fontSize="2xs" color="gray.500" fontWeight="bold">{RANKS[i]}</Text>
                </Box>
                {row.map((hand, j) => {
                  const type = displayRange[hand] ?? "fold"
                  const isPair = i === j
                  const isSuited = i < j
                  const isHovered = hoveredHand === hand
                  return (
                    <Box
                      key={j}
                      rounded="sm"
                      cursor={editMode ? "pointer" : "default"}
                      transition="all 0.1s"
                      position="relative"
                      onMouseEnter={() => setHoveredHand(hand)}
                      onMouseLeave={() => setHoveredHand(null)}
                      onClick={() => handleCellClick(hand)}
                      style={{
                        background: type === "fold"
                          ? "rgba(26,0,48,0.5)"
                          : `${RANGE_COLORS[type]}${type !== "fold" ? "CC" : "22"}`,
                        border: isHovered ? `1px solid ${type === "fold" ? "#6A0F91" : RANGE_COLORS[type]}` : "1px solid transparent",
                        transform: isHovered ? "scale(1.15)" : "scale(1)",
                        zIndex: isHovered ? 10 : 1,
                      }}
                      aspectRatio="square"
                      minH="0"
                    >
                      <Flex h="full" align="center" justify="center" p="0.5" minH="20px">
                        <Text
                          fontSize={{ base: "2xs", md: "xs" }}
                          fontWeight={isPair ? "black" : "medium"}
                          color={type === "fold" ? "gray.600" : "white"}
                          lineHeight="1"
                          whiteSpace="nowrap"
                          overflow="hidden"
                        >
                          {hand.length <= 3 ? hand : hand.slice(0, 3)}
                        </Text>
                      </Flex>
                    </Box>
                  )
                })}
              </Grid>
            ))}
          </Box>
        </Box>

        {/* Legend & stats */}
        <VStack w={{ base: "full", xl: "220px" }} gap="4" align="stretch" flexShrink="0">
          <Box p="5" rounded="2xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
            <Text fontWeight="bold" color="white" mb="4" fontSize="sm">Legenda</Text>
            <VStack gap="2" align="stretch">
              {(Object.entries(RANGE_COLORS) as [RangeType, string][]).map(([type, color]) => {
                if (type === "fold") return null
                return (
                  <HStack key={type} gap="3">
                    <Box w="4" h="4" rounded="sm" style={{ background: color }} />
                    <Text flex="1" fontSize="xs" color="gray.300">{rangeLabels[type]}</Text>
                    <Text fontSize="xs" color="gray.500">{counts[type]}</Text>
                  </HStack>
                )
              })}
              <HStack gap="3">
                <Box w="4" h="4" rounded="sm" bg="rgba(26,0,48,0.5)" border="1px solid rgba(106,15,145,0.3)" />
                <Text flex="1" fontSize="xs" color="gray.300">Fold</Text>
                <Text fontSize="xs" color="gray.500">{counts.fold}</Text>
              </HStack>
            </VStack>
          </Box>

          <Box p="5" rounded="2xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
            <Text fontWeight="bold" color="white" mb="4" fontSize="sm">Estatísticas</Text>
            <VStack gap="3" align="stretch">
              <Box>
                <Flex justify="space-between" mb="1">
                  <Text fontSize="xs" color="gray.400">Mãos no Range</Text>
                  <Text fontSize="xs" color="white" fontWeight="bold">{handCount}/{totalHands}</Text>
                </Flex>
                <Box w="full" h="2" rounded="full" bg="rgba(139,47,201,0.2)" overflow="hidden">
                  <Box
                    h="full" rounded="full"
                    css={{ background: "linear-gradient(90deg, #8B2FC9, #F59E0B)" }}
                    style={{ width: `${(handCount / totalHands) * 100}%` }}
                    transition="width 0.3s"
                  />
                </Box>
              </Box>
              <Flex justify="space-between">
                <Text fontSize="xs" color="gray.400">Cobertura</Text>
                <Text fontSize="xs" color="white" fontWeight="bold">
                  {((handCount / totalHands) * 100).toFixed(1)}%
                </Text>
              </Flex>
              <Box p="3" rounded="lg" bg="rgba(139,47,201,0.1)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
                <Text fontSize="xs" color="purple.300" fontWeight="semibold" mb="1">
                  {position} - {scenario}
                </Text>
                <Text fontSize="2xs" color="gray.400">
                  {handCount} combinações entram neste range
                </Text>
              </Box>
            </VStack>
          </Box>

          {hoveredHand && (
            <Box
              p="4" rounded="2xl"
              bg="rgba(245,158,11,0.1)"
              borderWidth="1px" borderColor="rgba(245,158,11,0.3)"
              animationName="fade-in"
              animationDuration="fast"
            >
              <Text fontWeight="bold" color="gold.400" fontSize="md" mb="1">{hoveredHand}</Text>
              <Badge
                style={{
                  background: `${RANGE_COLORS[displayRange[hoveredHand] ?? "fold"]}33`,
                  color: RANGE_COLORS[displayRange[hoveredHand] ?? "fold"],
                  border: `1px solid ${RANGE_COLORS[displayRange[hoveredHand] ?? "fold"]}`,
                }}
                fontSize="xs"
              >
                {rangeLabels[displayRange[hoveredHand] ?? "fold"]}
              </Badge>
            </Box>
          )}
        </VStack>
      </Flex>
    </Box>
  )
}
