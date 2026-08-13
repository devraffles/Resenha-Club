import { useState } from "react"
import {
  Box, VStack, HStack, Text, Heading, Input, Button, Flex, Image,
  Separator, Icon
} from "@chakra-ui/react"
import { Field } from "../components/ui/field"
import { PasswordInput } from "../components/ui/password-input"
import { useAuth } from "../lib/auth"
import { LuSparkles, LuTrophy, LuBrainCircuit, LuShield } from "react-icons/lu"

type AuthMode = "login" | "register" | "forgot"

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { signIn, signUp } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password)
        if (error) setError(error.message)
      } else if (mode === "register") {
        if (!username.trim()) { setError("Username é obrigatório"); return }
        if (password.length < 6) { setError("Senha deve ter pelo menos 6 caracteres"); return }
        const { error } = await signUp(email, password, username)
        if (error) setError(error.message)
        else setSuccess("Conta criada! Verifique seu e-mail para confirmar.")
      }
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: LuBrainCircuit, text: "Treinamento GTO Avançado" },
    { icon: LuTrophy, text: "Torneios e Ranking" },
    { icon: LuSparkles, text: "Análise em Tempo Real" },
    { icon: LuShield, text: "Comunidade Exclusiva" },
  ]

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
          w="full"
          maxW="5xl"
          rounded="2xl"
          overflow="hidden"
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
                  <Image src="/image.png" alt="Resenha Club" w="full" h="full" objectFit="cover" />
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
                <Heading
                  size="2xl"
                  fontWeight="black"
                  color="white"
                  lineHeight="shorter"
                  mb="4"
                >
                  Domine o Poker
                  <Text
                    as="span"
                    display="block"
                    css={{
                      background: "linear-gradient(135deg, #FFD700, #F59E0B)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    com GTO
                  </Text>
                </Heading>
                <Text color="gray.400" fontSize="md" lineHeight="tall">
                  Treine com cenários reais, domine ranges GTO e compete com a melhor comunidade de poker do Brasil.
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

          {/* Right panel - auth form */}
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
                <Image src="/image.png" alt="Resenha Club" w="full" h="full" objectFit="cover" />
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
                  {mode === "login" ? "Bem-vindo de volta!" :
                   mode === "register" ? "Criar conta" : "Recuperar senha"}
                </Heading>
                <Text color="gray.400" fontSize="sm">
                  {mode === "login" ? "Faça login para continuar seu treinamento" :
                   mode === "register" ? "Junte-se à comunidade The Resenha Club" :
                   "Digite seu e-mail para redefinir a senha"}
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

              {success && (
                <Box
                  p="3" rounded="lg"
                  bg="rgba(34,197,94,0.1)"
                  borderWidth="1px" borderColor="rgba(34,197,94,0.3)"
                >
                  <Text color="green.400" fontSize="sm">{success}</Text>
                </Box>
              )}

              <form onSubmit={handleSubmit}>
                <VStack gap="4" align="stretch">
                  {mode === "register" && (
                    <Field label="Username">
                      <Input
                        placeholder="Seu username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        bg="rgba(139,47,201,0.1)"
                        borderColor="rgba(139,47,201,0.3)"
                        color="white"
                        _placeholder={{ color: "gray.500" }}
                        _hover={{ borderColor: "rgba(139,47,201,0.5)" }}
                        _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px rgba(139,47,201,0.5)" }}
                      />
                    </Field>
                  )}

                  <Field label="E-mail">
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      bg="rgba(139,47,201,0.1)"
                      borderColor="rgba(139,47,201,0.3)"
                      color="white"
                      _placeholder={{ color: "gray.500" }}
                      _hover={{ borderColor: "rgba(139,47,201,0.5)" }}
                      _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px rgba(139,47,201,0.5)" }}
                    />
                  </Field>

                  {mode !== "forgot" && (
                    <Field label="Senha">
                      <PasswordInput
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        bg="rgba(139,47,201,0.1)"
                        borderColor="rgba(139,47,201,0.3)"
                        color="white"
                        _placeholder={{ color: "gray.500" }}
                        _hover={{ borderColor: "rgba(139,47,201,0.5)" }}
                        _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px rgba(139,47,201,0.5)" }}
                      />
                    </Field>
                  )}

                  {mode === "login" && (
                    <Box textAlign="right">
                      <Text
                        as="button"
                        type="button"
                        fontSize="xs"
                        color="gold.400"
                        cursor="pointer"
                        onClick={() => setMode("forgot")}
                        _hover={{ color: "gold.300" }}
                      >
                        Esqueceu a senha?
                      </Text>
                    </Box>
                  )}

                  <Button
                    type="submit"
                    loading={loading}
                    w="full"
                    size="lg"
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
                    {mode === "login" ? "Entrar" :
                     mode === "register" ? "Criar Conta" : "Enviar Link"}
                  </Button>
                </VStack>
              </form>

              <Separator borderColor="rgba(139,47,201,0.2)" />

              <Text textAlign="center" fontSize="sm" color="gray.400">
                {mode === "login" ? (
                  <>Não tem conta?{" "}
                    <Text as="span" color="gold.400" cursor="pointer" fontWeight="semibold"
                      onClick={() => { setMode("register"); setError("") }}
                      _hover={{ color: "gold.300" }}>
                      Cadastre-se
                    </Text>
                  </>
                ) : (
                  <>Já tem conta?{" "}
                    <Text as="span" color="gold.400" cursor="pointer" fontWeight="semibold"
                      onClick={() => { setMode("login"); setError("") }}
                      _hover={{ color: "gold.300" }}>
                      Fazer login
                    </Text>
                  </>
                )}
              </Text>
            </VStack>
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}
