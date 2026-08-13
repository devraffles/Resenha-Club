import { Box, VStack, HStack, Text, Heading, Flex, Icon, Separator } from "@chakra-ui/react"
import { LuShield, LuLock, LuFileText, LuTrash2, LuClock, LuMail } from "react-icons/lu"

export function PrivacyPolicyPage() {
  return (
    <Box minH="100vh" bg="#0D0118">
      {/* Navbar */}
      <Box
        as="header"
        position="fixed" top="0" left="0" right="0"
        zIndex="sticky"
        bg="rgba(13,1,24,0.9)"
        backdropFilter="blur(20px)"
        borderBottomWidth="1px"
        borderBottomColor="rgba(139,47,201,0.2)"
      >
        <Flex maxW="7xl" mx="auto" px={{ base: "4", md: "8" }} py="4" align="center">
          <Flex align="center" gap="3" cursor="pointer" onClick={() => (window.location.href = "/")}>
            <Box w="40px" h="40px" rounded="lg" overflow="hidden" border="2px solid" borderColor="rgba(245,158,11,0.5)">
              <Icon as={LuShield} color="gold.400" fontSize="2xl" w="full" h="full" display="flex" alignItems="center" justifyContent="center" />
            </Box>
            <Text
              fontWeight="black" fontSize="lg"
              css={{
                background: "linear-gradient(135deg, #FFD700, #F59E0B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              RESENHA CLUB
            </Text>
          </Flex>
        </Flex>
      </Box>

      <Box maxW="3xl" mx="auto" px={{ base: "4", md: "8" }} py={{ base: "24", md: "32" }}>
        <VStack gap="6" align="start">
          <HStack gap="3">
            <Box
              p="3" rounded="xl"
              bg="rgba(139,47,201,0.15)"
              borderWidth="1px"
              borderColor="rgba(139,47,201,0.3)"
            >
              <Icon as={LuShield} color="purple.300" fontSize="2xl" />
            </Box>
            <Heading size="xl" fontWeight="black" color="white">Política de Privacidade</Heading>
          </HStack>

          <Text color="gray.500" fontSize="sm">Última atualização: Janeiro de 2025</Text>

          <Separator borderColor="rgba(139,47,201,0.15)" />

          <Section icon={LuFileText} title="1. Dados Coletados">
            <Text color="gray.400" fontSize="sm" lineHeight="tall">
              Coletamos os seguintes dados quando você preenche o formulário de interesse: nome,
              telefone, Instagram, cidade, experiência com poker e mensagem. Quando você se torna
              membro, coletamos additionally e-mail e senha (criptografada) para acesso à plataforma.
            </Text>
          </Section>

          <Section icon={LuLock} title="2. Finalidade do Tratamento">
            <Text color="gray.400" fontSize="sm" lineHeight="tall">
              Seus dados são utilizados exclusivamente para: (a) avaliação de sua solicitação de
              ingresso no clube; (b) comunicação sobre o status da sua solicitação; (c) criação e
              manutenção da sua conta de membro; (d) organização de eventos e torneios internos.
              Seus dados não são compartilhados com terceiros nem utilizados para marketing.
            </Text>
          </Section>

          <Section icon={LuClock} title="3. Prazo de Retenção">
            <Text color="gray.400" fontSize="sm" lineHeight="tall">
              Submissões recusadas ou não aprovadas são mantidas por até 6 meses para fins de
              registro, sendo excluídas automaticamente após esse período. Dados de membros ativos
              são mantidos enquanto a conta estiver ativa. Contas desativadas têm seus dados
              excluídos em até 30 dias.
            </Text>
          </Section>

          <Section icon={LuFileText} title="4. Consentimento de Imagem">
            <Text color="gray.400" fontSize="sm" lineHeight="tall">
              Ao consentir com o uso de imagem, você autoriza o clube a utilizar fotos e vídeos em
              que você apareça em materiais internos e na plataforma. Este consentimento pode ser
              revogado a qualquer momento, solicitando a remoção das imagens ao administrador.
            </Text>
          </Section>

          <Section icon={LuShield} title="5. Base Legal (LGPD)">
            <Text color="gray.400" fontSize="sm" lineHeight="tall">
              O tratamento dos seus dados pessoais é fundamentado no consentimento (Art. 7º, inciso I
              da Lei nº 13.709/2018 - LGPD) e na execução de contrato (Art. 7º, inciso V) quando você
              se torna membro. Você pode retirar seu consentimento a qualquer momento.
            </Text>
          </Section>

          <Section icon={LuTrash2} title="6. Seus Direitos">
            <Text color="gray.400" fontSize="sm" lineHeight="tall">
              Como titular dos dados, você tem direito a: (a) confirmar a existência de tratamento;
              (b) acessar seus dados; (c) corrigir dados incompletos ou inexatos; (d) anonimizar,
              bloquear ou eliminar dados desnecessários; (e) portabilidade dos dados; (f) revogar
              consentimento. Para exercer qualquer direito, entre em contato com o administrador.
            </Text>
          </Section>

          <Section icon={LuMail} title="7. Contato">
            <Text color="gray.400" fontSize="sm" lineHeight="tall">
              Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato com
              o administrador do clube através da plataforma ou pelos canais disponibilizados na área
              do membro.
            </Text>
          </Section>

          <Separator borderColor="rgba(139,47,201,0.15)" />

          <Text color="gray.500" fontSize="xs">
            Esta política pode ser atualizada periodicamente. Recomendamos que você revise esta
            página regularmente para se manter informado sobre quaisquer mudanças.
          </Text>
        </VStack>
      </Box>
    </Box>
  )
}

function Section({ icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <Box w="full">
      <HStack gap="3" mb="3">
        <Icon as={icon} color="gold.400" fontSize="lg" />
        <Heading size="md" color="white" fontWeight="bold">{title}</Heading>
      </HStack>
      <Box pl="8">{children}</Box>
    </Box>
  )
}
