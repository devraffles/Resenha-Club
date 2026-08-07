import { useState, useEffect } from "react"
import {
  Box, VStack, HStack, Text, Heading, Flex, Icon, Badge, Grid, Tabs
} from "@chakra-ui/react"
import { LuNewspaper, LuCalendar, LuClock, LuMapPin, LuTrophy, LuMonitor, LuUsers, LuStar, LuBell } from "react-icons/lu"
import { supabase, type NewsPost, type Event } from "../lib/supabase"

const categoryIcons: Record<string, React.ElementType> = {
  news: LuNewspaper,
  update: LuBell,
  article: LuNewspaper,
  strategy: LuStar,
  event: LuCalendar,
}

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

const eventTypeIcons: Record<string, React.ElementType> = {
  tournament: LuTrophy,
  training: LuStar,
  stream: LuMonitor,
  community: LuUsers,
  special: LuStar,
}

const eventTypeLabels: Record<string, string> = {
  tournament: "Torneio",
  training: "Treinamento",
  stream: "Live Stream",
  community: "Comunidade",
  special: "Especial",
}

function NewsCard({ post, featured = false }: { post: NewsPost; featured?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <Box
      p="5" rounded="2xl"
      bg="rgba(26,0,48,0.8)"
      borderWidth="1px"
      borderColor={featured ? "rgba(245,158,11,0.3)" : "rgba(139,47,201,0.2)"}
      _hover={{ borderColor: featured ? "rgba(245,158,11,0.5)" : "rgba(139,47,201,0.4)", transform: "translateY(-2px)" }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => setExpanded(!expanded)}
      position="relative"
      overflow="hidden"
    >
      {featured && (
        <Box
          position="absolute" top="0" left="0" right="0" height="3px"
          css={{ background: "linear-gradient(90deg, #FFD700, #F59E0B)" }}
        />
      )}
      <HStack gap="2" mb="3" flexWrap="wrap">
        <Badge colorPalette={categoryColors[post.category] ?? "gray"} variant="subtle" gap="1">
          <Icon as={categoryIcons[post.category] ?? LuNewspaper} fontSize="xs" />
          {post.category}
        </Badge>
        {post.is_featured && (
          <Badge colorPalette="yellow" variant="subtle" gap="1">
            <Icon as={LuStar} fontSize="xs" />
            Destaque
          </Badge>
        )}
      </HStack>

      <Text fontWeight="bold" color="white" fontSize="md" mb="2" lineHeight="short">
        {post.title}
      </Text>

      <Text
        fontSize="sm" color="gray.400" lineHeight="tall"
        lineClamp={expanded ? undefined : 3}
      >
        {expanded ? post.content : post.excerpt || post.content}
      </Text>

      <HStack mt="3" gap="3" justify="space-between">
        <HStack gap="2">
          <Text fontSize="xs" color="purple.400" fontWeight="medium">{post.author_name}</Text>
          <Text fontSize="xs" color="gray.600">·</Text>
          <HStack gap="1">
            <Icon as={LuClock} color="gray.500" fontSize="xs" />
            <Text fontSize="xs" color="gray.500">
              {new Date(post.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
            </Text>
          </HStack>
        </HStack>
        <Text fontSize="xs" color="gold.400" cursor="pointer">
          {expanded ? "Recolher ↑" : "Ler mais →"}
        </Text>
      </HStack>
    </Box>
  )
}

function EventCard({ event }: { event: Event }) {
  const now = new Date()
  const start = new Date(event.start_time)
  const isPast = start < now
  const isToday = start.toDateString() === now.toDateString()
  const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Box
      p="5" rounded="2xl"
      bg="rgba(26,0,48,0.8)"
      borderWidth="1px"
      borderColor={event.is_featured ? "rgba(245,158,11,0.3)" : "rgba(139,47,201,0.2)"}
      _hover={{ borderColor: "rgba(139,47,201,0.4)", transform: "translateY(-2px)" }}
      transition="all 0.2s"
      opacity={isPast ? 0.6 : 1}
    >
      <HStack gap="4" align="start">
        <Box
          p="3" rounded="xl" flexShrink="0"
          css={{ background: eventTypeColors[event.event_type] ?? "linear-gradient(135deg, #8B2FC9, #6A0F91)" }}
        >
          <Icon as={eventTypeIcons[event.event_type] ?? LuCalendar} color="white" fontSize="xl" />
        </Box>
        <Box flex="1" minW="0">
          <HStack gap="2" mb="1" flexWrap="wrap">
            <Badge
              size="sm" variant="subtle"
              style={{
                background: `${(eventTypeColors[event.event_type] ?? "").split(", ")[1]?.split(")")[0]}22`,
                color: "white",
              }}
            >
              {eventTypeLabels[event.event_type] ?? event.event_type}
            </Badge>
            {event.is_featured && <Badge colorPalette="yellow" size="sm" variant="subtle">Destaque</Badge>}
            {isToday && <Badge colorPalette="red" size="sm" variant="solid">HOJE</Badge>}
            {!isPast && !isToday && daysUntil <= 7 && (
              <Badge colorPalette="orange" size="sm" variant="subtle">Em {daysUntil}d</Badge>
            )}
          </HStack>

          <Text fontWeight="bold" color="white" fontSize="md" mb="1">{event.title}</Text>
          {event.description && (
            <Text fontSize="xs" color="gray.400" mb="2" lineClamp={2}>{event.description}</Text>
          )}

          <VStack gap="1" align="start">
            <HStack gap="2">
              <Icon as={LuCalendar} color="purple.400" fontSize="xs" />
              <Text fontSize="xs" color="gray.300">
                {new Date(event.start_time).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })} às{" "}
                {new Date(event.start_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </HStack>
            <HStack gap="2">
              <Icon as={LuMapPin} color="blue.400" fontSize="xs" />
              <Text fontSize="xs" color="gray.300">{event.location}</Text>
            </HStack>
            {event.max_participants && (
              <HStack gap="2">
                <Icon as={LuUsers} color="green.400" fontSize="xs" />
                <Text fontSize="xs" color="gray.300">Máx. {event.max_participants} participantes</Text>
              </HStack>
            )}
          </VStack>
        </Box>
      </HStack>
    </Box>
  )
}

function EventCalendar({ events }: { events: Event[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const eventsByDay: Record<number, Event[]> = {}
  for (const e of events) {
    const d = new Date(e.start_time)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!eventsByDay[day]) eventsByDay[day] = []
      eventsByDay[day].push(e)
    }
  }

  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))
  const today = new Date()

  return (
    <Box p="5" rounded="2xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
      <Flex justify="space-between" align="center" mb="4">
        <Box as="button" px="3" py="1" rounded="lg" color="gray.400"
          _hover={{ bg: "rgba(139,47,201,0.1)", color: "white" }}
          onClick={() => setCurrentMonth(new Date(year, month - 1))}>←</Box>
        <Text fontWeight="bold" color="white" fontSize="sm">
          {currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </Text>
        <Box as="button" px="3" py="1" rounded="lg" color="gray.400"
          _hover={{ bg: "rgba(139,47,201,0.1)", color: "white" }}
          onClick={() => setCurrentMonth(new Date(year, month + 1))}>→</Box>
      </Flex>

      <Grid templateColumns="repeat(7, 1fr)" gap="0.5" mb="1">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <Box key={i} textAlign="center" py="1">
            <Text fontSize="2xs" color="gray.500" fontWeight="bold">{d}</Text>
          </Box>
        ))}
      </Grid>

      <Grid templateColumns="repeat(7, 1fr)" gap="0.5">
        {cells.map((day, i) => {
          if (!day) return <Box key={`empty-${i}`} />
          const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
          const hasEvents = !!eventsByDay[day]
          return (
            <Box
              key={day}
              p="1" rounded="lg" textAlign="center" minH="8"
              bg={isToday ? "rgba(139,47,201,0.3)" : "transparent"}
              borderWidth={isToday ? "1px" : "0px"}
              borderColor="rgba(139,47,201,0.5)"
              position="relative"
            >
              <Text fontSize="xs" color={isToday ? "white" : "gray.400"} fontWeight={isToday ? "bold" : "normal"}>
                {day}
              </Text>
              {hasEvents && (
                <Flex justify="center" gap="0.5" mt="0.5">
                  {eventsByDay[day].slice(0, 3).map((e, ei) => (
                    <Box
                      key={ei}
                      w="4px" h="4px" rounded="full"
                      css={{ background: eventTypeColors[e.event_type]?.split(", ")[1]?.split(")")[0] ?? "#8B2FC9" }}
                    />
                  ))}
                </Flex>
              )}
            </Box>
          )
        })}
      </Grid>
    </Box>
  )
}

export function NewsPage() {
  const [news, setNews] = useState<NewsPost[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    supabase.from("news_posts").select("*").order("published_at", { ascending: false }).then(({ data }) => {
      if (data) setNews(data as NewsPost[])
    })
    supabase.from("events").select("*").order("start_time", { ascending: true }).then(({ data }) => {
      if (data) setEvents(data as Event[])
    })
  }, [])

  const filteredNews = filter === "all" ? news : news.filter(n => n.category === filter)
  const upcomingEvents = events.filter(e => new Date(e.start_time) >= new Date())
  const featuredNews = news.filter(n => n.is_featured)

  const categories = ["all", ...Array.from(new Set(news.map(n => n.category)))]

  return (
    <Box>
      <Heading size="xl" fontWeight="black" color="white" mb="2">Notícias & Eventos</Heading>
      <Text color="gray.400" mb="6" fontSize="sm">Fique atualizado sobre poker e a comunidade The Resenha Club</Text>

      {/* Featured banner */}
      {featuredNews.length > 0 && (
        <Box
          mb="8" p="6" rounded="2xl"
          bg="linear-gradient(135deg, #2D0050, #4A0072)"
          borderWidth="1px" borderColor="rgba(245,158,11,0.3)"
          position="relative" overflow="hidden"
        >
          <Box
            position="absolute" top="-30%" right="-5%"
            w="250px" h="250px" rounded="full"
            bg="radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)"
            pointerEvents="none"
          />
          <Badge colorPalette="yellow" variant="subtle" mb="3" gap="1">
            <Icon as={LuStar} fontSize="xs" />
            Em Destaque
          </Badge>
          <Text fontWeight="black" color="white" fontSize="xl" mb="2" position="relative">
            {featuredNews[0].title}
          </Text>
          <Text color="gray.300" fontSize="sm" lineClamp={2} position="relative">
            {featuredNews[0].excerpt || featuredNews[0].content}
          </Text>
        </Box>
      )}

      <Tabs.Root defaultValue="news" variant="line">
        <Tabs.List borderColor="rgba(139,47,201,0.2)" mb="6">
          <Tabs.Trigger value="news" color="gray.400" _selected={{ color: "gold.400", borderColor: "gold.400" }}>
            <Icon as={LuNewspaper} mr="2" />
            Notícias
          </Tabs.Trigger>
          <Tabs.Trigger value="events" color="gray.400" _selected={{ color: "gold.400", borderColor: "gold.400" }}>
            <Icon as={LuCalendar} mr="2" />
            Eventos ({upcomingEvents.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="calendar" color="gray.400" _selected={{ color: "gold.400", borderColor: "gold.400" }}>
            Calendário
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="news">
          {/* Category filter */}
          <HStack gap="2" mb="6" flexWrap="wrap">
            {categories.map(cat => (
              <Box
                key={cat}
                as="button"
                px="3" py="1.5" rounded="full" fontSize="xs" fontWeight="semibold"
                cursor="pointer"
                borderWidth="1px"
                transition="all 0.15s"
                borderColor={filter === cat ? "gold.400" : "rgba(139,47,201,0.2)"}
                bg={filter === cat ? "rgba(245,158,11,0.15)" : "transparent"}
                color={filter === cat ? "gold.400" : "gray.400"}
                onClick={() => setFilter(cat)}
              >
                {cat === "all" ? "Todos" : cat}
              </Box>
            ))}
          </HStack>

          {filteredNews.length === 0 ? (
            <Box textAlign="center" py="16">
              <Text color="gray.400">Nenhuma notícia disponível</Text>
            </Box>
          ) : (
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
              {filteredNews.map(post => (
                <NewsCard key={post.id} post={post} featured={post.is_featured} />
              ))}
            </Grid>
          )}
        </Tabs.Content>

        <Tabs.Content value="events">
          <VStack gap="4" align="stretch">
            {upcomingEvents.length === 0 ? (
              <Box textAlign="center" py="16">
                <Text fontSize="3xl" mb="3">📅</Text>
                <Text color="gray.400">Nenhum evento próximo</Text>
              </Box>
            ) : (
              upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))
            )}
          </VStack>
        </Tabs.Content>

        <Tabs.Content value="calendar">
          <Grid templateColumns={{ base: "1fr", lg: "1fr 320px" }} gap="6">
            <EventCalendar events={events} />
            <VStack gap="3" align="stretch">
              <Text fontWeight="bold" color="white" fontSize="sm">Próximos Eventos</Text>
              {upcomingEvents.slice(0, 5).map(e => (
                <Box key={e.id} p="3" rounded="xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
                  <HStack gap="3">
                    <Box
                      p="2" rounded="lg" flexShrink="0"
                      css={{ background: eventTypeColors[e.event_type] ?? "linear-gradient(135deg, #8B2FC9, #6A0F91)" }}
                    >
                      <Icon as={eventTypeIcons[e.event_type] ?? LuCalendar} color="white" fontSize="sm" />
                    </Box>
                    <Box flex="1" minW="0">
                      <Text fontSize="xs" fontWeight="semibold" color="white" truncate>{e.title}</Text>
                      <Text fontSize="2xs" color="gray.500">
                        {new Date(e.start_time).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Grid>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}
