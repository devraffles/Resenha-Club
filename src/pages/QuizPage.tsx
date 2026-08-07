import { useState } from "react"
import {
  Box, VStack, HStack, Text, Heading, Flex, Icon, Button, Badge, Grid, Progress
} from "@chakra-ui/react"
import { LuPlay, LuCheck, LuX, LuTarget, LuTrophy, LuRefreshCw, LuBrainCircuit } from "react-icons/lu"
import { useAuth } from "../lib/auth"
import { supabase } from "../lib/supabase"
import { generateQuizScenario, SUIT_COLORS, type Action } from "../lib/poker"

type QuizMode = "learning" | "challenge" | "speed"
type QuizState = "config" | "playing" | "finished"

interface QuizQuestion {
  id: string
  heroCards: { rank: string; suit: string }[]
  communityCards: { rank: string; suit: string }[]
  position: string
  street: string
  potSize: number
  correctAction: Action
  options: Action[]
  explanation: string
  gtoBias: number
  evAnalysis: string
}

function QuizCard({ rank, suit }: { rank: string; suit: string }) {
  const color = SUIT_COLORS[suit as keyof typeof SUIT_COLORS] ?? "#FFFFFF"
  return (
    <Box
      w="40px" h="58px" rounded="lg"
      border="2px solid rgba(255,255,255,0.15)"
      bg="linear-gradient(145deg, #1A0030, #0D0118)"
      display="flex" flexDir="column" alignItems="center"
      justifyContent="space-between" p="1"
      shadow={`0 4px 12px ${color}22`}
    >
      <Text fontSize="xs" fontWeight="black" color={color} lineHeight="1" alignSelf="start">{rank}</Text>
      <Text fontSize="lg" lineHeight="1" style={{ color }}>{suit}</Text>
      <Text fontSize="xs" fontWeight="black" color={color} lineHeight="1" alignSelf="end" transform="rotate(180deg)">{rank}</Text>
    </Box>
  )
}

export function QuizPage() {
  const { profile, updateProfile, refreshProfile } = useAuth()
  const [mode, setMode] = useState<QuizMode>("challenge")
  const [difficulty, setDifficulty] = useState<"beginner" | "medium" | "advanced">("medium")
  const [totalQuestions, setTotalQuestions] = useState(10)
  const [quizState, setQuizState] = useState<QuizState>("config")
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<{ action: Action; correct: boolean }[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<Action | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  function startQuiz() {
    const qs = Array.from({ length: totalQuestions }, (_, i) =>
      generateQuizScenario(i + 1, difficulty)
    ) as QuizQuestion[]
    setQuestions(qs)
    setCurrentIndex(0)
    setAnswers([])
    setSelectedAnswer(null)
    setShowFeedback(false)
    setQuizState("playing")
  }

  function handleAnswer(action: Action) {
    if (selectedAnswer !== null) return
    const q = questions[currentIndex]
    const correct = action === q.correctAction
    setSelectedAnswer(action)
    setAnswers(prev => [...prev, { action, correct }])
    if (mode === "challenge") {
      setTimeout(() => goNext(), 1000)
    } else {
      setShowFeedback(true)
    }
  }

  async function goNext() {
    setSelectedAnswer(null)
    setShowFeedback(false)
    if (currentIndex + 1 >= questions.length) {
      await finishQuiz()
    } else {
      setCurrentIndex(i => i + 1)
    }
  }

  async function finishQuiz() {
    setQuizState("finished")
    if (!profile) return
    const correct = answers.filter(a => a.correct).length + (selectedAnswer === questions[currentIndex]?.correctAction ? 1 : 0)
    const finalAnswers = [...answers]
    if (selectedAnswer !== null) finalAnswers.push({ action: selectedAnswer, correct: selectedAnswer === questions[currentIndex]?.correctAction })
    const score = Math.round((finalAnswers.filter(a => a.correct).length / questions.length) * 100)
    await supabase.from("quiz_results").insert({
      user_id: profile.id,
      score: finalAnswers.filter(a => a.correct).length,
      total_questions: questions.length,
      mode,
      difficulty,
    })
    await updateProfile({
      total_quiz_score: (profile.total_quiz_score ?? 0) + score,
      total_quizzes: (profile.total_quizzes ?? 0) + 1,
    })
    await refreshProfile()
  }

  const q = questions[currentIndex]
  const score = answers.filter(a => a.correct).length
  const optionColors = {
    correct: { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.5)", text: "#22C55E" },
    wrong: { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.5)", text: "#EF4444" },
    default: { bg: "rgba(139,47,201,0.1)", border: "rgba(139,47,201,0.3)", text: "white" },
  }

  if (quizState === "config") return (
    <Box>
      <Heading size="xl" fontWeight="black" color="white" mb="2">Quiz GTO</Heading>
      <Text color="gray.400" mb="8" fontSize="sm">Teste seus conhecimentos sobre estratégia GTO</Text>

      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="6" maxW="800px">
        {/* Mode selection */}
        <Box p="6" rounded="2xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
          <Text fontWeight="bold" color="white" mb="4">Modo de Jogo</Text>
          <VStack gap="3" align="stretch">
            {([
              { id: "learning", label: "Modo Aprendizado", desc: "Feedback detalhado em cada questão" },
              { id: "challenge", label: "Modo Desafio", desc: "Feedback apenas no final" },
              { id: "speed", label: "Modo Velocidade", desc: "Decisões rápidas com timer" },
            ] as { id: QuizMode; label: string; desc: string }[]).map(m => (
              <Box
                key={m.id}
                as="button"
                p="3" rounded="xl" cursor="pointer" textAlign="left"
                borderWidth="2px"
                borderColor={mode === m.id ? "gold.400" : "rgba(139,47,201,0.2)"}
                bg={mode === m.id ? "rgba(245,158,11,0.1)" : "transparent"}
                onClick={() => setMode(m.id)}
                transition="all 0.2s"
              >
                <Text fontSize="sm" fontWeight="semibold" color="white">{m.label}</Text>
                <Text fontSize="xs" color="gray.400" mt="0.5">{m.desc}</Text>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Settings */}
        <Box p="6" rounded="2xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
          <Text fontWeight="bold" color="white" mb="4">Configurações</Text>
          <VStack gap="4" align="stretch">
            <Box>
              <Text fontSize="sm" color="gray.400" mb="2">Dificuldade</Text>
              <HStack gap="2">
                {(["beginner", "medium", "advanced"] as const).map(d => (
                  <Box
                    key={d}
                    as="button"
                    flex="1" py="2" rounded="lg" cursor="pointer"
                    fontSize="xs" fontWeight="semibold"
                    borderWidth="1px"
                    borderColor={difficulty === d ? "gold.400" : "rgba(139,47,201,0.3)"}
                    bg={difficulty === d ? "rgba(245,158,11,0.15)" : "transparent"}
                    color={difficulty === d ? "gold.400" : "gray.400"}
                    onClick={() => setDifficulty(d)}
                    transition="all 0.15s"
                  >
                    {d === "beginner" ? "Iniciante" : d === "medium" ? "Médio" : "Avançado"}
                  </Box>
                ))}
              </HStack>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.400" mb="2">Número de Questões</Text>
              <HStack gap="2">
                {[5, 10, 15, 20].map(n => (
                  <Box
                    key={n}
                    as="button"
                    flex="1" py="2" rounded="lg" cursor="pointer"
                    fontSize="sm" fontWeight="semibold"
                    borderWidth="1px"
                    borderColor={totalQuestions === n ? "gold.400" : "rgba(139,47,201,0.3)"}
                    bg={totalQuestions === n ? "rgba(245,158,11,0.15)" : "transparent"}
                    color={totalQuestions === n ? "gold.400" : "gray.400"}
                    onClick={() => setTotalQuestions(n)}
                    transition="all 0.15s"
                  >
                    {n}
                  </Box>
                ))}
              </HStack>
            </Box>
          </VStack>

          <Button
            mt="6" w="full" size="lg"
            onClick={startQuiz}
            css={{
              background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "white",
              "&:hover": { background: "linear-gradient(135deg, #9D44F0, #7B1FA2)", boxShadow: "0 0 30px rgba(139,47,201,0.4)" },
            }}
          >
            <Icon as={LuPlay} mr="2" />
            Iniciar Quiz
          </Button>
        </Box>
      </Grid>
    </Box>
  )

  if (quizState === "finished") {
    const finalScore = answers.filter(a => a.correct).length
    const pct = Math.round((finalScore / questions.length) * 100)
    return (
      <Box maxW="600px" mx="auto" py="8">
        <VStack gap="6" align="stretch">
          <Box textAlign="center">
            <Text fontSize="5xl" mb="2">{pct >= 80 ? "🏆" : pct >= 60 ? "👏" : "📚"}</Text>
            <Heading size="xl" color="white">Quiz Finalizado!</Heading>
          </Box>

          <Grid templateColumns="repeat(3, 1fr)" gap="3">
            <VStack p="4" rounded="xl" bg="rgba(34,197,94,0.1)" borderWidth="1px" borderColor="rgba(34,197,94,0.2)" gap="1">
              <Text fontSize="2xl" fontWeight="black" color="green.400">{finalScore}</Text>
              <Text fontSize="xs" color="gray.400" textAlign="center">Acertos</Text>
            </VStack>
            <VStack p="4" rounded="xl" bg="rgba(245,158,11,0.1)" borderWidth="1px" borderColor="rgba(245,158,11,0.2)" gap="1">
              <Text fontSize="2xl" fontWeight="black" color="gold.400">{pct}%</Text>
              <Text fontSize="xs" color="gray.400" textAlign="center">Precisão</Text>
            </VStack>
            <VStack p="4" rounded="xl" bg="rgba(239,68,68,0.1)" borderWidth="1px" borderColor="rgba(239,68,68,0.2)" gap="1">
              <Text fontSize="2xl" fontWeight="black" color="red.400">{questions.length - finalScore}</Text>
              <Text fontSize="xs" color="gray.400" textAlign="center">Erros</Text>
            </VStack>
          </Grid>

          {/* Question review */}
          <Box p="5" rounded="2xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
            <Text fontWeight="bold" color="white" mb="4">Revisão das Questões</Text>
            <VStack gap="2" align="stretch">
              {questions.map((q, i) => {
                const a = answers[i]
                if (!a) return null
                return (
                  <HStack key={i} gap="3" p="2" rounded="lg" bg={a.correct ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)"}>
                    <Box
                      w="5" h="5" rounded="full"
                      bg={a.correct ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}
                      display="flex" alignItems="center" justifyContent="center"
                    >
                      <Icon as={a.correct ? LuCheck : LuX} fontSize="xs" color={a.correct ? "green.400" : "red.400"} />
                    </Box>
                    <Text flex="1" fontSize="xs" color="gray.300">Q{i + 1}: {q.position} - {q.street}</Text>
                    <Text fontSize="xs" color={a.correct ? "green.400" : "red.400"}>{a.action}</Text>
                    {!a.correct && (
                      <Text fontSize="xs" color="gray.500">→ {q.correctAction}</Text>
                    )}
                  </HStack>
                )
              })}
            </VStack>
          </Box>

          <Button
            onClick={() => setQuizState("config")}
            css={{
              background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "white",
            }}
          >
            <Icon as={LuRefreshCw} mr="2" />
            Novo Quiz
          </Button>
        </VStack>
      </Box>
    )
  }

  if (!q) return null

  return (
    <Box maxW="680px" mx="auto">
      {/* Progress */}
      <Box mb="6">
        <Flex justify="space-between" mb="2">
          <Text fontSize="sm" color="gray.400">Questão {currentIndex + 1} de {questions.length}</Text>
          <HStack gap="4">
            <HStack gap="1">
              <Icon as={LuCheck} color="green.400" fontSize="xs" />
              <Text fontSize="xs" color="green.400">{score} corretas</Text>
            </HStack>
            <HStack gap="1">
              <Icon as={LuX} color="red.400" fontSize="xs" />
              <Text fontSize="xs" color="red.400">{answers.filter(a => !a.correct).length} erros</Text>
            </HStack>
          </HStack>
        </Flex>
        <Progress.Root value={(currentIndex / questions.length) * 100} colorPalette="purple" size="sm" rounded="full">
          <Progress.Track bg="rgba(139,47,201,0.2)">
            <Progress.Range css={{ background: "linear-gradient(90deg, #8B2FC9, #F59E0B)" }} />
          </Progress.Track>
        </Progress.Root>
      </Box>

      {/* Question card */}
      <Box p="6" rounded="2xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)" mb="4">
        {/* Meta info */}
        <HStack gap="2" mb="4" flexWrap="wrap">
          <Badge colorPalette="purple" variant="subtle">{q.position}</Badge>
          <Badge colorPalette="blue" variant="subtle">{q.street?.toUpperCase()}</Badge>
          <Text fontSize="xs" color="gray.400">Pote: <Text as="span" color="white">{q.potSize?.toFixed(1)} BB</Text></Text>
        </HStack>

        {/* Community cards */}
        {q.communityCards?.length > 0 && (
          <Box mb="4">
            <Text fontSize="xs" color="gray.500" mb="2" textTransform="uppercase" letterSpacing="wide">Board</Text>
            <HStack gap="2">
              {q.communityCards.map((card, i) => (
                <QuizCard key={i} rank={card.rank} suit={card.suit} />
              ))}
            </HStack>
          </Box>
        )}

        {/* Hero cards */}
        <Box>
          <Text fontSize="xs" color="gray.500" mb="2" textTransform="uppercase" letterSpacing="wide">Sua Mão</Text>
          <HStack gap="2">
            {q.heroCards?.map((card, i) => (
              <QuizCard key={i} rank={card.rank} suit={card.suit} />
            ))}
          </HStack>
        </Box>
      </Box>

      {/* Answer options */}
      <Box mb="4">
        <Text fontSize="sm" color="gray.400" mb="3" textAlign="center">Qual é a melhor ação?</Text>
        <Grid templateColumns="1fr 1fr" gap="3">
          {q.options?.map((option) => {
            let cs = optionColors.default
            if (selectedAnswer !== null) {
              if (option === q.correctAction) cs = optionColors.correct
              else if (option === selectedAnswer && option !== q.correctAction) cs = optionColors.wrong
            }
            return (
              <Box
                key={option}
                as="button"
                p="4" rounded="xl" cursor={selectedAnswer !== null ? "default" : "pointer"}
                borderWidth="2px"
                borderColor={cs.border}
                bg={cs.bg}
                transition="all 0.2s"
                _hover={selectedAnswer !== null ? {} : { bg: "rgba(139,47,201,0.15)", borderColor: "rgba(139,47,201,0.5)" }}
                onClick={() => handleAnswer(option)}
              >
                <Flex align="center" justify="center" gap="2">
                  {selectedAnswer !== null && option === q.correctAction && (
                    <Icon as={LuCheck} color="green.400" />
                  )}
                  {selectedAnswer !== null && option === selectedAnswer && option !== q.correctAction && (
                    <Icon as={LuX} color="red.400" />
                  )}
                  <Text fontWeight="bold" style={{ color: cs.text }}>{option}</Text>
                </Flex>
              </Box>
            )
          })}
        </Grid>
      </Box>

      {/* Learning mode feedback */}
      {showFeedback && selectedAnswer !== null && mode === "learning" && (
        <Box
          p="5" rounded="2xl" mb="4"
          bg={selectedAnswer === q.correctAction ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)"}
          borderWidth="1px"
          borderColor={selectedAnswer === q.correctAction ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}
        >
          <Text fontWeight="bold" color="white" mb="2">
            {selectedAnswer === q.correctAction ? "✓ Correto!" : `✗ Correto: ${q.correctAction}`}
          </Text>
          <Text fontSize="sm" color="gray.300" mb="3">{q.explanation}</Text>
          <HStack gap="2" p="2" rounded="lg" bg="rgba(0,0,0,0.2)">
            <Icon as={LuTarget} color="gold.400" fontSize="sm" />
            <Text fontSize="xs" color="gold.300">{q.evAnalysis}</Text>
          </HStack>
          <Button mt="4" size="sm" onClick={goNext}
            css={{ background: "linear-gradient(135deg, #8B2FC9, #6A0F91)", color: "white" }}>
            Próxima →
          </Button>
        </Box>
      )}
    </Box>
  )
}
