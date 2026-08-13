import { useState, useEffect } from "react"
import {
  Box, Grid, GridItem, VStack, HStack, Text, Heading, Flex, Icon,
  Badge, Progress, Separator
} from "@chakra-ui/react"
import { LuTrendingUp, LuTarget, LuFlame, LuStar, LuPlay, LuTrophy, LuCalendar, LuArrowRight } from "react-icons/lu"
import { useAuth } from "../lib/auth"
import { supabase, type NewsPost, type Event, type GlobalRanking } from "../lib/supabase"

interface StatsCardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
  trend?: number
}

function StatsCard({ label, value, sub, icon, color, trend }: StatsCardProps) {
  return (
    <Box
      p="5"
      rounded="2xl"
      bg="rgba(26,0,48,0.8)"
      borderWidth="1px"
      borderColor="rgba(139,47,201,0.2)"
      position="relative"
      overflow="hidden"
      _hover={{ borderColor: "rgba(139,47,201,0.4)", transform: "translateY(-2px)" }}
      transition="all 0.2s"
      css={{
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: color,
        },
      }}
    >
      <Flex justify="space-between" align="start">
        <VStack align="start" gap="2">
          <Text fontSize="xs" color="gray.400" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">
            {label}
          </Text>
          <Text fontSize="3xl" fontWeight="black" color="white" lineHeight="1">
            {value}
          </Text>
          {sub && <Text fontSize="xs" color="gray.500">{sub}</Text>}
          {trend !== undefined && (
            <HStack gap="1">
              <Icon as={LuTrendingUp} color="green.400" fontSize="xs" />
              <Text fontSize="xs" color="green.400">+{trend}% esta semana</Text>
            </HStack>
          )}
        </VStack>
        <Box
          p="3" rounded="xl"
          css={{ background: color.replace(")", ", 0.15)").replace("(", "-gradient(135deg, ").replace("135deg, ", "").replace(", 0.15)", " 0%, transparent 100%)") }}
        >
          <Icon as={icon} fontSize="2xl" color="white" opacity="0.9" />
        </Box>
      </Flex>
    </Box>
  )
}

function QuickActionCard({ label, desc, icon, color, onClick }: {
  label: string; desc: string; icon: React.ElementType; color: string; onClick: () => void
}) {
  return (
    <Box
      as="button"
      p="5"
      rounded="2xl"
      bg="rgba(26,0,48,0.8)"
      borderWidth="1px"
      borderColor="rgba(139,47,201,0.2)"
      cursor="pointer"
      textAlign="left"
      w="full"
      onClick={onClick}
      _hover={{
        borderColor: "rgba(245,158,11,0.4)",
        bg: "rgba(45,0,80,0.8)",
        transform: "translateY(-2px)",
        shadow: "0 8px 24px rgba(139,47,201,0.2)",
      }}
      transition="all 0.2s"
    >
      <HStack gap="4">
        <Box p="3" rounded="xl" css={{ background: color }}>
          <Icon as={icon} fontSize="xl" color="white" />
        </Box>
        <Box flex="1">
          <Text fontWeight="semibold" color="white" fontSize="sm">{label}</Text>
          <Text fontSize="xs" color="gray.400" mt="1">{desc}</Text>
        </Box>
        <Icon as={LuArrowRight} color="gray.500" />
      </HStack>
    </Box>
  )
}

interface DashboardProps {
  onNavigate: (page: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { profile } = useAuth()
  const [news, setNews] = useState<NewsPost[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [topRankings, setTopRankings] = useState<GlobalRanking[]>([])

  useEffect(() => {
    supabase.from("news_posts").select("*").order("published_at", { ascending: false }).limit(3).then(({ data }) => {
      if (data) setNews(data as NewsPost[])
    })
    supabase.from("events").select("*").gte("start_time", new Date().toISOString()).order("start_time").limit(3).then(({ data }) => {
      if (data) setEvents(data as Event[])
    })
    supabase.from("global_rankings").select("*, profiles(username, display_name, avatar_url)").order("points", { ascending: false }).limit(5).then(({ data }) => {
      if (data) setTopRankings(data as unknown as GlobalRanking[])
    })
  }, [])

  const accuracy = profile && profile.total_hands > 0
    ? Math.round((profile.correct_decisions / profile.total_hands) * 100)
    : 0
  const quizAvg = profile && profile.total_quizzes > 0
    ? Math.round((profile.total_quiz_score / profile.total_quizzes) * 10)
    : 0

  const categoryColors: Record<string, string> = {
    news: "blue",
    update: "green",
    article: "purple",
    strategy: "orange",
    event: "yellow",
  }

  const eventTypeColors: Record<string, string> = {
    tournament: "linear-gradient(135deg, #F59E0B, #D97706)",
    training: "linear-gradient(135deg, #22C55E, #16A34A)",
    stream: "linear-gradient(135deg, #EF4444, #DC2626)",
    community: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
    special: "linear-gradient(135deg, #06B6D4, #0891B2)",
  }

  return (
    <Box>
      {/* Welcome banner */}
      <Box
        mb="8"
        p="6"
        rounded="2xl"
        position="relative"
        overflow="hidden"
        bg="linear-gradient(135deg, #2D0050 0%, #4A0072 50%, #2D0050 100%)"
        borderWidth="1px"
        borderColor="rgba(245,158,11,0.3)"
      >
        <Box
          position="absolute" top="-50%" right="-5%"
          w="300px" h="300px" rounded="full"
          bg="radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)"
          pointerEvents="none"
        />
        <Flex justify="space-between" align="center" position="relative">
          <VStack align="start" gap="2">
            <HStack gap="2">
              <Icon as={LuFlame} color="gold.400" />
              <Text color="gold.400" fontSize="sm" fontWeight="semibold">
                Streak: {profile?.current_streak ?? 0} dias
              </Text>
            </HStack>
            <Heading size="xl" fontWeight="black" color="white">
              Bom treino, {profile?.display_name ?? profile?.username ?? "Jogador"}! 🃏
            </Heading>
            <Text color="gray.300" fontSize="sm">
              Continue sua jornada GTO. Você está indo muito bem!
            </Text>
          </VStack>
          <Box
            display={{ base: "none", md: "flex" }}
            flexDir="column"
            align="center"
            gap="1"
          >
            <Text fontSize="4xl" fontWeight="black" color="white">{accuracy}%</Text>
            <Text fontSize="xs" color="gold.400" fontWeight="medium">Precisão GTO</Text>
          </Box>
        </Flex>
      </Box>

      {/* Stats grid */}
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap="4" mb="8">
        <StatsCard
          label="Mãos Jogadas"
          value={profile?.total_hands ?? 0}
          icon={LuPlay}
          color="linear-gradient(135deg, #8B2FC9, #6A0F91)"
          trend={12}
        />
        <StatsCard
          label="Precisão GTO"
          value={`${accuracy}%`}
          icon={LuTarget}
          color="linear-gradient(135deg, #22C55E, #16A34A)"
          trend={5}
        />
        <StatsCard
          label="Streak Atual"
          value={profile?.current_streak ?? 0}
          sub={`Melhor: ${profile?.best_streak ?? 0} dias`}
          icon={LuFlame}
          color="linear-gradient(135deg, #F59E0B, #D97706)"
        />
        <StatsCard
          label="Pontos Ranking"
          value={profile?.rank_points ?? 0}
          icon={LuStar}
          color="linear-gradient(135deg, #EF4444, #DC2626)"
          trend={8}
        />
      </Grid>

      {/* Main content grid */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr 1fr" }} gap="6">
        {/* Quick actions */}
        <GridItem colSpan={{ base: 1, lg: 1 }}>
          <Box
            p="5" rounded="2xl"
            bg="rgba(26,0,48,0.8)"
            borderWidth="1px"
            borderColor="rgba(139,47,201,0.2)"
          >
            <Text fontWeight="bold" color="white" mb="4" fontSize="md">Ações Rápidas</Text>
            <VStack gap="3" align="stretch">
              <QuickActionCard
                label="Treinar Agora"
                desc="Simulação de mãos GTO"
                icon={LuPlay}
                color="linear-gradient(135deg, #8B2FC9, #6A0F91)"
                onClick={() => onNavigate("training")}
              />
              <QuickActionCard
                label="Quiz GTO"
                desc="Teste seus conhecimentos"
                icon={LuTarget}
                color="linear-gradient(135deg, #F59E0B, #D97706)"
                onClick={() => onNavigate("quiz")}
              />
              <QuickActionCard
                label="Ver Torneios"
                desc="Competições ativas"
                icon={LuTrophy}
                color="linear-gradient(135deg, #EF4444, #DC2626)"
                onClick={() => onNavigate("tournaments")}
              />
            </VStack>
          </Box>

          {/* Performance */}
          <Box
            mt="4" p="5" rounded="2xl"
            bg="rgba(26,0,48,0.8)"
            borderWidth="1px"
            borderColor="rgba(139,47,201,0.2)"
          >
            <Text fontWeight="bold" color="white" mb="4" fontSize="md">Desempenho</Text>
            <VStack gap="4" align="stretch">
              <Box>
                <Flex justify="space-between" mb="2">
                  <Text fontSize="xs" color="gray.400">Precisão Treino</Text>
                  <Text fontSize="xs" color="white" fontWeight="semibold">{accuracy}%</Text>
                </Flex>
                <Progress.Root value={accuracy} colorPalette="purple" size="sm" rounded="full">
                  <Progress.Track bg="rgba(139,47,201,0.2)">
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </Box>
              <Box>
                <Flex justify="space-between" mb="2">
                  <Text fontSize="xs" color="gray.400">Média Quiz</Text>
                  <Text fontSize="xs" color="white" fontWeight="semibold">{quizAvg}%</Text>
                </Flex>
                <Progress.Root value={quizAvg} colorPalette="yellow" size="sm" rounded="full">
                  <Progress.Track bg="rgba(245,158,11,0.2)">
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </Box>
              <Box>
                <Flex justify="space-between" mb="2">
                  <Text fontSize="xs" color="gray.400">Pontos Ranking</Text>
                  <Text fontSize="xs" color="white" fontWeight="semibold">{Math.min(profile?.rank_points ?? 0, 1000)}/1000</Text>
                </Flex>
                <Progress.Root value={Math.min(profile?.rank_points ?? 0, 1000)} max={1000} colorPalette="green" size="sm" rounded="full">
                  <Progress.Track bg="rgba(34,197,94,0.2)">
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </Box>
            </VStack>
          </Box>
        </GridItem>

        {/* News & Ranking */}
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="6">
            {/* Latest news */}
            <Box
              p="5" rounded="2xl"
              bg="rgba(26,0,48,0.8)"
              borderWidth="1px"
              borderColor="rgba(139,47,201,0.2)"
            >
              <Flex justify="space-between" align="center" mb="4">
                <Text fontWeight="bold" color="white" fontSize="md">Últimas Notícias</Text>
                <Text
                  fontSize="xs" color="gold.400" cursor="pointer"
                  onClick={() => onNavigate("news")}
                  _hover={{ color: "gold.300" }}
                >
                  Ver todas →
                </Text>
              </Flex>
              <VStack gap="3" align="stretch">
                {news.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">Carregando...</Text>
                ) : news.map((post) => (
                  <Box key={post.id} p="3" rounded="lg" bg="rgba(139,47,201,0.08)" _hover={{ bg: "rgba(139,47,201,0.12)" }} transition="all 0.2s" cursor="pointer">
                    <HStack gap="2" mb="1">
                      <Badge colorPalette={categoryColors[post.category] ?? "gray"} size="sm" variant="subtle">
                        {post.category}
                      </Badge>
                      {post.is_featured && <Badge colorPalette="yellow" size="sm" variant="subtle">Destaque</Badge>}
                    </HStack>
                    <Text fontSize="sm" fontWeight="medium" color="white" lineClamp={2}>{post.title}</Text>
                    <Text fontSize="xs" color="gray.500" mt="1">
                      {new Date(post.published_at).toLocaleDateString("pt-BR")}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Upcoming events */}
            <Box
              p="5" rounded="2xl"
              bg="rgba(26,0,48,0.8)"
              borderWidth="1px"
              borderColor="rgba(139,47,201,0.2)"
            >
              <Flex justify="space-between" align="center" mb="4">
                <Text fontWeight="bold" color="white" fontSize="md">Próximos Eventos</Text>
                <Text
                  fontSize="xs" color="gold.400" cursor="pointer"
                  onClick={() => onNavigate("news")}
                  _hover={{ color: "gold.300" }}
                >
                  Ver todos →
                </Text>
              </Flex>
              <VStack gap="3" align="stretch">
                {events.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">Nenhum evento próximo</Text>
                ) : events.map((event) => (
                  <Box key={event.id} p="3" rounded="lg" bg="rgba(139,47,201,0.08)">
                    <HStack gap="3">
                      <Box
                        p="2" rounded="lg" flexShrink="0"
                        css={{ background: eventTypeColors[event.event_type] ?? "linear-gradient(135deg, #8B2FC9, #6A0F91)" }}
                      >
                        <Icon as={LuCalendar} color="white" fontSize="sm" />
                      </Box>
                      <Box flex="1" minW="0">
                        <Text fontSize="sm" fontWeight="medium" color="white" truncate>{event.title}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(event.start_time).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Top rankings */}
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <Box
                p="5" rounded="2xl"
                bg="rgba(26,0,48,0.8)"
                borderWidth="1px"
                borderColor="rgba(139,47,201,0.2)"
              >
                <Flex justify="space-between" align="center" mb="4">
                  <HStack gap="2">
                    <Icon as={LuTrophy} color="gold.400" />
                    <Text fontWeight="bold" color="white" fontSize="md">Top Rankings</Text>
                  </HStack>
                  <Text
                    fontSize="xs" color="gold.400" cursor="pointer"
                    onClick={() => onNavigate("tournaments")}
                    _hover={{ color: "gold.300" }}
                  >
                    Ver todos →
                  </Text>
                </Flex>
                <VStack gap="2" align="stretch">
                  {topRankings.map((r, i) => (
                    <HStack key={r.id} gap="3" p="2" rounded="lg" _hover={{ bg: "rgba(139,47,201,0.08)" }}>
                      <Box
                        w="7" h="7" rounded="full" display="flex"
                        alignItems="center" justifyContent="center"
                        flexShrink="0"
                        css={{
                          background: i === 0 ? "linear-gradient(135deg, #FFD700, #F59E0B)" :
                            i === 1 ? "linear-gradient(135deg, #C0C0C0, #A8A8A8)" :
                            i === 2 ? "linear-gradient(135deg, #CD7F32, #B8860B)" :
                            "rgba(139,47,201,0.3)",
                        }}
                      >
                        <Text fontSize="xs" fontWeight="black" color="white">#{i + 1}</Text>
                      </Box>
                      <Text fontSize="sm" color="white" fontWeight="medium" flex="1">
                        {(r.profiles as unknown as { display_name: string; username: string })?.display_name ??
                         (r.profiles as unknown as { display_name: string; username: string })?.username ?? "Player"}
                      </Text>
                      <VStack gap="0" align="end">
                        <Text fontSize="sm" fontWeight="bold" color="gold.400">{r.points} pts</Text>
                        <Text fontSize="xs" color="gray.500">{r.wins} vitórias</Text>
                      </VStack>
                    </HStack>
                  ))}
                  {topRankings.length === 0 && (
                    <Text fontSize="sm" color="gray.500">Nenhum jogador no ranking ainda</Text>
                  )}
                </VStack>
              </Box>
            </GridItem>
          </Grid>
        </GridItem>
      </Grid>
    </Box>
  )
}
