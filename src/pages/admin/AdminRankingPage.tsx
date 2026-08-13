import { useState, useEffect } from "react"
import {
  Box, VStack, HStack, Text, Heading, Flex, Icon, Grid,
  Button, Drawer, Input, Separator,
} from "@chakra-ui/react"
import {
  LuTrophy, LuPlus, LuPencil, LuTrash2, LuMedal, LuCrown,
} from "react-icons/lu"
import { Field } from "@/components/ui/field"
import { supabase, type Champion } from "@/lib/supabase"
import { toaster } from "@/components/ui/toaster"
import { Avatar } from "@/components/ui/avatar"

export function AdminRankingPage() {
  const [champions, setChampions] = useState<Champion[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<Champion | null>(null)
  const [form, setForm] = useState({
    name: "", photo_url: "", titles_count: 0, last_victory: "", victory_date: "", sort_order: 0,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadChampions()
  }, [])

  async function loadChampions() {
    setLoading(true)
    const { data } = await supabase.from("champions").select("*").order("sort_order")
    if (data) setChampions(data as Champion[])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: "", photo_url: "", titles_count: 0, last_victory: "", victory_date: "", sort_order: champions.length })
    setEditOpen(true)
  }

  function openEdit(champ: Champion) {
    setEditing(champ)
    setForm({
      name: champ.name,
      photo_url: champ.photo_url,
      titles_count: champ.titles_count,
      last_victory: champ.last_victory,
      victory_date: champ.victory_date ?? "",
      sort_order: champ.sort_order,
    })
    setEditOpen(true)
  }

  async function save() {
    if (!form.name) {
      toaster.create({ title: "Nome é obrigatório", type: "error" })
      return
    }
    setSaving(true)
    const payload = {
      name: form.name,
      photo_url: form.photo_url,
      titles_count: form.titles_count,
      last_victory: form.last_victory,
      victory_date: form.victory_date || null,
      sort_order: form.sort_order,
    }
    if (editing) {
      const { error } = await supabase.from("champions").update(payload).eq("id", editing.id)
      if (error) toaster.create({ title: "Erro", description: error.message, type: "error" })
      else toaster.create({ title: "Campeão atualizado!", type: "success" })
    } else {
      const { error } = await supabase.from("champions").insert(payload)
      if (error) toaster.create({ title: "Erro", description: error.message, type: "error" })
      else toaster.create({ title: "Campeão adicionado!", type: "success" })
    }
    setSaving(false)
    setEditOpen(false)
    await loadChampions()
  }

  async function remove(champ: Champion) {
    if (!confirm(`Remover ${champ.name} do ranking?`)) return
    const { error } = await supabase.from("champions").delete().eq("id", champ.id)
    if (error) toaster.create({ title: "Erro", description: error.message, type: "error" })
    else toaster.create({ title: "Campeão removido", type: "success" })
    await loadChampions()
  }

  return (
    <Box>
      <VStack gap="2" mb="8" align="start">
        <HStack gap="2">
          <Box p="2" rounded="lg" bg="rgba(245,158,11,0.1)" borderWidth="1px" borderColor="rgba(245,158,11,0.3)">
            <Icon as={LuTrophy} color="gold.400" fontSize="lg" />
          </Box>
          <Heading size="xl" fontWeight="black" color="white">Gestão do Ranking</Heading>
        </HStack>
        <Text color="gray.400" fontSize="sm">Adicione, edite e remova campeões do clube</Text>
      </VStack>

      <Flex justify="end" mb="4">
        <Button
          fontWeight="semibold"
          css={{
            background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
            border: "1px solid rgba(245,158,11,0.3)",
            color: "white",
            "&:hover": { background: "linear-gradient(135deg, #9D44F0, #7B1FA2)" },
          }}
          onClick={openCreate}
        >
          <Icon as={LuPlus} mr="2" /> Adicionar Campeão
        </Button>
      </Flex>

      <Box p="5" rounded="2xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
        {loading ? (
          <Text color="gray.500" fontSize="sm">Carregando...</Text>
        ) : champions.length === 0 ? (
          <Box textAlign="center" py="8">
            <Icon as={LuTrophy} fontSize="3xl" color="purple.400" mb="3" />
            <Text color="gray.400" fontSize="sm">Nenhum campeão cadastrado</Text>
          </Box>
        ) : (
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
            {champions.map((champ, i) => (
              <Box
                key={champ.id}
                p="4" rounded="xl"
                bg="rgba(139,47,201,0.05)"
                borderWidth="1px"
                borderColor="rgba(139,47,201,0.1)"
                _hover={{ borderColor: "rgba(139,47,201,0.3)" }}
                transition="all 0.2s"
              >
                <Flex justify="space-between" align="start" gap="3">
                  <HStack gap="3" flex="1" minW="0">
                    <Box
                      w="12" h="12" rounded="full" overflow="hidden" flexShrink="0"
                      border="2px solid"
                      borderColor={i < 3 ? ["#FFD700", "#C0C0C0", "#CD7F32"][i] : "rgba(139,47,201,0.3)"}
                    >
                      {champ.photo_url ? (
                        <Box w="full" h="full" bg="rgba(139,47,201,0.2)" display="flex" alignItems="center" justifyContent="center">
                          <Icon as={LuTrophy} color="purple.300" />
                        </Box>
                      ) : (
                        <Box w="full" h="full" bg="rgba(139,47,201,0.2)" display="flex" alignItems="center" justifyContent="center">
                          <Icon as={LuTrophy} color="purple.300" />
                        </Box>
                      )}
                    </Box>
                    <Box flex="1" minW="0">
                      <Text fontSize="sm" fontWeight="semibold" color="white" truncate>{champ.name}</Text>
                      <HStack gap="2" mt="1">
                        <Icon as={LuTrophy} color="gold.400" fontSize="xs" />
                        <Text fontSize="xs" color="gold.400">{champ.titles_count} título{champ.titles_count !== 1 ? "s" : ""}</Text>
                      </HStack>
                      {champ.last_victory && (
                        <Text fontSize="xs" color="gray.500" mt="1" truncate>Última: {champ.last_victory}</Text>
                      )}
                    </Box>
                  </HStack>
                  <HStack gap="1" flexShrink="0">
                    <Button size="xs" variant="ghost" color="purple.300" _hover={{ bg: "rgba(139,47,201,0.1)" }} onClick={() => openEdit(champ)}>
                      <Icon as={LuPencil} />
                    </Button>
                    <Button size="xs" variant="ghost" color="red.400" _hover={{ bg: "rgba(239,68,68,0.1)" }} onClick={() => remove(champ)}>
                      <Icon as={LuTrash2} />
                    </Button>
                  </HStack>
                </Flex>
              </Box>
            ))}
          </Grid>
        )}
      </Box>

      {/* Edit/Create drawer */}
      <Drawer.Root open={editOpen} onOpenChange={(e) => !e.open && setEditOpen(false)}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title color="white">{editing ? "Editar Campeão" : "Adicionar Campeão"}</Drawer.Title>
            <Drawer.CloseTrigger />
          </Drawer.Header>
          <Drawer.Body>
            <VStack gap="4" align="stretch">
              <Field label="Nome" required>
                <Input
                  placeholder="Nome do campeão"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  bg="rgba(139,47,201,0.1)"
                  borderColor="rgba(139,47,201,0.3)"
                  color="white"
                  _placeholder={{ color: "gray.500" }}
                />
              </Field>

              <Field label="URL da foto">
                <Input
                  placeholder="https://..."
                  value={form.photo_url}
                  onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                  bg="rgba(139,47,201,0.1)"
                  borderColor="rgba(139,47,201,0.3)"
                  color="white"
                  _placeholder={{ color: "gray.500" }}
                />
              </Field>

              <Field label="Número de títulos">
                <Input
                  type="number"
                  value={form.titles_count}
                  onChange={(e) => setForm({ ...form, titles_count: parseInt(e.target.value) || 0 })}
                  bg="rgba(139,47,201,0.1)"
                  borderColor="rgba(139,47,201,0.3)"
                  color="white"
                />
              </Field>

              <Field label="Última vitória">
                <Input
                  placeholder="Ex: Torneio Mensal Jan/2025"
                  value={form.last_victory}
                  onChange={(e) => setForm({ ...form, last_victory: e.target.value })}
                  bg="rgba(139,47,201,0.1)"
                  borderColor="rgba(139,47,201,0.3)"
                  color="white"
                  _placeholder={{ color: "gray.500" }}
                />
              </Field>

              <Field label="Data da vitória">
                <Input
                  type="date"
                  value={form.victory_date}
                  onChange={(e) => setForm({ ...form, victory_date: e.target.value })}
                  bg="rgba(139,47,201,0.1)"
                  borderColor="rgba(139,47,201,0.3)"
                  color="white"
                />
              </Field>

              <Field label="Ordem (menor = topo)">
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  bg="rgba(139,47,201,0.1)"
                  borderColor="rgba(139,47,201,0.3)"
                  color="white"
                />
              </Field>

              <Button
                w="full" loading={saving} fontWeight="bold"
                css={{
                  background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
                  border: "1px solid rgba(245,158,11,0.3)",
                  color: "white",
                  "&:hover:not(:disabled)": { background: "linear-gradient(135deg, #9D44F0, #7B1FA2)" },
                }}
                onClick={save}
              >
                {editing ? "Salvar Alterações" : "Adicionar Campeão"}
              </Button>
            </VStack>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </Box>
  )
}
