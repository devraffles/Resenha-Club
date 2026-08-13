import { useState, useEffect, useCallback } from "react"
import {
  Box, VStack, HStack, Text, Heading, Flex, Icon, Button, Badge,
  Grid, Select as ChakraSelect, createListCollection
} from "@chakra-ui/react"
import { LuPlay, LuRefreshCw, LuCheck, LuX, LuChevronUp, LuInfo, LuTarget, LuFlame } from "react-icons/lu"
import { useAuth } from "../lib/auth"
import { supabase } from "../lib/supabase"
import {
  generateScenario, SUIT_COLORS, POSITIONS, type HandScenario, type Action, type Street, type Position
} from "../lib/poker"

function PokerCard({ rank, suit, faceDown = false, delay = 0 }: {
  rank: string; suit: string; faceDown?: boolean; delay?: number
}) {
  const color = SUIT_COLORS[suit as keyof typeof SUIT_COLORS] ?? "#FFFFFF"
  return (
    <Box
      w={{ base: "44px", md: "52px" }}
      h={{ base: "64px", md: "76px" }}
      rounded="lg"
      border="2px solid"
      display="flex"
      flexDir="column"
      alignItems="center"
      justifyContent="space-between"
      p="1.5"
      position="relative"
      overflow="hidden"
      animationName="dealCard"
      animationDuration="0.4s"
      animationTimingFunction="ease-out"
      animationFillMode="both"
      css={{ animationDelay: `${delay}ms` }}
      bg={faceDown
        ? "linear-gradient(135deg, #2D0050, #4A0072)"
        : "linear-gradient(145deg, #1A0030, #0D0118)"
      }
      borderColor={faceDown ? "rgba(139,47,201,0.4)" : "rgba(255,255,255,0.15)"}
      shadow={faceDown ? "none" : `0 4px 16px ${color}22, 0 0 8px ${color}11`}
    >
      {faceDown ? (
        <Box w="full" h="full" display="flex" alignItems="center" justifyContent="center">
          <Text fontSize="lg" opacity="0.3">🃏</Text>
        </Box>
      ) : (
        <>
          <Text fontSize={{ base: "sm", md: "md" }} fontWeight="black" color={color} lineHeight="1" alignSelf="start">
            {rank}
          </Text>
          <Text fontSize={{ base: "lg", md: "2xl" }} lineHeight="1" style={{ color }}>
            {suit}
          </Text>
          <Text fontSize={{ base: "sm", md: "md" }} fontWeight="black" color={color} lineHeight="1" alignSelf="end"
            transform="rotate(180deg)">
            {rank}
          </Text>
        </>
      )}
    </Box>
  )
}

function ActionButton({ action, onClick, disabled, variant = "default" }: {
  action: string; onClick: () => void; disabled: boolean; variant?: "fold" | "call" | "raise" | "default"
}) {
  const colors = {
    fold: { bg: "linear-gradient(135deg, #EF4444, #DC2626)", border: "rgba(239,68,68,0.4)" },
    call: { bg: "linear-gradient(135deg, #3B82F6, #2563EB)", border: "rgba(59,130,246,0.4)" },
    raise: { bg: "linear-gradient(135deg, #22C55E, #16A34A)", border: "rgba(34,197,94,0.4)" },
    default: { bg: "linear-gradient(135deg, #8B2FC9, #6A0F91)", border: "rgba(139,47,201,0.4)" },
  }
  const c = colors[variant]
  return (
    <Box
      as="button"
      px={{ base: "4", md: "6" }}
      py={{ base: "3", md: "4" }}
      rounded="xl"
      cursor={disabled ? "not-allowed" : "pointer"}
      opacity={disabled ? 0.4 : 1}
      transition="all 0.15s"
      borderWidth="1px"
      borderColor={c.border}
      _hover={disabled ? {} : { transform: "translateY(-2px)", shadow: `0 8px 24px ${c.border}` }}
      _active={disabled ? {} : { transform: "translateY(0)" }}
      onClick={disabled ? undefined : onClick}
      css={{ background: disabled ? "rgba(255,255,255,0.05)" : c.bg }}
      minW={{ base: "80px", md: "100px" }}
    >
      <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }} color="white">{action}</Text>
    </Box>
  )
}

type TrainingState = "idle" | "playing" | "answered" | "session_end"

export function TrainingPage() {
  const { profile, updateProfile, refreshProfile } = useAuth()
  const [street, setStreet] = useState<Street>("preflop")
  const [difficulty, setDifficulty] = useState<"beginner" | "medium" | "advanced">("medium")
  const [scenario, setScenario] = useState<HandScenario | null>(null)
  const [state, setState] = useState<TrainingState>("idle")
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 })
  const [streak, setStreak] = useState(0)

  const availableActions: Action[] = street === "preflop"
    ? ["Fold", "Call", "Raise", "3-Bet"]
    : ["Fold", "Check", "Call", "Bet"]

  const loadScenario = useCallback(() => {
    const s = generateScenario(street, difficulty)
    setScenario(s)
    setSelectedAction(null)
    setState("playing")
    setIsCorrect(false)
  }, [street, difficulty])

  function handleAction(action: Action) {
    if (!scenario || state !== "playing") return
    const correct = action === scenario.correctAction
    setSelectedAction(action)
    setIsCorrect(correct)
    setState("answered")
    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }))
    if (correct) setStreak(s => s + 1)
    else setStreak(0)
  }

  async function finishSession() {
    if (!profile) return
    const newHands = (profile.total_hands ?? 0) + sessionStats.total
    const newCorrect = (profile.correct_decisions ?? 0) + sessionStats.correct
    await supabase.from("training_sessions").insert({
      user_id: profile.id,
      hands_played: sessionStats.total,
      correct_decisions: sessionStats.correct,
      session_type: street,
      difficulty,
    })
    await updateProfile({
      total_hands: newHands,
      correct_decisions: newCorrect,
      current_streak: Math.max(profile.current_streak ?? 0, streak),
      best_streak: Math.max(profile.best_streak ?? 0, streak),
    })
    await refreshProfile()
    setState("session_end")
  }

  const streetOptions = createListCollection({
    items: [
      { label: "Pré-flop", value: "preflop" },
      { label: "Flop", value: "flop" },
      { label: "Turn", value: "turn" },
      { label: "River", value: "river" },
    ]
  })

  const diffOptions = createListCollection({
    items: [
      { label: "Iniciante", value: "beginner" },
      { label: "Médio", value: "medium" },
      { label: "Avançado", value: "advanced" },
    ]
  })

  const posColors: Record<string, string> = {
    UTG: "#EF4444", "UTG+1": "#F97316", "UTG+2": "#EAB308",
    HJ: "#22C55E", CO: "#3B82F6", BTN: "#A855F7", SB: "#EC4899", BB: "#14B8A6"
  }

  return (
    <Box>
      <Heading size="xl" fontWeight="black" color="white" mb="2">
        Módulo de Treinamento
      </Heading>
      <Text color="gray.400" mb="6" fontSize="sm">
        Pratique decisões GTO em situações reais de poker
      </Text>

      {/* Controls */}
      <HStack gap="4" mb="6" flexWrap="wrap">
        <Box minW="140px">
          <Text fontSize="xs" color="gray.400" mb="1">Street</Text>
          <ChakraSelect.Root
            collection={streetOptions}
            value={[street]}
            onValueChange={({ value }) => setStreet(value[0] as Street)}
            size="sm"
          >
            <ChakraSelect.HiddenSelect />
            <ChakraSelect.Control>
              <ChakraSelect.Trigger
                bg="rgba(26,0,48,0.8)"
                borderColor="rgba(139,47,201,0.3)"
                color="white"
              >
                <ChakraSelect.ValueText />
              </ChakraSelect.Trigger>
              <ChakraSelect.IndicatorGroup>
                <ChakraSelect.Indicator />
              </ChakraSelect.IndicatorGroup>
            </ChakraSelect.Control>
            <ChakraSelect.Positioner>
              <ChakraSelect.Content bg="#1A0030" borderColor="rgba(139,47,201,0.3)">
                {streetOptions.items.map(item => (
                  <ChakraSelect.Item key={item.value} item={item} color="white" _hover={{ bg: "rgba(139,47,201,0.2)" }}>
                    <ChakraSelect.ItemText>{item.label}</ChakraSelect.ItemText>
                    <ChakraSelect.ItemIndicator />
                  </ChakraSelect.Item>
                ))}
              </ChakraSelect.Content>
            </ChakraSelect.Positioner>
          </ChakraSelect.Root>
        </Box>
        <Box minW="140px">
          <Text fontSize="xs" color="gray.400" mb="1">Dificuldade</Text>
          <ChakraSelect.Root
            collection={diffOptions}
            value={[difficulty]}
            onValueChange={({ value }) => setDifficulty(value[0] as "beginner" | "medium" | "advanced")}
            size="sm"
          >
            <ChakraSelect.HiddenSelect />
            <ChakraSelect.Control>
              <ChakraSelect.Trigger
                bg="rgba(26,0,48,0.8)"
                borderColor="rgba(139,47,201,0.3)"
                color="white"
              >
                <ChakraSelect.ValueText />
              </ChakraSelect.Trigger>
              <ChakraSelect.IndicatorGroup>
                <ChakraSelect.Indicator />
              </ChakraSelect.IndicatorGroup>
            </ChakraSelect.Control>
            <ChakraSelect.Positioner>
              <ChakraSelect.Content bg="#1A0030" borderColor="rgba(139,47,201,0.3)">
                {diffOptions.items.map(item => (
                  <ChakraSelect.Item key={item.value} item={item} color="white" _hover={{ bg: "rgba(139,47,201,0.2)" }}>
                    <ChakraSelect.ItemText>{item.label}</ChakraSelect.ItemText>
                    <ChakraSelect.ItemIndicator />
                  </ChakraSelect.Item>
                ))}
              </ChakraSelect.Content>
            </ChakraSelect.Positioner>
          </ChakraSelect.Root>
        </Box>
        {sessionStats.total > 0 && (
          <HStack gap="4" ml="auto">
            <VStack gap="0">
              <Text fontSize="sm" fontWeight="bold" color="white">
                {sessionStats.correct}/{sessionStats.total}
              </Text>
              <Text fontSize="2xs" color="gray.400">Acertos</Text>
            </VStack>
            <VStack gap="0">
              <HStack gap="1">
                <Icon as={LuFlame} color="gold.400" fontSize="sm" />
                <Text fontSize="sm" fontWeight="bold" color="gold.400">{streak}</Text>
              </HStack>
              <Text fontSize="2xs" color="gray.400">Streak</Text>
            </VStack>
          </HStack>
        )}
      </HStack>

      {/* Main poker table */}
      <Box
        rounded="3xl"
        bg="rgba(13,1,24,0.9)"
        borderWidth="1px"
        borderColor="rgba(139,47,201,0.2)"
        overflow="hidden"
        minH="500px"
      >
        {state === "idle" && (
          <Flex h="500px" align="center" justify="center" flexDir="column" gap="6">
            <Box
              p="6" rounded="full"
              bg="rgba(139,47,201,0.1)"
              border="2px solid rgba(139,47,201,0.3)"
              animationName="float"
              animationDuration="3s"
              animationTimingFunction="ease-in-out"
              animationIterationCount="infinite"
            >
              <Text fontSize="5xl">🃏</Text>
            </Box>
            <Text color="gray.400" fontSize="md" textAlign="center">
              Pronto para treinar decisões GTO?
            </Text>
            <Button
              size="lg"
              onClick={loadScenario}
              css={{
                background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
                border: "1px solid rgba(245,158,11,0.3)",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(135deg, #9D44F0, #7B1FA2)",
                  boxShadow: "0 0 30px rgba(139,47,201,0.4)",
                },
              }}
            >
              <Icon as={LuPlay} mr="2" />
              Iniciar Treino
            </Button>
          </Flex>
        )}

        {state === "session_end" && (
          <Flex h="500px" align="center" justify="center" flexDir="column" gap="6" p="8">
            <Text fontSize="5xl">🏆</Text>
            <Heading size="xl" color="white" textAlign="center">Sessão Concluída!</Heading>
            <Grid templateColumns="1fr 1fr 1fr" gap="4" w="full" maxW="400px">
              <VStack p="4" rounded="xl" bg="rgba(34,197,94,0.1)" border="1px solid rgba(34,197,94,0.2)">
                <Text fontSize="2xl" fontWeight="black" color="green.400">{sessionStats.correct}</Text>
                <Text fontSize="xs" color="gray.400">Acertos</Text>
              </VStack>
              <VStack p="4" rounded="xl" bg="rgba(239,68,68,0.1)" border="1px solid rgba(239,68,68,0.2)">
                <Text fontSize="2xl" fontWeight="black" color="red.400">{sessionStats.total - sessionStats.correct}</Text>
                <Text fontSize="xs" color="gray.400">Erros</Text>
              </VStack>
              <VStack p="4" rounded="xl" bg="rgba(245,158,11,0.1)" border="1px solid rgba(245,158,11,0.2)">
                <Text fontSize="2xl" fontWeight="black" color="gold.400">
                  {sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0}%
                </Text>
                <Text fontSize="xs" color="gray.400">Precisão</Text>
              </VStack>
            </Grid>
            <Button
              size="lg"
              onClick={() => { setSessionStats({ correct: 0, total: 0 }); setStreak(0); loadScenario() }}
              css={{
                background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
                border: "1px solid rgba(245,158,11,0.3)",
                color: "white",
              }}
            >
              <Icon as={LuRefreshCw} mr="2" />
              Nova Sessão
            </Button>
          </Flex>
        )}

        {scenario && (state === "playing" || state === "answered") && (
          <Box p={{ base: "4", md: "8" }}>
            {/* Scenario header */}
            <Flex justify="space-between" align="center" mb="6" flexWrap="wrap" gap="3">
              <HStack gap="3" flexWrap="wrap">
                <Badge
                  px="3" py="1" rounded="full" fontSize="sm"
                  css={{
                    background: posColors[scenario.position] ? `${posColors[scenario.position]}22` : "rgba(139,47,201,0.2)",
                    borderWidth: "1px",
                    borderColor: posColors[scenario.position] ?? "rgba(139,47,201,0.4)",
                    color: posColors[scenario.position] ?? "white",
                  }}
                >
                  {scenario.position}
                </Badge>
                <Badge colorPalette="purple" variant="subtle">{scenario.street.toUpperCase()}</Badge>
                <HStack gap="1">
                  <Text fontSize="xs" color="gray.400">Pote:</Text>
                  <Text fontSize="xs" color="white" fontWeight="semibold">{scenario.potSize.toFixed(1)} BB</Text>
                </HStack>
                <HStack gap="1">
                  <Text fontSize="xs" color="gray.400">Stack:</Text>
                  <Text fontSize="xs" color="white" fontWeight="semibold">{scenario.effectiveStack} BB</Text>
                </HStack>
              </HStack>
              <Text fontSize="xs" color="gray.500">Ação do vilão: <Text as="span" color="white">{scenario.villainAction}</Text></Text>
            </Flex>

            {/* Cards area */}
            <Box
              p="6" rounded="2xl" mb="6"
              bg="linear-gradient(145deg, rgba(13,1,24,0.8), rgba(26,0,48,0.5))"
              borderWidth="1px" borderColor="rgba(139,47,201,0.15)"
            >
              {/* Community cards */}
              {scenario.communityCards.length > 0 && (
                <Box mb="6">
                  <Text fontSize="xs" color="gray.500" mb="3" textTransform="uppercase" letterSpacing="wide">
                    Cartas Comunitárias
                  </Text>
                  <HStack gap="2" justify="center">
                    {scenario.communityCards.map((card, i) => (
                      <PokerCard key={i} rank={card.rank} suit={card.suit} delay={i * 100} />
                    ))}
                    {Array.from({ length: 5 - scenario.communityCards.length }).map((_, i) => (
                      <PokerCard key={`empty-${i}`} rank="" suit="" faceDown delay={(scenario.communityCards.length + i) * 100} />
                    ))}
                  </HStack>
                </Box>
              )}

              {/* Hero hand */}
              <Box>
                <Text fontSize="xs" color="gray.500" mb="3" textTransform="uppercase" letterSpacing="wide">
                  Sua Mão
                </Text>
                <HStack gap="3" justify="center">
                  {scenario.heroCards.map((card, i) => (
                    <PokerCard key={i} rank={card.rank} suit={card.suit} delay={200 + i * 100} />
                  ))}
                </HStack>
              </Box>
            </Box>

            {/* Action buttons or feedback */}
            {state === "playing" ? (
              <Box>
                <Text fontSize="xs" color="gray.400" mb="3" textAlign="center" textTransform="uppercase" letterSpacing="wide">
                  Qual é a melhor ação GTO?
                </Text>
                <Flex gap="3" justify="center" flexWrap="wrap">
                  {availableActions.map((action) => (
                    <ActionButton
                      key={action}
                      action={action}
                      onClick={() => handleAction(action)}
                      disabled={false}
                      variant={
                        action === "Fold" ? "fold" :
                        action === "Call" || action === "Check" ? "call" :
                        "raise"
                      }
                    />
                  ))}
                </Flex>
              </Box>
            ) : (
              <Box>
                {/* Feedback */}
                <Box
                  p="5" rounded="2xl" mb="4"
                  bg={isCorrect ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)"}
                  borderWidth="1px"
                  borderColor={isCorrect ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}
                >
                  <HStack gap="3" mb="3">
                    <Box
                      p="2" rounded="full"
                      bg={isCorrect ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}
                    >
                      <Icon
                        as={isCorrect ? LuCheck : LuX}
                        color={isCorrect ? "green.400" : "red.400"}
                        fontSize="xl"
                      />
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="white">
                        {isCorrect ? "✓ Correto!" : `✗ Incorreto - Correto: ${scenario.correctAction}`}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        Você escolheu: {selectedAction}
                      </Text>
                    </Box>
                    <Badge ml="auto" colorPalette={isCorrect ? "green" : "red"} variant="subtle">
                      GTO: {scenario.gtoBias}% freq.
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.300" lineHeight="tall" mb="2">
                    {scenario.explanation}
                  </Text>
                  <HStack gap="2" p="2" rounded="lg" bg="rgba(0,0,0,0.2)">
                    <Icon as={LuTarget} color="gold.400" fontSize="sm" />
                    <Text fontSize="xs" color="gold.300">{scenario.evAnalysis}</Text>
                  </HStack>
                </Box>

                <Flex gap="3" justify="center">
                  <Button
                    onClick={loadScenario}
                    css={{
                      background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
                      border: "1px solid rgba(245,158,11,0.3)",
                      color: "white",
                    }}
                  >
                    <Icon as={LuRefreshCw} mr="2" />
                    Próxima Mão
                  </Button>
                  {sessionStats.total >= 5 && (
                    <Button
                      variant="outline"
                      borderColor="rgba(139,47,201,0.4)"
                      color="white"
                      onClick={finishSession}
                    >
                      Finalizar Sessão
                    </Button>
                  )}
                </Flex>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Session info */}
      {sessionStats.total > 0 && (
        <Box mt="4" p="4" rounded="xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
          <HStack gap="6" justify="center">
            <VStack gap="0">
              <Text fontSize="lg" fontWeight="bold" color="white">{sessionStats.total}</Text>
              <Text fontSize="xs" color="gray.400">Mãos</Text>
            </VStack>
            <VStack gap="0">
              <Text fontSize="lg" fontWeight="bold" color="green.400">{sessionStats.correct}</Text>
              <Text fontSize="xs" color="gray.400">Corretas</Text>
            </VStack>
            <VStack gap="0">
              <Text fontSize="lg" fontWeight="bold" color="gold.400">
                {Math.round((sessionStats.correct / Math.max(sessionStats.total, 1)) * 100)}%
              </Text>
              <Text fontSize="xs" color="gray.400">Precisão</Text>
            </VStack>
            <VStack gap="0">
              <HStack gap="1">
                <Icon as={LuFlame} color="gold.400" />
                <Text fontSize="lg" fontWeight="bold" color="gold.400">{streak}</Text>
              </HStack>
              <Text fontSize="xs" color="gray.400">Streak</Text>
            </VStack>
          </HStack>
        </Box>
      )}
    </Box>
  )
}
