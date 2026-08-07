import { useState } from "react"
import { Box, VStack, HStack, Text, Heading, Flex, Icon } from "@chakra-ui/react"
import { LuBrainCircuit, LuDumbbell, LuTarget, LuLayoutGrid } from "react-icons/lu"
import { TrainingPage } from "../TrainingPage"
import { QuizPage } from "../QuizPage"
import { RangesPage } from "../RangesPage"
import { Dashboard } from "../Dashboard"

type GtoTab = "treinar" | "quiz" | "ranges" | "desempenho"

export function GtoPage() {
  const [tab, setTab] = useState<GtoTab>("treinar")

  const tabs = [
    { id: "treinar", label: "Treinar", icon: LuDumbbell },
    { id: "quiz", label: "Quiz GTO", icon: LuTarget },
    { id: "ranges", label: "Ranges", icon: LuLayoutGrid },
    { id: "desempenho", label: "Desempenho", icon: LuBrainCircuit },
  ] as const

  return (
    <Box>
      <VStack gap="2" mb="6" align="start">
        <HStack gap="2">
          <Box
            p="2" rounded="lg"
            bg="rgba(139,47,201,0.1)"
            borderWidth="1px"
            borderColor="rgba(139,47,201,0.3)"
          >
            <Icon as={LuBrainCircuit} color="purple.300" fontSize="lg" />
          </Box>
          <Heading size="xl" fontWeight="black" color="white">Treinamento GTO</Heading>
        </HStack>
        <Text color="gray.400" fontSize="sm">
          Domine a teoria do jogo ótimo com simulações, quizzes e ranges
        </Text>
      </VStack>

      {/* Tab bar */}
      <Box mb="6" overflowX="auto" css={{ "&::-webkit-scrollbar": { display: "none" } }}>
        <Flex gap="2" minW="max-content">
          {tabs.map((t) => {
            const active = tab === t.id
            return (
              <Box
                key={t.id}
                as="button"
                px="4" py="2.5"
                rounded="xl"
                cursor="pointer"
                transition="all 0.2s"
                bg={active ? "rgba(139,47,201,0.2)" : "rgba(26,0,48,0.6)"}
                borderWidth="1px"
                borderColor={active ? "rgba(139,47,201,0.4)" : "rgba(139,47,201,0.15)"}
                _hover={{ borderColor: "rgba(139,47,201,0.3)" }}
                onClick={() => setTab(t.id)}
                flexShrink="0"
              >
                <Flex align="center" gap="2">
                  <Icon as={t.icon} color={active ? "gold.400" : "purple.300"} fontSize="md" />
                  <Text
                    fontSize="sm"
                    fontWeight={active ? "semibold" : "medium"}
                    color={active ? "white" : "gray.400"}
                  >
                    {t.label}
                  </Text>
                </Flex>
              </Box>
            )
          })}
        </Flex>
      </Box>

      {/* Tab content */}
      <Box>
        {tab === "treinar" && <TrainingPage />}
        {tab === "quiz" && <QuizPage />}
        {tab === "ranges" && <RangesPage />}
        {tab === "desempenho" && <Dashboard onNavigate={() => setTab("treinar")} />}
      </Box>
    </Box>
  )
}
