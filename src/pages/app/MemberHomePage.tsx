import { useState, useEffect } from "react"
import {
  Box, VStack, HStack, Text, Heading, Flex, Icon, Image as ChakraImage,
  Grid, GridItem, Separator,
} from "@chakra-ui/react"
import {
  LuCalendar, LuTrophy, LuUsers, LuSparkles, LuArrowRight, LuCamera,
} from "react-icons/lu"
import { useAuth } from "@/lib/auth"
import { supabase, type GalleryPhoto, type Champion } from "@/lib/supabase"
import { useNavigate } from "react-router-dom"

export function MemberHomePage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [gallery, setGallery] = useState<GalleryPhoto[]>([])
  const [champions, setChampions] = useState<Champion[]>([])

  useEffect(() => {
    supabase.from("gallery_photos").select("*").order("sort_order").limit(6).then(({ data }) => {
      if (data) setGallery(data as GalleryPhoto[])
    })
    supabase.from("champions").select("*").order("sort_order").limit(3).then(({ data }) => {
      if (data) setChampions(data as Champion[])
    })
  }, [])

  return (
    <Box>
      {/* Welcome banner */}
      <Box
        mb="8" p={{ base: "6", md: "8" }}
        rounded="2xl"
        position="relative"
        overflow="hidden"
        bg="linear-gradient(135deg, #2D0050 0%, #4A0072 50%, #2D0050 100%)"
        borderWidth="1px"
        borderColor="rgba(245,158,11,0.3)"
      >
        <Box
          position="absolute" top="-50%" right="-5%"
          w="300px" h="300px" rounded="full"
          bg="radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)"
          pointerEvents="none"
        />
        <Flex justify="space-between" align="center" position="relative" direction={{ base: "column", md: "row" }} gap="4">
          <VStack align="start" gap="2">
            <HStack gap="2">
              <Icon as={LuSparkles} color="gold.400" />
              <Text color="gold.400" fontSize="sm" fontWeight="semibold">
                Bem-vindo ao clube
              </Text>
            </HStack>
            <Heading size="xl" fontWeight="black" color="white">
              Olá, {profile?.display_name ?? profile?.username ?? "Membro"}!
            </Heading>
            <Text color="gray.300" fontSize="sm" maxW="400px">
              Continue sua jornada no poker. Treine, evolua e dispute o topo do ranking dos campeões.
            </Text>
          </VStack>
          <Box
            display={{ base: "flex", md: "flex" }}
            flexDir="column"
            align="center"
            gap="1"
          >
            <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color="white">
              {profile?.total_hands ?? 0}
            </Text>
            <Text fontSize="xs" color="gold.400" fontWeight="medium">Mãos Treinadas</Text>
          </Box>
        </Flex>
      </Box>

      {/* Quick actions */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="4" mb="8">
        <QuickAction
          label="Treinar GTO"
          desc="Simulação de mãos"
          icon={LuSparkles}
          onClick={() => navigate("/app/gto")}
        />
        <QuickAction
          label="Ranking"
          desc="Campeões do clube"
          icon={LuTrophy}
          onClick={() => navigate("/app/ranking")}
        />
        <QuickAction
          label="Indicar Amigo"
          desc="Convide para o clube"
          icon={LuUsers}
          onClick={() => navigate("/app/formularios")}
        />
      </Grid>

      {/* Gallery preview */}
      {gallery.length > 0 && (
        <Box mb="8">
          <Flex justify="space-between" align="center" mb="4">
            <HStack gap="2">
              <Icon as={LuCamera} color="gold.400" />
              <Text fontWeight="bold" color="white" fontSize="md">Melhores Momentos</Text>
            </HStack>
          </Flex>
          <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)" }} gap="4">
            {gallery.map((photo) => (
              <Box
                key={photo.id}
                aspectRatio="1"
                rounded="xl" overflow="hidden"
                position="relative"
              >
                <ChakraImage src={photo.url} alt={photo.caption} w="full" h="full" objectFit="cover" />
                {photo.caption && (
                  <Box
                    position="absolute" bottom="0" left="0" right="0"
                    bg="linear-gradient(180deg, transparent, rgba(13,1,24,0.8))"
                    p="2"
                  >
                    <Text color="white" fontSize="xs">{photo.caption}</Text>
                  </Box>
                )}
              </Box>
            ))}
          </Grid>
        </Box>
      )}

      {/* Champions preview */}
      {champions.length > 0 && (
        <Box>
          <Flex justify="space-between" align="center" mb="4">
            <HStack gap="2">
              <Icon as={LuTrophy} color="gold.400" />
              <Text fontWeight="bold" color="white" fontSize="md">Campeões do Clube</Text>
            </HStack>
            <Text
              fontSize="xs" color="gold.400" cursor="pointer"
              onClick={() => navigate("/app/ranking")}
              _hover={{ color: "gold.300" }}
            >
              Ver todos →
            </Text>
          </Flex>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="4">
            {champions.map((champ, i) => (
              <Box
                key={champ.id}
                p="5" rounded="2xl"
                bg="rgba(26,0,48,0.8)"
                borderWidth="1px"
                borderColor="rgba(139,47,201,0.2)"
                textAlign="center"
                _hover={{ borderColor: "rgba(245,158,11,0.3)", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                <Box
                  w="64px" h="64px" rounded="full"
                  mx="auto" mb="3"
                  overflow="hidden"
                  border="2px solid"
                  css={{
                    borderColor: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : "#CD7F32",
                  }}
                >
                  {champ.photo_url ? (
                    <ChakraImage src={champ.photo_url} alt={champ.name} w="full" h="full" objectFit="cover" />
                  ) : (
                    <Box w="full" h="full" bg="rgba(139,47,201,0.3)" display="flex" alignItems="center" justifyContent="center">
                      <Icon as={LuTrophy} color="gold.400" fontSize="xl" />
                    </Box>
                  )}
                </Box>
                <Text fontWeight="bold" color="white" fontSize="sm">{champ.name}</Text>
                <Text fontSize="xs" color="gold.400" mt="1">{champ.titles_count} título{champ.titles_count !== 1 ? "s" : ""}</Text>
                {champ.last_victory && (
                  <Text fontSize="xs" color="gray.500" mt="1">{champ.last_victory}</Text>
                )}
              </Box>
            ))}
          </Grid>
        </Box>
      )}

      {/* Upcoming events placeholder */}
      <Box mt="8">
        <HStack gap="2" mb="4">
          <Icon as={LuCalendar} color="gold.400" />
          <Text fontWeight="bold" color="white" fontSize="md">Próximos Encontros</Text>
        </HStack>
        <Box
          p="6" rounded="2xl"
          bg="rgba(26,0,48,0.6)"
          borderWidth="1px"
          borderColor="rgba(139,47,201,0.15)"
          textAlign="center"
        >
          <Text color="gray.400" fontSize="sm">
            Os próximos encontros serão divulgados em breve. Fique atento às atualizações!
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

function QuickAction({ label, desc, icon, onClick }: {
  label: string; desc: string; icon: React.ElementType; onClick: () => void
}) {
  return (
    <Box
      as="button"
      p="5" rounded="2xl"
      bg="rgba(26,0,48,0.8)"
      borderWidth="1px"
      borderColor="rgba(139,47,201,0.2)"
      cursor="pointer"
      textAlign="left"
      w="full"
      onClick={onClick}
      _hover={{
        borderColor: "rgba(245,158,11,0.4)",
        bg: "rgba(45,0,80,0.8)",
        transform: "translateY(-2px)",
      }}
      transition="all 0.2s"
    >
      <HStack gap="4">
        <Box
          p="3" rounded="xl"
          bg="linear-gradient(135deg, rgba(139,47,201,0.3), rgba(74,0,114,0.2))"
          border="1px solid rgba(139,47,201,0.3)"
        >
          <Icon as={icon} fontSize="xl" color="gold.400" />
        </Box>
        <Box flex="1">
          <Text fontWeight="semibold" color="white" fontSize="sm">{label}</Text>
          <Text fontSize="xs" color="gray.400" mt="1">{desc}</Text>
        </Box>
        <Icon as={LuArrowRight} color="gray.500" />
      </HStack>
    </Box>
  )
}
