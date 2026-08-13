import { useState, useEffect } from "react"
import {
  Box, VStack, HStack, Text, Heading, Flex, Icon, Grid,
} from "@chakra-ui/react"
import {
  LuFileText, LuUsers, LuTrophy, LuImage, LuClock, LuCheck, LuX,
} from "react-icons/lu"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"

export function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    pendingSubmissions: 0,
    totalUsers: 0,
    totalChampions: 0,
    totalGallery: 0,
  })

  useEffect(() => {
    (async () => {
      const [{ data: subs }, { data: users }, { data: champs }, { data: gallery }] = await Promise.all([
        supabase.from("interest_submissions").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("champions").select("id", { count: "exact" }),
        supabase.from("gallery_photos").select("id", { count: "exact" }),
      ])
      setStats({
        pendingSubmissions: subs?.length ?? 0,
        totalUsers: users?.length ?? 0,
        totalChampions: champs?.length ?? 0,
        totalGallery: gallery?.length ?? 0,
      })
    })()
  }, [])

  const cards = [
    {
      label: "Formulários Pendentes",
      value: stats.pendingSubmissions,
      icon: LuFileText,
      color: "linear-gradient(135deg, #F59E0B, #D97706)",
      path: "/admin/formularios",
      desc: "Solicitações aguardando aprovação",
    },
    {
      label: "Usuários",
      value: stats.totalUsers,
      icon: LuUsers,
      color: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
      path: "/admin/usuarios",
      desc: "Membros cadastrados",
    },
    {
      label: "Campeões",
      value: stats.totalChampions,
      icon: LuTrophy,
      color: "linear-gradient(135deg, #FFD700, #F59E0B)",
      path: "/admin/ranking",
      desc: "Entradas no ranking",
    },
    {
      label: "Fotos da Galeria",
      value: stats.totalGallery,
      icon: LuImage,
      color: "linear-gradient(135deg, #06B6D4, #0891B2)",
      path: "/admin/landing",
      desc: "Fotos da landing page",
    },
  ]

  return (
    <Box>
      <VStack gap="2" mb="8" align="start">
        <Heading size="xl" fontWeight="black" color="white">Painel Administrativo</Heading>
        <Text color="gray.400" fontSize="sm">Visão geral do clube Resenha</Text>
      </VStack>

      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="6" mb="8">
        {cards.map((card) => (
          <Box
            key={card.label}
            as="button"
            p="6" rounded="2xl"
            bg="rgba(26,0,48,0.8)"
            borderWidth="1px"
            borderColor="rgba(139,47,201,0.2)"
            cursor="pointer"
            textAlign="left"
            w="full"
            onClick={() => navigate(card.path)}
            _hover={{
              borderColor: "rgba(245,158,11,0.4)",
              transform: "translateY(-2px)",
              shadow: "0 8px 24px rgba(139,47,201,0.2)",
            }}
            transition="all 0.2s"
            position="relative"
            overflow="hidden"
            css={{ "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: card.color } }}
          >
            <Flex justify="space-between" align="start">
              <VStack align="start" gap="1">
                <Text fontSize="xs" color="gray.400" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">
                  {card.label}
                </Text>
                <Text fontSize="4xl" fontWeight="black" color="white" lineHeight="1">{card.value}</Text>
                <Text fontSize="xs" color="gray.500">{card.desc}</Text>
              </VStack>
              <Box p="3" rounded="xl" css={{ background: card.color }}>
                <Icon as={card.icon} fontSize="2xl" color="white" />
              </Box>
            </Flex>
          </Box>
        ))}
      </Grid>

      {/* Quick actions */}
      <Box p="5" rounded="2xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
        <Text fontWeight="bold" color="white" fontSize="md" mb="4">Ações Rápidas</Text>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="3">
          <QuickActionLink
            label="Avaliar Formulários"
            desc="Aprovar ou recusar solicitações"
            icon={LuClock}
            onClick={() => navigate("/admin/formularios")}
          />
          <QuickActionLink
            label="Criar Usuário"
            desc="Adicionar novo membro"
            icon={LuUsers}
            onClick={() => navigate("/admin/usuarios")}
          />
          <QuickActionLink
            label="Gerenciar Ranking"
            desc="Adicionar campeões"
            icon={LuTrophy}
            onClick={() => navigate("/admin/ranking")}
          />
          <QuickActionLink
            label="Editar Landing Page"
            desc="Galeria e textos"
            icon={LuImage}
            onClick={() => navigate("/admin/landing")}
          />
        </Grid>
      </Box>
    </Box>
  )
}

function QuickActionLink({ label, desc, icon, onClick }: {
  label: string; desc: string; icon: React.ElementType; onClick: () => void
}) {
  return (
    <Box
      as="button"
      p="4" rounded="xl"
      bg="rgba(139,47,201,0.05)"
      borderWidth="1px"
      borderColor="rgba(139,47,201,0.1)"
      cursor="pointer"
      textAlign="left"
      onClick={onClick}
      _hover={{ bg: "rgba(139,47,201,0.1)", borderColor: "rgba(139,47,201,0.3)" }}
      transition="all 0.2s"
    >
      <HStack gap="3">
        <Box p="2" rounded="lg" bg="rgba(139,47,201,0.15)">
          <Icon as={icon} color="gold.400" fontSize="md" />
        </Box>
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="white">{label}</Text>
          <Text fontSize="xs" color="gray.400" mt="1">{desc}</Text>
        </Box>
      </HStack>
    </Box>
  )
}
