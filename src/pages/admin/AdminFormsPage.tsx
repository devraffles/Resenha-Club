import { useState, useEffect } from "react"
import {
  Box, VStack, HStack, Text, Heading, Flex, Icon, Grid,
  Badge, Button, Drawer, Input, Textarea, Separator,
} from "@chakra-ui/react"
import {
  LuFileText, LuUsers, LuTrophy, LuImage, LuCheck, LuX,
  LuClock, LuMail, LuPhone, LuMapPin, LuInstagram, LuEye,
} from "react-icons/lu"
import { Field } from "@/components/ui/field"
import { supabase, type InterestSubmission, type Profile } from "@/lib/supabase"
import { toaster } from "@/components/ui/toaster"
import { useAuth } from "@/lib/auth"

export function AdminFormsPage() {
  const [submissions, setSubmissions] = useState<InterestSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<InterestSubmission | null>(null)
  const [approveOpen, setApproveOpen] = useState(false)
  const [newUser, setNewUser] = useState({ email: "", username: "", tempPassword: "" })
  const [creating, setCreating] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("")
  const { session } = useAuth()

  useEffect(() => {
    loadSubmissions()
  }, [])

  async function loadSubmissions() {
    setLoading(true)
    const { data } = await supabase
      .from("interest_submissions")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setSubmissions(data as InterestSubmission[])
    setLoading(false)
  }

  async function updateStatus(id: string, status: "approved" | "rejected") {
    const { error } = await supabase
      .from("interest_submissions")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id)
    if (error) {
      toaster.create({ title: "Erro ao atualizar", description: error.message, type: "error" })
    } else {
      toaster.create({ title: status === "approved" ? "Aprovado!" : "Recusado", type: "success" })
      await loadSubmissions()
      if (selected?.id === id) {
        setSelected({ ...selected, status })
      }
    }
  }

  function openApprove(submission: InterestSubmission) {
    setSelected(submission)
    setNewUser({
      email: "",
      username: submission.name.toLowerCase().replace(/\s+/g, "."),
      tempPassword: "",
    })
    setGeneratedPassword("")
    setApproveOpen(true)
  }

  function generateTempPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
    let pw = ""
    for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)]
    setNewUser({ ...newUser, tempPassword: pw })
    setGeneratedPassword(pw)
  }

  async function createUser() {
    if (!newUser.email || !newUser.tempPassword) {
      toaster.create({ title: "Preencha e-mail e senha", type: "error" })
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
          password: newUser.tempPassword,
          username: newUser.username,
          displayName: selected?.name ?? newUser.username,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error ?? err.message ?? "Erro ao criar usuário")
      }

      // Update submission status
      if (selected) {
        await updateStatus(selected.id, "approved")
      }

      toaster.create({
        title: "Usuário criado!",
        description: "Copie a senha temporária e compartilhe com o novo membro.",
        type: "success",
      })
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

  const statusConfig = {
    pending: { color: "yellow", label: "Pendente", icon: LuClock },
    approved: { color: "green", label: "Aprovado", icon: LuCheck },
    rejected: { color: "red", label: "Recusado", icon: LuX },
  }

  const pendingCount = submissions.filter((s) => s.status === "pending").length
  const approvedCount = submissions.filter((s) => s.status === "approved").length
  const rejectedCount = submissions.filter((s) => s.status === "rejected").length

  return (
    <Box>
      <VStack gap="2" mb="8" align="start">
        <HStack gap="2">
          <Box p="2" rounded="lg" bg="rgba(245,158,11,0.1)" borderWidth="1px" borderColor="rgba(245,158,11,0.3)">
            <Icon as={LuFileText} color="gold.400" fontSize="lg" />
          </Box>
          <Heading size="xl" fontWeight="black" color="white">Gestão de Formulários</Heading>
        </HStack>
        <Text color="gray.400" fontSize="sm">Avalie as solicitações de ingresso no clube</Text>
      </VStack>

      {/* Stats */}
      <Grid templateColumns="repeat(3, 1fr)" gap="4" mb="6">
        <StatBox label="Pendentes" value={pendingCount} color="#F59E0B" icon={LuClock} />
        <StatBox label="Aprovados" value={approvedCount} color="#22C55E" icon={LuCheck} />
        <StatBox label="Recusados" value={rejectedCount} color="#EF4444" icon={LuX} />
      </Grid>

      {/* Submissions list */}
      <Box p="5" rounded="2xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
        {loading ? (
          <Text color="gray.500" fontSize="sm">Carregando...</Text>
        ) : submissions.length === 0 ? (
          <Box textAlign="center" py="8">
            <Icon as={LuFileText} fontSize="3xl" color="purple.400" mb="3" />
            <Text color="gray.400" fontSize="sm">Nenhuma solicitação recebida ainda</Text>
          </Box>
        ) : (
          <VStack gap="2" align="stretch">
            {submissions.map((sub) => {
              const sc = statusConfig[sub.status]
              return (
                <Box
                  key={sub.id}
                  p="4" rounded="xl"
                  bg="rgba(139,47,201,0.05)"
                  borderWidth="1px"
                  borderColor="rgba(139,47,201,0.1)"
                  _hover={{ borderColor: "rgba(139,47,201,0.3)", bg: "rgba(139,47,201,0.08)" }}
                  transition="all 0.2s"
                >
                  <Flex justify="space-between" align="start" gap="4" direction={{ base: "column", md: "row" }}>
                    <Box flex="1" minW="0">
                      <HStack gap="2" mb="2">
                        <Text fontWeight="semibold" color="white" fontSize="sm">{sub.name}</Text>
                        <Badge colorPalette={sc.color as "yellow" | "green" | "red"} size="sm" variant="subtle">
                          {sc.label}
                        </Badge>
                      </HStack>
                      <HStack gap="4" flexWrap="wrap">
                        <HStack gap="1">
                          <Icon as={LuPhone} color="gray.500" fontSize="xs" />
                          <Text fontSize="xs" color="gray.400">{sub.phone}</Text>
                        </HStack>
                        {sub.instagram && (
                          <HStack gap="1">
                            <Icon as={LuInstagram} color="gray.500" fontSize="xs" />
                            <Text fontSize="xs" color="gray.400">{sub.instagram}</Text>
                          </HStack>
                        )}
                        <HStack gap="1">
                          <Icon as={LuMapPin} color="gray.500" fontSize="xs" />
                          <Text fontSize="xs" color="gray.400">{sub.city}</Text>
                        </HStack>
                      </HStack>
                      <Text fontSize="xs" color="gray.500" mt="2">
                        {new Date(sub.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      </Text>
                    </Box>

                    <HStack gap="2" flexShrink="0">
                      <Button
                        size="xs" variant="outline"
                        borderColor="rgba(139,47,201,0.3)"
                        color="purple.300"
                        _hover={{ bg: "rgba(139,47,201,0.1)" }}
                        onClick={() => setSelected(sub)}
                      >
                        <Icon as={LuEye} mr="1" /> Ver
                      </Button>
                      {sub.status === "pending" && (
                        <>
                          <Button
                            size="xs"
                            colorPalette="green"
                            variant="solid"
                            onClick={() => openApprove(sub)}
                          >
                            <Icon as={LuCheck} mr="1" /> Aprovar
                          </Button>
                          <Button
                            size="xs"
                            colorPalette="red"
                            variant="outline"
                            onClick={() => updateStatus(sub.id, "rejected")}
                          >
                            <Icon as={LuX} />
                          </Button>
                        </>
                      )}
                    </HStack>
                  </Flex>
                </Box>
              )
            })}
          </VStack>
        )}
      </Box>

      {/* Detail drawer */}
      <Drawer.Root open={!!selected && !approveOpen} onOpenChange={(e) => !e.open && setSelected(null)}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title color="white">Detalhes da Solicitação</Drawer.Title>
            <Drawer.CloseTrigger />
          </Drawer.Header>
          <Drawer.Body>
            {selected && (
              <VStack gap="4" align="stretch">
                <DetailField label="Nome" value={selected.name} />
                <DetailField label="Telefone" value={selected.phone} />
                {selected.instagram && <DetailField label="Instagram" value={selected.instagram} />}
                <DetailField label="Cidade" value={selected.city} />
                {selected.poker_experience && <DetailField label="Experiência" value={selected.poker_experience} />}
                {selected.message && <DetailField label="Mensagem" value={selected.message} />}
                <Separator borderColor="rgba(139,47,201,0.15)" />
                <HStack gap="4">
                  <Box>
                    <Text fontSize="xs" color="gray.500">LGPD</Text>
                    <Text fontSize="sm" color={selected.consent_lgpd ? "green.400" : "red.400"}>
                      {selected.consent_lgpd ? "Consentido" : "Não consentido"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Uso de Imagem</Text>
                    <Text fontSize="sm" color={selected.consent_image ? "green.400" : "red.400"}>
                      {selected.consent_image ? "Consentido" : "Não consentido"}
                    </Text>
                  </Box>
                </HStack>
                {selected.status === "pending" && (
                  <HStack gap="2" mt="2">
                    <Button
                      flex="1" colorPalette="green" variant="solid"
                      onClick={() => openApprove(selected)}
                    >
                      <Icon as={LuCheck} mr="2" /> Aprovar e Criar Usuário
                    </Button>
                    <Button
                      colorPalette="red" variant="outline"
                      onClick={() => { updateStatus(selected.id, "rejected"); setSelected(null) }}
                    >
                      <Icon as={LuX} mr="2" /> Recusar
                    </Button>
                  </HStack>
                )}
              </VStack>
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>

      {/* Approve & create user drawer */}
      <Drawer.Root open={approveOpen} onOpenChange={(e) => !e.open && setApproveOpen(false)}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title color="white">Aprovar e Criar Usuário</Drawer.Title>
            <Drawer.CloseTrigger />
          </Drawer.Header>
          <Drawer.Body>
            <VStack gap="4" align="stretch">
              <Text color="gray.400" fontSize="sm">
                Crie uma conta para {selected?.name}. A senha temporária será exibida para você
                compartilhar manualmente (o envio automático por e-mail será habilitado em breve).
              </Text>

              <Field label="E-mail do novo membro" required>
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
                    value={newUser.tempPassword}
                    bg="rgba(139,47,201,0.1)"
                    borderColor="rgba(139,47,201,0.3)"
                    color="white"
                  />
                  <Button
                    size="md" px="3"
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
                <Box
                  p="4" rounded="lg"
                  bg="rgba(245,158,11,0.1)"
                  borderWidth="1px"
                  borderColor="rgba(245,158,11,0.3)"
                >
                  <Text fontSize="xs" color="gold.400" fontWeight="semibold" mb="1">
                    Senha temporária gerada:
                  </Text>
                  <Text fontSize="md" color="white" fontFamily="mono" fontWeight="bold">
                    {generatedPassword}
                  </Text>
                  <Text fontSize="xs" color="gray.400" mt="2">
                    Copie esta senha e compartilhe com o novo membro. Ele será obrigado a trocá-la
                    no primeiro acesso.
                  </Text>
                </Box>
              )}

              <Button
                w="full"
                loading={creating}
                fontWeight="bold"
                css={{
                  background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
                  border: "1px solid rgba(245,158,11,0.3)",
                  color: "white",
                  "&:hover:not(:disabled)": {
                    background: "linear-gradient(135deg, #9D44F0, #7B1FA2)",
                  },
                }}
                onClick={createUser}
                disabled={!generatedPassword || !newUser.email}
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

function StatBox({ label, value, color, icon }: {
  label: string; value: number; color: string; icon: React.ElementType
}) {
  return (
    <Box
      p="4" rounded="xl"
      bg="rgba(26,0,48,0.8)"
      borderWidth="1px"
      borderColor="rgba(139,47,201,0.2)"
      position="relative"
      overflow="hidden"
      css={{ "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: color } }}
    >
      <Flex justify="space-between" align="center">
        <Box>
          <Text fontSize="2xl" fontWeight="black" color="white">{value}</Text>
          <Text fontSize="xs" color="gray.400">{label}</Text>
        </Box>
        <Icon as={icon} fontSize="xl" color={color} opacity="0.7" />
      </Flex>
    </Box>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text fontSize="xs" color="gray.500" mb="1">{label}</Text>
      <Text fontSize="sm" color="white">{value}</Text>
    </Box>
  )
}
