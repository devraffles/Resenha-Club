import { useState, useEffect } from "react"
import {
  Box, VStack, HStack, Text, Heading, Flex, Icon, Image as ChakraImage,
  Grid, Badge,
} from "@chakra-ui/react"
import { LuTrophy, LuMedal, LuCrown } from "react-icons/lu"
import { supabase, type Champion } from "@/lib/supabase"

export function RankingPage() {
  const [champions, setChampions] = useState<Champion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from("champions").select("*").order("sort_order").then(({ data }) => {
      if (data) setChampions(data as Champion[])
      setLoading(false)
    })
  }, [])

  const podiumColors = ["#FFD700", "#C0C0C0", "#CD7F32"]
  const podiumIcons = [LuCrown, LuMedal, LuMedal]

  return (
    <Box>
      <VStack gap="2" mb="8" align="start">
        <HStack gap="2">
          <Box
            p="2" rounded="lg"
            bg="rgba(245,158,11,0.1)"
            borderWidth="1px"
            borderColor="rgba(245,158,11,0.3)"
          >
            <Icon as={LuTrophy} color="gold.400" fontSize="lg" />
          </Box>
          <Heading size="xl" fontWeight="black" color="white">Ranking dos Campeões</Heading>
        </HStack>
        <Text color="gray.400" fontSize="sm">
          Os melhores jogadores do The Resenha Club
        </Text>
      </VStack>

      {loading ? (
        <Text color="gray.500" fontSize="sm">Carregando...</Text>
      ) : champions.length === 0 ? (
        <Box
          p="12" rounded="2xl"
          bg="rgba(26,0,48,0.6)"
          borderWidth="1px"
          borderColor="rgba(139,47,201,0.15)"
          textAlign="center"
        >
          <Icon as={LuTrophy} fontSize="4xl" color="purple.400" mb="4" />
          <Text color="gray.400" fontSize="md" fontWeight="medium">Nenhum campeão registrado ainda</Text>
          <Text color="gray.500" fontSize="sm" mt="2">
            Os campeões do clube aparecerão aqui assim que forem cadastrados.
          </Text>
        </Box>
      ) : (
        <>
          {/* Podium - Top 3 */}
          {champions.length >= 3 && (
            <Grid templateColumns="repeat(3, 1fr)" gap="4" mb="8" alignItems="end">
              {/* 2nd place */}
              <PodiumCard champion={champions[1]} place={2} color={podiumColors[1]} icon={podiumIcons[1]} height="140px" />
              {/* 1st place */}
              <PodiumCard champion={champions[0]} place={1} color={podiumColors[0]} icon={podiumIcons[0]} height="180px" />
              {/* 3rd place */}
              <PodiumCard champion={champions[2]} place={3} color={podiumColors[2]} icon={podiumIcons[2]} height="110px" />
            </Grid>
          )}

          {/* Full ranking list */}
          <Box
            p="5" rounded="2xl"
            bg="rgba(26,0,48,0.8)"
            borderWidth="1px"
            borderColor="rgba(139,47,201,0.2)"
          >
            <VStack gap="2" align="stretch">
              {champions.map((champ, i) => (
                <HStack
                  key={champ.id}
                  gap="4" p="3" rounded="lg"
                  _hover={{ bg: "rgba(139,47,201,0.08)" }}
                  transition="all 0.2s"
                >
                  <Box
                    w="10" h="10" rounded="full"
                    display="flex" alignItems="center" justifyContent="center"
                    flexShrink="0"
                    css={{
                      background: i < 3
                        ? `linear-gradient(135deg, ${podiumColors[i]}, ${podiumColors[i]}99)`
                        : "rgba(139,47,201,0.3)",
                    }}
                  >
                    <Text fontSize="xs" fontWeight="black" color="white">#{i + 1}</Text>
                  </Box>

                  <Box
                    w="12" h="12" rounded="full"
                    overflow="hidden" flexShrink="0"
                    border="2px solid"
                    borderColor={i < 3 ? podiumColors[i] : "rgba(139,47,201,0.3)"}
                  >
                    {champ.photo_url ? (
                      <ChakraImage src={champ.photo_url} alt={champ.name} w="full" h="full" objectFit="cover" />
                    ) : (
                      <Box w="full" h="full" bg="rgba(139,47,201,0.2)" display="flex" alignItems="center" justifyContent="center">
                        <Icon as={LuTrophy} color="purple.300" fontSize="md" />
                      </Box>
                    )}
                  </Box>

                  <Box flex="1" minW="0">
                    <Text fontSize="sm" fontWeight="semibold" color="white" truncate>{champ.name}</Text>
                    {champ.last_victory && (
                      <Text fontSize="xs" color="gray.500" truncate>
                        Última: {champ.last_victory}
                      </Text>
                    )}
                  </Box>

                  <VStack gap="0" align="end">
                    <HStack gap="1">
                      <Icon as={LuTrophy} color="gold.400" fontSize="xs" />
                      <Text fontSize="sm" fontWeight="bold" color="gold.400">{champ.titles_count}</Text>
                    </HStack>
                    {champ.victory_date && (
                      <Text fontSize="xs" color="gray.500">
                        {new Date(champ.victory_date).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </Box>
        </>
      )}
    </Box>
  )
}

function PodiumCard({ champion, place, color, icon, height }: {
  champion: Champion
  place: number
  color: string
  icon: React.ElementType
  height: string
}) {
  return (
    <VStack gap="2" alignItems="center">
      <Box position="relative">
        {place === 1 && (
          <Box position="absolute" top="-20px" left="50%" transform="translateX(-50%)">
            <Icon as={icon} color={color} fontSize="2xl" />
          </Box>
        )}
        <Box
          w={{ base: "56px", md: "72px" }}
          h={{ base: "56px", md: "72px" }}
          rounded="full"
          overflow="hidden"
          border="3px solid"
          borderColor={color}
          shadow={`0 0 20px ${color}40`}
        >
          {champion.photo_url ? (
            <ChakraImage src={champion.photo_url} alt={champion.name} w="full" h="full" objectFit="cover" />
          ) : (
            <Box w="full" h="full" bg="rgba(139,47,201,0.3)" display="flex" alignItems="center" justifyContent="center">
              <Icon as={LuTrophy} color="purple.300" fontSize="2xl" />
            </Box>
          )}
        </Box>
      </Box>
      <Text fontWeight="bold" color="white" fontSize="sm" textAlign="center">{champion.name}</Text>
      <HStack gap="1">
        <Icon as={LuTrophy} color="gold.400" fontSize="xs" />
        <Text fontSize="xs" color="gold.400" fontWeight="bold">{champion.titles_count} título{champion.titles_count !== 1 ? "s" : ""}</Text>
      </HStack>
      <Box
        w="full"
        h={height}
        rounded="xl"
        bg="rgba(26,0,48,0.8)"
        borderWidth="2px"
        borderColor={color}
        borderTopWidth="4px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="3xl" fontWeight="black" color={color}>#{place}</Text>
      </Box>
    </VStack>
  )
}
