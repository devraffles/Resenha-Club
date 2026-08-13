import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  Box, VStack, HStack, Text, Heading, Button, Flex, Input,
  Icon, Separator,
} from "@chakra-ui/react"
import { Field } from "@/components/ui/field"
import { PasswordInput } from "@/components/ui/password-input"
import { useAuth } from "@/lib/auth"
import { LuLock, LuArrowLeft, LuCheck } from "react-icons/lu"

export function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const hasToken = searchParams.get("token") || searchParams.get("type") === "recovery"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    setLoading(true)
    try {
      const { error } = await updatePassword(password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => navigate("/app"), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

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
                  onClick={() => navigate("/login")}
                >
                  <Icon as={LuArrowLeft} color="gray.400" fontSize="md" />
                </Box>
                <Heading size="lg" color="white" fontWeight="bold">Definir Nova Senha</Heading>
              </HStack>
              <Text color="gray.400" fontSize="sm">
                {hasToken
                  ? "Defina sua nova senha de acesso."
                  : "Você foi redirecionado para definir uma nova senha. Crie uma senha segura para sua conta."}
              </Text>
            </Box>

            {success ? (
              <Box
                p="6" rounded="lg"
                bg="rgba(34,197,94,0.1)"
                borderWidth="1px" borderColor="rgba(34,197,94,0.3)"
                textAlign="center"
              >
                <Box
                  w="48px" h="48px" rounded="full"
                  mx="auto" mb="3"
                  display="flex" alignItems="center" justifyContent="center"
                  bg="rgba(34,197,94,0.2)"
                >
                  <Icon as={LuCheck} fontSize="xl" color="green.400" />
                </Box>
                <Text color="green.400" fontSize="sm" fontWeight="semibold" mb="1">
                  Senha atualizada!
                </Text>
                <Text color="gray.400" fontSize="xs">
                  Redirecionando para a área do membro...
                </Text>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <VStack gap="4" align="stretch">
                  {error && (
                    <Box
                      p="3" rounded="lg"
                      bg="rgba(239,68,68,0.1)"
                      borderWidth="1px" borderColor="rgba(239,68,68,0.3)"
                    >
                      <Text color="red.400" fontSize="sm">{error}</Text>
                    </Box>
                  )}

                  <Field label="Nova senha" required>
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

                  <Field label="Confirmar senha" required>
                    <PasswordInput
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <Icon as={LuLock} mr="2" />
                    Definir Nova Senha
                  </Button>
                </VStack>
              </form>
            )}

            <Separator borderColor="rgba(139,47,201,0.15)" />
            <Text textAlign="center" fontSize="sm" color="gray.400">
              <Text
                as="a" href="/login"
                color="gold.400" cursor="pointer" fontWeight="semibold"
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
