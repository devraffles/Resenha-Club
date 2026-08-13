import { useState, useEffect } from "react"
import {
  Box, VStack, HStack, Text, Heading, Flex, Icon, Button, Badge, Grid,
  Input, Tabs, Table
} from "@chakra-ui/react"
import { LuTrophy, LuPlus, LuUsers, LuCalendar, LuCheck, LuMedal, LuStar, LuX } from "react-icons/lu"
import { useAuth } from "../lib/auth"
import { supabase, type Tournament, type GlobalRanking } from "../lib/supabase"
import { Field } from "../components/ui/field"
import { Avatar as ChakraAvatar } from "../components/ui/avatar"

function TournamentCard({ tournament, onJoin, currentUserId }: {
  tournament: Tournament & { creator?: { username: string }; participants_count?: number }
  onJoin: (id: string) => void
  currentUserId?: string
}) {
  const statusColors = {
    registration: { color: "green", label: "Inscrições Abertas" },
    active: { color: "yellow", label: "Em Andamento" },
    completed: { color: "gray", label: "Finalizado" },
    cancelled: { color: "red", label: "Cancelado" },
  }
  const s = statusColors[tournament.status]

  return (
    <Box
      p="5" rounded="2xl"
      bg="rgba(26,0,48,0.8)"
      borderWidth="1px"
      borderColor="rgba(139,47,201,0.2)"
      _hover={{ borderColor: "rgba(139,47,201,0.4)", transform: "translateY(-2px)", shadow: "0 8px 24px rgba(139,47,201,0.15)" }}
      transition="all 0.2s"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute" top="0" left="0" right="0" height="3px"
        css={{ background: "linear-gradient(90deg, #8B2FC9, #F59E0B)" }}
      />
      <Flex justify="space-between" align="start" mb="3">
        <Box flex="1" minW="0">
          <Text fontWeight="bold" color="white" fontSize="md" truncate>{tournament.name}</Text>
          <Text fontSize="xs" color="gray.400" mt="0.5">{tournament.poker_type}</Text>
        </Box>
        <Badge colorPalette={s.color} variant="subtle" flexShrink="0" ml="2">{s.label}</Badge>
      </Flex>

      <Grid templateColumns="repeat(2, 1fr)" gap="3" mb="4">
        <HStack gap="2">
          <Icon as={LuUsers} color="purple.400" fontSize="sm" />
          <Text fontSize="xs" color="gray.400">
            <Text as="span" color="white" fontWeight="semibold">{tournament.current_players}</Text>/{tournament.max_players}
          </Text>
        </HStack>
        <HStack gap="2">
          <Icon as={LuStar} color="gold.400" fontSize="sm" />
          <Text fontSize="xs" color="gray.400">
            Buy-in: <Text as="span" color="white" fontWeight="semibold">{tournament.buy_in === 0 ? "Grátis" : `${tournament.buy_in} pts`}</Text>
          </Text>
        </HStack>
        <HStack gap="2">
          <Icon as={LuCalendar} color="blue.400" fontSize="sm" />
          <Text fontSize="xs" color="gray.400">
            {new Date(tournament.start_time).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
          </Text>
        </HStack>
        <HStack gap="2">
          <Icon as={LuTrophy} color="yellow.400" fontSize="sm" />
          <Text fontSize="xs" color="gray.400">
            Prize: <Text as="span" color="white" fontWeight="semibold">{tournament.prize_pool === 0 ? "Pontos" : `${tournament.prize_pool} pts`}</Text>
          </Text>
        </HStack>
      </Grid>

      {tournament.description && (
        <Text fontSize="xs" color="gray.500" mb="4" lineClamp={2}>{tournament.description}</Text>
      )}

      {tournament.status === "registration" && (
        <Button
          size="sm"
          w="full"
          onClick={() => onJoin(tournament.id)}
          css={{
            background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
            border: "1px solid rgba(245,158,11,0.3)",
            color: "white",
            "&:hover": { background: "linear-gradient(135deg, #9D44F0, #7B1FA2)" },
          }}
        >
          <Icon as={LuCheck} mr="1" />
          Inscrever-se
        </Button>
      )}
    </Box>
  )
}

function RankingRow({ ranking, index }: { ranking: GlobalRanking & { profiles: { display_name: string; username: string; avatar_url: string | null } }; index: number }) {
  const medalColors = ["linear-gradient(135deg, #FFD700, #F59E0B)", "linear-gradient(135deg, #C0C0C0, #A8A8A8)", "linear-gradient(135deg, #CD7F32, #B8860B)"]
  return (
    <Table.Row _hover={{ bg: "rgba(139,47,201,0.08)" }}>
      <Table.Cell>
        <Box
          w="8" h="8" rounded="full" display="flex" alignItems="center" justifyContent="center"
          css={{ background: index < 3 ? medalColors[index] : "rgba(139,47,201,0.2)" }}
        >
          {index < 3
            ? <Icon as={LuMedal} color="white" fontSize="sm" />
            : <Text fontSize="xs" fontWeight="bold" color="white">#{index + 1}</Text>
          }
        </Box>
      </Table.Cell>
      <Table.Cell>
        <HStack gap="3">
          <ChakraAvatar size="xs" name={ranking.profiles?.display_name ?? ranking.profiles?.username ?? "Player"} src={ranking.profiles?.avatar_url ?? undefined} />
          <Text fontSize="sm" color="white" fontWeight="medium">
            {ranking.profiles?.display_name ?? ranking.profiles?.username ?? "Player"}
          </Text>
        </HStack>
      </Table.Cell>
      <Table.Cell>
        <Text fontSize="sm" fontWeight="bold" color="gold.400">{ranking.points}</Text>
      </Table.Cell>
      <Table.Cell>
        <Text fontSize="sm" color="green.400">{ranking.wins}</Text>
      </Table.Cell>
      <Table.Cell>
        <Text fontSize="sm" color="blue.400">{ranking.top3_finishes}</Text>
      </Table.Cell>
      <Table.Cell>
        <Text fontSize="sm" color="gray.400">{ranking.tournaments_played}</Text>
      </Table.Cell>
    </Table.Row>
  )
}

export function TournamentsPage() {
  const { user, profile } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [rankings, setRankings] = useState<GlobalRanking[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({
    name: "", description: "", max_players: "9", buy_in: "0",
    start_time: "", poker_type: "Texas Hold'em"
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [t, r, p] = await Promise.all([
      supabase.from("tournaments").select("*").order("start_time", { ascending: true }),
      supabase.from("global_rankings").select("*, profiles(username, display_name, avatar_url)").order("points", { ascending: false }).limit(20),
      user ? supabase.from("tournament_participants").select("tournament_id").eq("user_id", user.id) : Promise.resolve({ data: [] }),
    ])
    if (t.data) setTournaments(t.data as Tournament[])
    if (r.data) setRankings(r.data as unknown as GlobalRanking[])
    if (p.data) setJoinedIds(new Set((p.data as { tournament_id: string }[]).map(x => x.tournament_id)))
  }

  async function createTournament() {
    if (!user || !profile) return
    setCreating(true)
    const { data, error } = await supabase.from("tournaments").insert({
      creator_id: user.id,
      name: form.name,
      description: form.description,
      max_players: parseInt(form.max_players),
      buy_in: parseInt(form.buy_in),
      start_time: new Date(form.start_time).toISOString(),
      poker_type: form.poker_type,
    }).select().single()
    if (!error && data) {
      await loadData()
      setShowCreate(false)
      setForm({ name: "", description: "", max_players: "9", buy_in: "0", start_time: "", poker_type: "Texas Hold'em" })
    }
    setCreating(false)
  }

  async function joinTournament(tournamentId: string) {
    if (!user) return
    await supabase.from("tournament_participants").upsert({ tournament_id: tournamentId, user_id: user.id })
    await supabase.from("tournaments").update({ current_players: tournaments.find(t => t.id === tournamentId)!.current_players + 1 }).eq("id", tournamentId)
    setJoinedIds(prev => new Set([...prev, tournamentId]))
    await loadData()
  }

  const activeTournaments = tournaments.filter(t => t.status === "registration" || t.status === "active")
  const pastTournaments = tournaments.filter(t => t.status === "completed" || t.status === "cancelled")

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="6">
        <Box>
          <Heading size="xl" fontWeight="black" color="white" mb="1">Torneios & Ranking</Heading>
          <Text color="gray.400" fontSize="sm">Compete e suba no ranking da comunidade</Text>
        </Box>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          css={{
            background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
            border: "1px solid rgba(245,158,11,0.3)",
            color: "white",
          }}
        >
          <Icon as={showCreate ? LuX : LuPlus} mr="2" />
          {showCreate ? "Cancelar" : "Criar Torneio"}
        </Button>
      </Flex>

      {/* Create tournament form */}
      {showCreate && (
        <Box
          mb="8" p="6" rounded="2xl"
          bg="rgba(26,0,48,0.9)"
          borderWidth="1px" borderColor="rgba(245,158,11,0.3)"
          animationName="slide-from-top"
          animationDuration="fast"
        >
          <Text fontWeight="bold" color="white" mb="4" fontSize="lg">Criar Novo Torneio</Text>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
            <Field label="Nome do Torneio">
              <Input
                placeholder="Ex: Resenha Weekly #42"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                bg="rgba(139,47,201,0.1)" borderColor="rgba(139,47,201,0.3)"
                color="white" _placeholder={{ color: "gray.500" }}
              />
            </Field>
            <Field label="Tipo de Poker">
              <Input
                value={form.poker_type}
                onChange={e => setForm(f => ({ ...f, poker_type: e.target.value }))}
                bg="rgba(139,47,201,0.1)" borderColor="rgba(139,47,201,0.3)"
                color="white"
              />
            </Field>
            <Field label="Data/Hora de Início">
              <Input
                type="datetime-local"
                value={form.start_time}
                onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                bg="rgba(139,47,201,0.1)" borderColor="rgba(139,47,201,0.3)"
                color="white"
              />
            </Field>
            <Grid templateColumns="1fr 1fr" gap="3">
              <Field label="Jogadores">
                <Input
                  type="number" min="2" max="100"
                  value={form.max_players}
                  onChange={e => setForm(f => ({ ...f, max_players: e.target.value }))}
                  bg="rgba(139,47,201,0.1)" borderColor="rgba(139,47,201,0.3)"
                  color="white"
                />
              </Field>
              <Field label="Buy-in (pts)">
                <Input
                  type="number" min="0"
                  value={form.buy_in}
                  onChange={e => setForm(f => ({ ...f, buy_in: e.target.value }))}
                  bg="rgba(139,47,201,0.1)" borderColor="rgba(139,47,201,0.3)"
                  color="white"
                />
              </Field>
            </Grid>
            <Field label="Descrição" gridColumn={{ md: "1 / -1" }}>
              <Input
                placeholder="Descrição do torneio..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                bg="rgba(139,47,201,0.1)" borderColor="rgba(139,47,201,0.3)"
                color="white" _placeholder={{ color: "gray.500" }}
              />
            </Field>
          </Grid>
          <HStack mt="4" gap="3">
            <Button
              loading={creating}
              onClick={createTournament}
              disabled={!form.name || !form.start_time}
              css={{
                background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
                border: "1px solid rgba(245,158,11,0.3)",
                color: "white",
              }}
            >
              <Icon as={LuPlus} mr="2" />
              Criar Torneio
            </Button>
          </HStack>
        </Box>
      )}

      <Tabs.Root defaultValue="active" variant="line">
        <Tabs.List borderColor="rgba(139,47,201,0.2)" mb="6">
          <Tabs.Trigger value="active" color="gray.400" _selected={{ color: "gold.400", borderColor: "gold.400" }}>
            Ativos ({activeTournaments.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="ranking" color="gray.400" _selected={{ color: "gold.400", borderColor: "gold.400" }}>
            Ranking Global
          </Tabs.Trigger>
          <Tabs.Trigger value="past" color="gray.400" _selected={{ color: "gold.400", borderColor: "gold.400" }}>
            Histórico
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="active">
          {activeTournaments.length === 0 ? (
            <Box textAlign="center" py="16">
              <Text fontSize="4xl" mb="3">🏆</Text>
              <Text color="gray.400" fontSize="md">Nenhum torneio ativo no momento</Text>
              <Text color="gray.500" fontSize="sm">Crie um torneio para começar!</Text>
            </Box>
          ) : (
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }} gap="4">
              {activeTournaments.map(t => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  onJoin={joinTournament}
                  currentUserId={user?.id}
                />
              ))}
            </Grid>
          )}
        </Tabs.Content>

        <Tabs.Content value="ranking">
          <Box
            rounded="2xl"
            bg="rgba(26,0,48,0.8)"
            borderWidth="1px" borderColor="rgba(139,47,201,0.2)"
            overflow="hidden"
          >
            <Table.Root>
              <Table.Header>
                <Table.Row bg="rgba(139,47,201,0.1)">
                  <Table.ColumnHeader color="gray.400" fontSize="xs" textTransform="uppercase">#</Table.ColumnHeader>
                  <Table.ColumnHeader color="gray.400" fontSize="xs" textTransform="uppercase">Jogador</Table.ColumnHeader>
                  <Table.ColumnHeader color="gray.400" fontSize="xs" textTransform="uppercase">Pontos</Table.ColumnHeader>
                  <Table.ColumnHeader color="gray.400" fontSize="xs" textTransform="uppercase">Vitórias</Table.ColumnHeader>
                  <Table.ColumnHeader color="gray.400" fontSize="xs" textTransform="uppercase">Top 3</Table.ColumnHeader>
                  <Table.ColumnHeader color="gray.400" fontSize="xs" textTransform="uppercase">Torneios</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rankings.map((r, i) => (
                  <RankingRow
                    key={r.id}
                    ranking={r as unknown as GlobalRanking & { profiles: { display_name: string; username: string; avatar_url: string | null } }}
                    index={i}
                  />
                ))}
              </Table.Body>
            </Table.Root>
            {rankings.length === 0 && (
              <Box py="12" textAlign="center">
                <Text color="gray.400">Nenhum jogador no ranking ainda</Text>
              </Box>
            )}
          </Box>
        </Tabs.Content>

        <Tabs.Content value="past">
          {pastTournaments.length === 0 ? (
            <Box textAlign="center" py="16">
              <Text color="gray.400">Nenhum torneio finalizado ainda</Text>
            </Box>
          ) : (
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }} gap="4">
              {pastTournaments.map(t => (
                <TournamentCard key={t.id} tournament={t} onJoin={() => {}} currentUserId={user?.id} />
              ))}
            </Grid>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}
