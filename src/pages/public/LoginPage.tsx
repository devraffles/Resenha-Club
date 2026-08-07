import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box, VStack, HStack, Text, Heading, Input, Button, Flex,
  Image as ChakraImage, Icon, Separator,
} from "@chakra-ui/react"
import { Field } from "@/components/ui/field"
import { PasswordInput } from "@/components/ui/password-input"
import { useAuth } from "@/lib/auth"
import { LuSparkles, LuTrophy, LuBrainCircuit, LuShield, LuArrowLeft } from "react-icons/lu"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState("")
  const { signIn, requestPasswordReset } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        navigate("/app")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setResetError("")
    setResetLoading(true)
    try {
      const { error } = await requestPasswordReset(resetEmail)
      if (error) {
        setResetError(error.message)
      } else {
        setResetSent(true)
      }
    } finally {
      setResetLoading(false)
    }
  }

  const features = [
    { icon: LuBrainCircuit, text: "Treinamento GTO Avançado" },
    { icon: LuTrophy, text: "Ranking de Campeões" },
    { icon: LuSparkles, text: "Comunidade Exclusiva" },
    { icon: LuShield, text: "Apenas por Convite" },
  ]

  if (showReset) {
    return (
      <Box minH="100vh" bg="#0D0118" position="relative" overflow="hidden">
        <Box
          position="absolute" top="-20%" left="-10%"
          w="600px" h="600px" rounded="full"
          bg="radial-gradient(circle, rgba(139,47,201,0.15) 0%, transparent 70%)"
          pointerEvents="none"
        />
        <Flex minH="100vh" align="center" justify="center" px="4" py="8">
          <Box
            w="full" maxW="420px"
            p={{ base: "8", lg: "10" }}
            rounded="2xl"
            bg="rgba(13,1,24,0.95)"
            borderWidth="1px"
            borderColor="rgba(139,47,201,0.2)"
            shadow="0 25px 60px rgba(0,0,0,0.5)"
          >
            <VStack gap="6" align="stretch">
              <Box>
                <HStack gap="2" mb="4">
                  <Box
                    as="button"
                    p="1.5" rounded="lg"
                    cursor="pointer"
                    bg="rgba(139,47,201,0.1)"
                    _hover={{ bg: "rgba(139,47,201,0.2)" }}
                    onClick={() => { setShowReset(false); setResetSent(false) }}
                  >
                    <Icon as={LuArrowLeft} color="gray.400" fontSize="md" />
                  </Box>
                  <Heading size="lg" color="white" fontWeight="bold">Recuperar Senha</Heading>
                </HStack>
                <Text color="gray.400" fontSize="sm">
                  Digite seu e-mail para receber as instruções de redefinição de senha.
                </Text>
              </Box>

              {resetSent ? (
                <Box
                  p="4" rounded="lg"
                  bg="rgba(34,197,94,0.1)"
                  borderWidth="1px" borderColor="rgba(34,197,94,0.3)"
                >
                  <Text color="green.400" fontSize="sm">
                    Se o e-mail existir em nosso sistema, você receberá as instruções para
                    redefinir sua senha. (O envio de e-mails será habilitado em breve.)
                  </Text>
                </Box>
              ) : (
                <form onSubmit={handleReset}>
                  <VStack gap="4" align="stretch">
                    {resetError && (
                      <Box
                        p="3" rounded="lg"
                        bg="rgba(239,68,68,0.1)"
                        borderWidth="1px" borderColor="rgba(239,68,68,0.3)"
                      >
                        <Text color="red.400" fontSize="sm">{resetError}</Text>
                      </Box>
                    )}
                    <Field label="E-mail">
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        bg="rgba(139,47,201,0.1)"
                        borderColor="rgba(139,47,201,0.3)"
                        color="white"
                        _placeholder={{ color: "gray.500" }}
                        _hover={{ borderColor: "rgba(139,47,201,0.5)" }}
                        _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px rgba(139,47,201,0.5)" }}
                      />
                    </Field>
                    <Button
                      type="submit"
                      loading={resetLoading}
                      w="full" size="lg"
                      fontWeight="bold"
                      css={{
                        background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
                        border: "1px solid rgba(245,158,11,0.3)",
                        color: "white",
                        "&:hover:not(:disabled)": {
                          background: "linear-gradient(135deg, #9D44F0, #7B1FA2)",
                          boxShadow: "0 0 20px rgba(139,47,201,0.4)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      Enviar Link de Recuperação
                    </Button>
                  </VStack>
                </form>
              )}

              <Separator borderColor="rgba(139,47,201,0.15)" />
              <Text textAlign="center" fontSize="sm" color="gray.400">
                Lembrou a senha?{" "}
                <Text
                  as="span" color="gold.400" cursor="pointer" fontWeight="semibold"
                  onClick={() => { setShowReset(false); setResetSent(false) }}
                  _hover={{ color: "gold.300" }}
                >
                  Voltar ao login
                </Text>
              </Text>
            </VStack>
          </Box>
        </Flex>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="#0D0118" position="relative" overflow="hidden">
      {/* Background effects */}
      <Box
        position="absolute" top="-20%" left="-10%"
        w="600px" h="600px" rounded="full"
        bg="radial-gradient(circle, rgba(139,47,201,0.15) 0%, transparent 70%)"
        pointerEvents="none"
      />
      <Box
        position="absolute" bottom="-20%" right="-10%"
        w="500px" h="500px" rounded="full"
        bg="radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)"
        pointerEvents="none"
      />

      <Flex minH="100vh" align="center" justify="center" px="4" py="8">
        <Flex
          w="full" maxW="5xl"
          rounded="2xl" overflow="hidden"
          shadow="0 25px 60px rgba(0,0,0,0.5)"
          borderWidth="1px"
          borderColor="rgba(139,47,201,0.2)"
          direction={{ base: "column", lg: "row" }}
        >
          {/* Left panel */}
          <Box
            flex="1"
            p={{ base: "8", lg: "12" }}
            bg="linear-gradient(135deg, #2D0050 0%, #1A0030 100%)"
            display={{ base: "none", lg: "flex" }}
            flexDir="column"
            justify="space-between"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute" top="0" left="0" right="0" bottom="0"
              bg="radial-gradient(ellipse at 30% 50%, rgba(139,47,201,0.2) 0%, transparent 60%)"
              pointerEvents="none"
            />
            <VStack align="start" gap="6" position="relative">
              <Flex align="center" gap="3">
                <Box
                  w="56px" h="56px" rounded="xl" overflow="hidden"
                  shadow="0 0 30px rgba(139,47,201,0.6)"
                  border="2px solid rgba(245,158,11,0.5)"
                >
                  <ChakraImage src="/image.png" alt="Resenha Club" w="full" h="full" objectFit="cover" />
                </Box>
                <Box>
                  <Text
                    fontWeight="black" fontSize="xl" lineHeight="tight"
                    css={{
                      background: "linear-gradient(135deg, #FFD700, #F59E0B)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    RESENHA CLUB
                  </Text>
                  <Text fontSize="xs" color="purple.300" letterSpacing="widest">GTO POKER TRAINER</Text>
                </Box>
              </Flex>

              <Box>
                <Heading size="2xl" fontWeight="black" color="white" lineHeight="shorter" mb="4">
                  Bem-vindo de
                  <Text
                    as="span" display="block"
                    css={{
                      background: "linear-gradient(135deg, #FFD700, #F59E0B)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    volta à Resenha
                  </Text>
                </Heading>
                <Text color="gray.400" fontSize="md" lineHeight="tall">
                  Acesse a área exclusiva do clube e continue sua jornada GTO.
                </Text>
              </Box>

              <VStack align="start" gap="4" w="full">
                {features.map((f, i) => (
                  <HStack key={i} gap="3">
                    <Box
                      p="2" rounded="lg"
                      bg="rgba(139,47,201,0.2)"
                      border="1px solid rgba(139,47,201,0.3)"
                    >
                      <Icon as={f.icon} color="gold.400" fontSize="md" />
                    </Box>
                    <Text color="gray.300" fontSize="sm">{f.text}</Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>

            <Text color="purple.400" fontSize="xs" mt="8">
              © 2025 The Resenha Club. Todos os direitos reservados.
            </Text>
          </Box>

          {/* Right panel - login form */}
          <Box
            w={{ base: "full", lg: "420px" }}
            p={{ base: "8", lg: "12" }}
            bg="rgba(13,1,24,0.95)"
            display="flex"
            flexDir="column"
            justify="center"
          >
            {/* Mobile logo */}
            <Flex align="center" gap="3" mb="8" display={{ base: "flex", lg: "none" }}>
              <Box w="40px" h="40px" rounded="lg" overflow="hidden">
                <ChakraImage src="/image.png" alt="Resenha Club" w="full" h="full" objectFit="cover" />
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

            <VStack gap="6" align="stretch">
              <Box>
                <Heading size="xl" color="white" fontWeight="bold" mb="1">
                  Entrar
                </Heading>
                <Text color="gray.400" fontSize="sm">
                  Acesso exclusivo para membros do clube
                </Text>
              </Box>

              {error && (
                <Box
                  p="3" rounded="lg"
                  bg="rgba(239,68,68,0.1)"
                  borderWidth="1px" borderColor="rgba(239,68,68,0.3)"
                >
                  <Text color="red.400" fontSize="sm">{error}</Text>
                </Box>
              )}

              <form onSubmit={handleSubmit}>
                <VStack gap="4" align="stretch">
                  <Field label="E-mail">
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      bg="rgba(139,47,201,0.1)"
                      borderColor="rgba(139,47,201,0.3)"
                      color="white"
                      _placeholder={{ color: "gray.500" }}
                      _hover={{ borderColor: "rgba(139,47,201,0.5)" }}
                      _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px rgba(139,47,201,0.5)" }}
                    />
                  </Field>

                  <Field label="Senha">
                    <PasswordInput
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      bg="rgba(139,47,201,0.1)"
                      borderColor="rgba(139,47,201,0.3)"
                      color="white"
                      _placeholder={{ color: "gray.500" }}
                      _hover={{ borderColor: "rgba(139,47,201,0.5)" }}
                      _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px rgba(139,47,201,0.5)" }}
                    />
                  </Field>

                  <Box textAlign="right">
                    <Text
                      as="button" type="button"
                      fontSize="xs" color="gold.400" cursor="pointer"
                      onClick={() => setShowReset(true)}
                      _hover={{ color: "gold.300" }}
                    >
                      Esqueci minha senha
                    </Text>
                  </Box>

                  <Button
                    type="submit"
                    loading={loading}
                    w="full" size="lg"
                    fontWeight="bold"
                    css={{
                      background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
                      border: "1px solid rgba(245,158,11,0.3)",
                      color: "white",
                      "&:hover:not(:disabled)": {
                        background: "linear-gradient(135deg, #9D44F0, #7B1FA2)",
                        boxShadow: "0 0 20px rgba(139,47,201,0.4)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    Entrar
                  </Button>
                </VStack>
              </form>

              <Separator borderColor="rgba(139,47,201,0.15)" />

              <Text textAlign="center" fontSize="sm" color="gray.400">
                Não é membro ainda?{" "}
                <Text
                  as="a" href="/"
                  color="gold.400" cursor="pointer" fontWeight="semibold"
                  _hover={{ color: "gold.300" }}
                >
                  Solicite seu ingresso
                </Text>
              </Text>
            </VStack>
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}
