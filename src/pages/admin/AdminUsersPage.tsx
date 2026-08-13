import { useState, useEffect } from "react"
import {
  Box, VStack, HStack, Text, Heading, Flex, Icon, Grid,
  Badge, Button, Drawer, Input, Separator, Switch,
} from "@chakra-ui/react"
import {
  LuUsers, LuMail, LuPlus, LuSearch, LuCopy, LuKeyRound, LuCheck,
} from "react-icons/lu"
import { Field } from "@/components/ui/field"
import { supabase, type Profile } from "@/lib/supabase"
import { toaster } from "@/components/ui/toaster"
import { Avatar } from "@/components/ui/avatar"

export function AdminUsersPage() {
  const { session } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [newUser, setNewUser] = useState({ email: "", username: "", displayName: "" })
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setUsers(data as Profile[])
    setLoading(false)
  }

  function generateTempPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
    let pw = ""
    for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)]
    setGeneratedPassword(pw)
  }

  async function createUser() {
    if (!newUser.email || !generatedPassword) {
      toaster.create({ title: "Preencha e-mail e gere a senha", type: "error" })
      return
    }
    setCreating(true)
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token ?? ""}`,
          "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          action: "create_user",
          email: newUser.email,
          password: generatedPassword,
          username: newUser.username || newUser.email.split("@")[0],
          displayName: newUser.displayName || newUser.username,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error ?? err.message ?? "Erro ao criar usuário")
      }

      toaster.create({ title: "Usuário criado!", type: "success" })
      setCreateOpen(false)
      setNewUser({ email: "", username: "", displayName: "" })
      setGeneratedPassword("")
      await loadUsers()
    } catch (err) {
      toaster.create({
        title: "Erro ao criar usuário",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        type: "error",
      })
    } finally {
      setCreating(false)
    }
  }

  async function regeneratePassword(user: Profile) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
    let pw = ""
    for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)]

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token ?? ""}`,
          "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          action: "reset_password",
          userId: user.id,
          newPassword: pw,
        }),
      })

      if (!response.ok) throw new Error("Erro ao redefinir senha")

      toaster.create({
        title: "Senha regenerada!",
        description: `Nova senha: ${pw}`,
        type: "success",
      })
      await loadUsers()
    } catch (err) {
      toaster.create({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        type: "error",
      })
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.username?.toLowerCase().includes(q) ||
      u.display_name?.toLowerCase().includes(q) ||
      u.id.includes(q)
    )
  })

  return (
    <Box>
      <VStack gap="2" mb="8" align="start">
        <HStack gap="2">
          <Box p="2" rounded="lg" bg="rgba(245,158,11,0.1)" borderWidth="1px" borderColor="rgba(245,158,11,0.3)">
            <Icon as={LuUsers} color="gold.400" fontSize="lg" />
          </Box>
          <Heading size="xl" fontWeight="black" color="white">Gestão de Usuários</Heading>
        </HStack>
        <Text color="gray.400" fontSize="sm">Crie e gerencie contas de membros do clube</Text>
      </VStack>

      <Flex justify="space-between" align="center" mb="4" gap="4" direction={{ base: "column", sm: "row" }}>
        <HStack gap="2" flex="1" maxW="400px">
          <Input
            placeholder="Buscar usuário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg="rgba(139,47,201,0.1)"
            borderColor="rgba(139,47,201,0.3)"
            color="white"
            _placeholder={{ color: "gray.500" }}
            _focus={{ borderColor: "brand.400" }}
          />
          <Icon as={LuSearch} color="gray.500" />
        </HStack>
        <Button
          fontWeight="semibold"
          css={{
            background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
            border: "1px solid rgba(245,158,11,0.3)",
            color: "white",
            "&:hover": { background: "linear-gradient(135deg, #9D44F0, #7B1FA2)" },
          }}
          onClick={() => { setCreateOpen(true); setGeneratedPassword("") }}
        >
          <Icon as={LuPlus} mr="2" /> Novo Usuário
        </Button>
      </Flex>

      <Box p="5" rounded="2xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
        {loading ? (
          <Text color="gray.500" fontSize="sm">Carregando...</Text>
        ) : filtered.length === 0 ? (
          <Box textAlign="center" py="8">
            <Icon as={LuUsers} fontSize="3xl" color="purple.400" mb="3" />
            <Text color="gray.400" fontSize="sm">Nenhum usuário encontrado</Text>
          </Box>
        ) : (
          <VStack gap="2" align="stretch">
            {filtered.map((user) => (
              <Box
                key={user.id}
                p="4" rounded="xl"
                bg="rgba(139,47,201,0.05)"
                borderWidth="1px"
                borderColor="rgba(139,47,201,0.1)"
                _hover={{ borderColor: "rgba(139,47,201,0.3)" }}
                transition="all 0.2s"
              >
                <Flex justify="space-between" align="center" gap="4" direction={{ base: "column", sm: "row" }}>
                  <HStack gap="3" flex="1" minW="0">
                    <Avatar
                      size="sm"
                      name={user.display_name ?? user.username ?? "User"}
                      src={user.avatar_url ?? undefined}
                    />
                    <Box flex="1" minW="0">
                      <HStack gap="2">
                        <Text fontSize="sm" fontWeight="semibold" color="white" truncate>
                          {user.display_name ?? user.username ?? "Sem nome"}
                        </Text>
                        {user.role === "admin" && (
                          <Badge colorPalette="yellow" size="sm" variant="subtle">Admin</Badge>
                        )}
                        {user.role === "developer" && (
                          <Badge colorPalette="purple" size="sm" variant="subtle">Dev</Badge>
                        )}
                        {user.must_change_password && (
                          <Badge colorPalette="orange" size="sm" variant="subtle">Senha pendente</Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.500" truncate>
                        @{user.username ?? "username"}
                      </Text>
                    </Box>
                  </HStack>

                  <HStack gap="2" flexShrink="0">
                    <Button
                      size="xs" variant="outline"
                      borderColor="rgba(245,158,11,0.3)"
                      color="gold.400"
                      _hover={{ bg: "rgba(245,158,11,0.1)" }}
                      onClick={() => regeneratePassword(user)}
                    >
                      <Icon as={LuKeyRound} mr="1" /> Nova Senha
                    </Button>
                  </HStack>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      {/* Create user drawer */}
      <Drawer.Root open={createOpen} onOpenChange={(e) => !e.open && setCreateOpen(false)}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title color="white">Criar Novo Usuário</Drawer.Title>
            <Drawer.CloseTrigger />
          </Drawer.Header>
          <Drawer.Body>
            <VStack gap="4" align="stretch">
              <Text color="gray.400" fontSize="sm">
                Crie uma conta de membro. A senha temporária será exibida para você compartilhar
                manualmente (o envio automático por e-mail será habilitado em breve).
              </Text>

              <Field label="E-mail" required>
                <Input
                  type="email"
                  placeholder="novo@membro.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  bg="rgba(139,47,201,0.1)"
                  borderColor="rgba(139,47,201,0.3)"
                  color="white"
                  _placeholder={{ color: "gray.500" }}
                />
              </Field>

              <Field label="Nome de exibição">
                <Input
                  placeholder="Nome do membro"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                  bg="rgba(139,47,201,0.1)"
                  borderColor="rgba(139,47,201,0.3)"
                  color="white"
                  _placeholder={{ color: "gray.500" }}
                />
              </Field>

              <Field label="Username">
                <Input
                  placeholder="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  bg="rgba(139,47,201,0.1)"
                  borderColor="rgba(139,47,201,0.3)"
                  color="white"
                  _placeholder={{ color: "gray.500" }}
                />
              </Field>

              <Field label="Senha temporária" required>
                <HStack gap="2">
                  <Input
                    readOnly
                    placeholder="Clique para gerar"
                    value={generatedPassword}
                    bg="rgba(139,47,201,0.1)"
                    borderColor="rgba(139,47,201,0.3)"
                    color="white"
                  />
                  <Button
                    variant="outline"
                    borderColor="rgba(139,47,201,0.4)"
                    color="purple.300"
                    _hover={{ bg: "rgba(139,47,201,0.1)" }}
                    onClick={generateTempPassword}
                  >
                    Gerar
                  </Button>
                </HStack>
              </Field>

              {generatedPassword && (
                <Box p="4" rounded="lg" bg="rgba(245,158,11,0.1)" borderWidth="1px" borderColor="rgba(245,158,11,0.3)">
                  <Text fontSize="xs" color="gold.400" fontWeight="semibold" mb="1">Senha temporária:</Text>
                  <Text fontSize="md" color="white" fontFamily="mono" fontWeight="bold">{generatedPassword}</Text>
                </Box>
              )}

              <Button
                w="full" loading={creating} fontWeight="bold"
                disabled={!generatedPassword || !newUser.email}
                css={{
                  background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
                  border: "1px solid rgba(245,158,11,0.3)",
                  color: "white",
                  "&:hover:not(:disabled)": { background: "linear-gradient(135deg, #9D44F0, #7B1FA2)" },
                }}
                onClick={createUser}
              >
                Criar Usuário
              </Button>
            </VStack>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </Box>
  )
}
