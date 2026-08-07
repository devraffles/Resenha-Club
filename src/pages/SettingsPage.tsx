import { useState } from "react"
import {
  Box, VStack, HStack, Text, Heading, Grid, Input, Textarea, Button, Icon, Flex, Separator
} from "@chakra-ui/react"
import { LuUser, LuBell, LuShield, LuSave, LuCamera } from "react-icons/lu"
import { useAuth } from "../lib/auth"
import { Field } from "../components/ui/field"
import { Switch } from "../components/ui/switch"
import { Avatar } from "../components/ui/avatar"

export function SettingsPage() {
  const { profile, updateProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    display_name: profile?.display_name ?? "",
    username: profile?.username ?? "",
    bio: profile?.bio ?? "",
  })
  const [settings, setSettings] = useState({
    sound: profile?.settings?.sound ?? true,
    notifications: profile?.settings?.notifications ?? true,
    language: profile?.settings?.language ?? "pt-BR",
  })

  async function handleSave() {
    setSaving(true)
    await updateProfile({
      display_name: form.display_name,
      username: form.username,
      bio: form.bio,
      settings: { ...profile?.settings, ...settings },
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sections = [
    { icon: LuUser, label: "Perfil" },
    { icon: LuBell, label: "Notificações" },
    { icon: LuShield, label: "Segurança" },
  ]

  const [activeSection, setActiveSection] = useState("Perfil")

  return (
    <Box>
      <Heading size="xl" fontWeight="black" color="white" mb="2">Configurações</Heading>
      <Text color="gray.400" mb="6" fontSize="sm">Gerencie seu perfil e preferências</Text>

      <Grid templateColumns={{ base: "1fr", md: "200px 1fr" }} gap="6">
        {/* Sidebar nav */}
        <VStack gap="1" align="stretch">
          {sections.map(s => (
            <Box
              key={s.label}
              as="button"
              px="4" py="3" rounded="xl" cursor="pointer" textAlign="left"
              borderWidth="1px"
              transition="all 0.15s"
              borderColor={activeSection === s.label ? "rgba(139,47,201,0.4)" : "transparent"}
              bg={activeSection === s.label ? "rgba(139,47,201,0.15)" : "transparent"}
              onClick={() => setActiveSection(s.label)}
            >
              <HStack gap="3">
                <Icon as={s.icon} color={activeSection === s.label ? "gold.400" : "gray.400"} />
                <Text fontSize="sm" fontWeight={activeSection === s.label ? "semibold" : "medium"}
                  color={activeSection === s.label ? "white" : "gray.400"}>
                  {s.label}
                </Text>
              </HStack>
            </Box>
          ))}
        </VStack>

        {/* Content */}
        <Box p="6" rounded="2xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
          {activeSection === "Perfil" && (
            <VStack gap="6" align="stretch">
              {/* Avatar section */}
              <Box>
                <Text fontWeight="bold" color="white" mb="4">Foto de Perfil</Text>
                <Flex align="center" gap="4">
                  <Box position="relative">
                    <Avatar
                      size="2xl"
                      name={profile?.display_name ?? profile?.username ?? "Player"}
                      src={profile?.avatar_url ?? undefined}
                    />
                    <Box
                      position="absolute" bottom="0" right="0"
                      p="1.5" rounded="full"
                      bg="rgba(139,47,201,0.9)"
                      border="2px solid #1A0030"
                      cursor="pointer"
                    >
                      <Icon as={LuCamera} color="white" fontSize="xs" />
                    </Box>
                  </Box>
                  <VStack align="start" gap="1">
                    <Text fontSize="sm" color="white" fontWeight="semibold">
                      {profile?.display_name ?? profile?.username ?? "Player"}
                    </Text>
                    <Text fontSize="xs" color="gray.400">{profile?.rank_points ?? 0} pontos de ranking</Text>
                  </VStack>
                </Flex>
              </Box>

              <Separator borderColor="rgba(139,47,201,0.2)" />

              {/* Profile fields */}
              <Box>
                <Text fontWeight="bold" color="white" mb="4">Informações Pessoais</Text>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
                  <Field label="Nome de Exibição">
                    <Input
                      value={form.display_name}
                      onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                      bg="rgba(139,47,201,0.1)" borderColor="rgba(139,47,201,0.3)"
                      color="white" _placeholder={{ color: "gray.500" }}
                      _focus={{ borderColor: "brand.400" }}
                    />
                  </Field>
                  <Field label="Username">
                    <Input
                      value={form.username}
                      onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                      bg="rgba(139,47,201,0.1)" borderColor="rgba(139,47,201,0.3)"
                      color="white" _placeholder={{ color: "gray.500" }}
                      _focus={{ borderColor: "brand.400" }}
                    />
                  </Field>
                  <Field label="Bio" gridColumn={{ md: "1 / -1" }}>
                    <Textarea
                      value={form.bio}
                      onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                      placeholder="Conte um pouco sobre você..."
                      rows={3}
                      bg="rgba(139,47,201,0.1)" borderColor="rgba(139,47,201,0.3)"
                      color="white" _placeholder={{ color: "gray.500" }}
                      _focus={{ borderColor: "brand.400" }}
                      resize="none"
                    />
                  </Field>
                </Grid>
              </Box>

              {/* Stats */}
              <Box>
                <Text fontWeight="bold" color="white" mb="4">Estatísticas da Conta</Text>
                <Grid templateColumns="repeat(2, 1fr)" gap="3">
                  {[
                    { label: "Mãos Jogadas", value: profile?.total_hands ?? 0 },
                    { label: "Sessões", value: profile?.total_sessions ?? 0 },
                    { label: "Quizzes", value: profile?.total_quizzes ?? 0 },
                    { label: "Melhor Streak", value: `${profile?.best_streak ?? 0} dias` },
                  ].map(stat => (
                    <Box key={stat.label} p="3" rounded="lg" bg="rgba(139,47,201,0.08)" borderWidth="1px" borderColor="rgba(139,47,201,0.15)">
                      <Text fontSize="sm" fontWeight="bold" color="white">{stat.value}</Text>
                      <Text fontSize="xs" color="gray.400">{stat.label}</Text>
                    </Box>
                  ))}
                </Grid>
              </Box>
            </VStack>
          )}

          {activeSection === "Notificações" && (
            <VStack gap="6" align="stretch">
              <Text fontWeight="bold" color="white" mb="2">Preferências de Notificação</Text>
              {[
                { key: "notifications", label: "Notificações Push", desc: "Receba alertas sobre eventos e torneios" },
                { key: "sound", label: "Sons", desc: "Ativar efeitos sonoros durante o treinamento" },
              ].map(item => (
                <Flex key={item.key} justify="space-between" align="center" p="4" rounded="xl"
                  bg="rgba(139,47,201,0.08)" borderWidth="1px" borderColor="rgba(139,47,201,0.15)">
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="white">{item.label}</Text>
                    <Text fontSize="xs" color="gray.400">{item.desc}</Text>
                  </Box>
                  <Switch
                    checked={settings[item.key as keyof typeof settings] as boolean}
                    onCheckedChange={({ checked }) => setSettings(s => ({ ...s, [item.key]: checked }))}
                    colorPalette="purple"
                  />
                </Flex>
              ))}
            </VStack>
          )}

          {activeSection === "Segurança" && (
            <VStack gap="4" align="stretch">
              <Text fontWeight="bold" color="white" mb="2">Segurança da Conta</Text>
              <Box p="4" rounded="xl" bg="rgba(139,47,201,0.08)" borderWidth="1px" borderColor="rgba(139,47,201,0.15)">
                <Text fontSize="sm" color="gray.300">
                  Para alterar sua senha, utilize a opção "Esqueceu a senha?" na tela de login.
                  Um e-mail de redefinição será enviado para seu endereço cadastrado.
                </Text>
              </Box>
            </VStack>
          )}

          {saved && (
            <Box mt="4" p="3" rounded="lg" bg="rgba(34,197,94,0.1)" borderWidth="1px" borderColor="rgba(34,197,94,0.3)">
              <Text color="green.400" fontSize="sm">✓ Configurações salvas com sucesso!</Text>
            </Box>
          )}

          <Button
            mt="6" loading={saving} onClick={handleSave}
            css={{
              background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "white",
              "&:hover": { background: "linear-gradient(135deg, #9D44F0, #7B1FA2)" },
            }}
          >
            <Icon as={LuSave} mr="2" />
            Salvar Alterações
          </Button>
        </Box>
      </Grid>
    </Box>
  )
}
