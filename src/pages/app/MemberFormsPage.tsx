import { useState, useEffect } from "react"
import {
  Box, VStack, HStack, Text, Heading, Flex, Icon, Button,
  Input, Grid, Separator,
} from "@chakra-ui/react"
import { Field } from "@/components/ui/field"
import {
  LuFileText, LuLink, LuCopy, LuCheck, LuClock, LuUsers, LuSend,
} from "react-icons/lu"
import { supabase } from "@/lib/supabase"
import { toaster } from "@/components/ui/toaster"

interface SubmissionSummary {
  status: string
  count: number
}

export function MemberFormsPage() {
  const [inviteName, setInviteName] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [summaries, setSummaries] = useState<SubmissionSummary[]>([])

  useEffect(() => {
    // Load submission count by status (only for the member's own invites - simplified to overall stats)
    // Since members can't read submissions directly (admin-only), we show public landing page stats
    // For now, show a simple summary with zero counts (data comes from admin)
    setSummaries([
      { status: "pending", count: 0 },
      { status: "approved", count: 0 },
    ])
  }, [])

  function generateLink() {
    const baseUrl = window.location.origin
    const ref = inviteName.trim().toLowerCase().replace(/\s+/g, "-")
    const link = ref ? `${baseUrl}/?ref=${ref}` : `${baseUrl}/`
    setGeneratedLink(link)
    setCopied(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    toaster.create({ title: "Link copiado!", type: "success" })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Box>
      <VStack gap="2" mb="8" align="start">
        <HStack gap="2">
          <Box
            p="2" rounded="lg"
            bg="rgba(139,47,201,0.1)"
            borderWidth="1px"
            borderColor="rgba(139,47,201,0.3)"
          >
            <Icon as={LuFileText} color="purple.300" fontSize="lg" />
          </Box>
          <Heading size="xl" fontWeight="black" color="white">Formulários</Heading>
        </HStack>
        <Text color="gray.400" fontSize="sm">
          Convide novos membros para o clube e acompanhe as indicações
        </Text>
      </VStack>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="6">
        {/* Generate invite link */}
        <Box
          p="6" rounded="2xl"
          bg="rgba(26,0,48,0.8)"
          borderWidth="1px"
          borderColor="rgba(139,47,201,0.2)"
        >
          <HStack gap="2" mb="4">
            <Icon as={LuLink} color="gold.400" />
            <Text fontWeight="bold" color="white" fontSize="md">Gerar Link de Convite</Text>
          </HStack>
          <Text color="gray.400" fontSize="sm" mb="4">
            Gere um link personalizado para convidar um amigo ao clube. Compartilhe o link e ele
            poderá preencher o formulário de interesse.
          </Text>

          <VStack gap="4" align="stretch">
            <Field label="Nome do convidado (opcional)">
              <Input
                placeholder="Ex: João Silva"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                bg="rgba(139,47,201,0.1)"
                borderColor="rgba(139,47,201,0.3)"
                color="white"
                _placeholder={{ color: "gray.500" }}
                _hover={{ borderColor: "rgba(139,47,201,0.5)" }}
                _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px rgba(139,47,201,0.5)" }}
              />
            </Field>

            <Button
              onClick={generateLink}
              w="full"
              size="md"
              fontWeight="semibold"
              variant="outline"
              borderColor="rgba(139,47,201,0.4)"
              color="purple.300"
              _hover={{ bg: "rgba(139,47,201,0.1)", borderColor: "rgba(139,47,201,0.6)" }}
            >
              <Icon as={LuSend} mr="2" />
              Gerar Link
            </Button>

            {generatedLink && (
              <Box>
                <Separator borderColor="rgba(139,47,201,0.15)" mb="4" />
                <Field label="Link de convite">
                  <HStack gap="2">
                    <Input
                      readOnly
                      value={generatedLink}
                      bg="rgba(139,47,201,0.1)"
                      borderColor="rgba(139,47,201,0.3)"
                      color="white"
                      fontSize="sm"
                    />
                    <Button
                      size="md"
                      px="3"
                      onClick={copyLink}
                      css={{
                        background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
                        color: "white",
                        "&:hover": { background: "linear-gradient(135deg, #9D44F0, #7B1FA2)" },
                      }}
                    >
                      <Icon as={copied ? LuCheck : LuCopy} />
                    </Button>
                  </HStack>
                </Field>
                <Text fontSize="xs" color="gray.500" mt="2">
                  Compartilhe este link com seu convidado. O administrador avaliará a solicitação.
                </Text>
              </Box>
            )}
          </VStack>
        </Box>

        {/* How it works */}
        <Box
          p="6" rounded="2xl"
          bg="rgba(26,0,48,0.8)"
          borderWidth="1px"
          borderColor="rgba(139,47,201,0.2)"
        >
          <HStack gap="2" mb="4">
            <Icon as={LuUsers} color="gold.400" />
            <Text fontWeight="bold" color="white" fontSize="md">Como Funciona o Convite</Text>
          </HStack>
          <VStack gap="4" align="stretch">
            {[
              { step: "1", title: "Gere o link", desc: "Crie um link de convite personalizado." },
              { step: "2", title: "Compartilhe", desc: "Envie o link para seu amigo interessado." },
              { step: "3", title: "Aguarda aprovação", desc: "O administrador avalia a solicitação." },
              { step: "4", title: "Novo membro", desc: "Se aprovado, o admin cria a conta e envia as credenciais." },
            ].map((item) => (
              <HStack key={item.step} gap="3" align="start">
                <Box
                  w="8" h="8" rounded="full"
                  flexShrink="0"
                  display="flex" alignItems="center" justifyContent="center"
                  bg="rgba(139,47,201,0.2)"
                  borderWidth="1px"
                  borderColor="rgba(139,47,201,0.4)"
                >
                  <Text fontSize="xs" fontWeight="bold" color="gold.400">{item.step}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="white">{item.title}</Text>
                  <Text fontSize="xs" color="gray.400" mt="1">{item.desc}</Text>
                </Box>
              </HStack>
            ))}
          </VStack>

          <Separator borderColor="rgba(139,47,201,0.15)" my="4" />

          <Box>
            <HStack gap="2" mb="3">
              <Icon as={LuClock} color="purple.300" fontSize="sm" />
              <Text fontSize="sm" color="gray.400">Status das Solicitações</Text>
            </HStack>
            <HStack gap="4">
              {summaries.map((s) => (
                <Box key={s.status} flex="1" textAlign="center" p="3" rounded="lg" bg="rgba(139,47,201,0.05)">
                  <Text fontSize="2xl" fontWeight="black" color="white">{s.count}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {s.status === "pending" ? "Pendentes" : "Aprovadas"}
                  </Text>
                </Box>
              ))}
            </HStack>
            <Text fontSize="xs" color="gray.500" mt="3">
              A gestão detalhada das solicitações é feita pelo administrador.
            </Text>
          </Box>
        </Box>
      </Grid>
    </Box>
  )
}
