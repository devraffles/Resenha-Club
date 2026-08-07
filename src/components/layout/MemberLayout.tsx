import { useState, useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Box, Flex, Icon, Text, VStack, HStack, Image, Separator } from "@chakra-ui/react"
import {
  LuHouse, LuTrophy, LuBrainCircuit, LuFileText, LuLogOut, LuChevronRight,
} from "react-icons/lu"
import { useAuth } from "@/lib/auth"
import { Avatar } from "@/components/ui/avatar"

const navItems = [
  { label: "Início", icon: LuHouse, path: "/app" },
  { label: "Ranking", icon: LuTrophy, path: "/app/ranking" },
  { label: "GTO", icon: LuBrainCircuit, path: "/app/gto" },
  { label: "Formulários", icon: LuFileText, path: "/app/formularios" },
]

export function MemberLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [currentPath, setCurrentPath] = useState("/app")

  useEffect(() => {
    const updatePath = () => {
      const path = window.location.pathname
      setCurrentPath(path)
      const match = navItems.find((item) => path === item.path || (item.path !== "/app" && path.startsWith(item.path)))
      if (match && path !== match.path) {
        // keep active state for sub-routes
      }
    }
    updatePath()
    window.addEventListener("popstate", updatePath)
    return () => window.removeEventListener("popstate", updatePath)
  }, [])

  const handleNavigate = (path: string) => {
    setCurrentPath(path)
    navigate(path)
  }

  const isActive = (itemPath: string) => {
    if (itemPath === "/app") return currentPath === "/app"
    return currentPath.startsWith(itemPath)
  }

  return (
    <Box minH="100vh" bg="#0D0118">
      {/* Desktop sidebar */}
      <Box
        display={{ base: "none", md: "block" }}
        w="72"
        h="100vh"
        pos="fixed"
        left="0"
        top="0"
        zIndex="docked"
        bg="linear-gradient(180deg, #1A0030 0%, #0D0118 100%)"
        borderRightWidth="1px"
        borderRightColor="rgba(139,47,201,0.2)"
        overflowY="auto"
        css={{
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(139,47,201,0.15) 0%, transparent 60%)",
            pointerEvents: "none",
          },
        }}
      >
        <Flex flexDir="column" h="full" position="relative">
          {/* Logo */}
          <Box px="6" py="6">
            <Flex align="center" gap="3" cursor="pointer" onClick={() => handleNavigate("/app")}>
              <Box
                w="48px" h="48px" rounded="xl" overflow="hidden"
                shadow="0 0 20px rgba(139,47,201,0.5)"
                border="2px solid"
                borderColor="rgba(245,158,11,0.5)"
                flexShrink="0"
              >
                <Image src="/image.png" alt="Resenha Club" w="full" h="full" objectFit="cover" />
              </Box>
              <Box>
                <Text
                  fontWeight="black" fontSize="md" lineHeight="tight"
                  css={{
                    background: "linear-gradient(135deg, #FFD700, #F59E0B)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  RESENHA
                </Text>
                <Text fontSize="xs" color="purple.300" fontWeight="medium" letterSpacing="widest">
                  GTO TRAINER
                </Text>
              </Box>
            </Flex>
          </Box>

          <Separator borderColor="rgba(139,47,201,0.2)" />

          {/* Navigation */}
          <VStack flex="1" px="4" py="6" gap="1" align="stretch">
            {navItems.map((item) => {
              const active = isActive(item.path)
              return (
                <Box
                  key={item.path}
                  as="button"
                  onClick={() => handleNavigate(item.path)}
                  px="4" py="3" rounded="xl"
                  cursor="pointer"
                  transition="all 0.2s"
                  position="relative"
                  bg={active ? "rgba(139,47,201,0.2)" : "transparent"}
                  borderWidth="1px"
                  borderColor={active ? "rgba(139,47,201,0.4)" : "transparent"}
                  _hover={{
                    bg: "rgba(139,47,201,0.15)",
                    borderColor: "rgba(139,47,201,0.3)",
                    transform: "translateX(2px)",
                  }}
                  css={active ? {
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0, top: "20%", bottom: "20%",
                      width: "3px",
                      background: "linear-gradient(180deg, #FFD700, #F59E0B)",
                      borderRadius: "0 4px 4px 0",
                    },
                  } : {}}
                >
                  <Flex align="center" gap="3">
                    <Icon as={item.icon} color={active ? "gold.400" : "purple.300"} fontSize="lg" />
                    <Text
                      flex="1" fontSize="sm"
                      fontWeight={active ? "semibold" : "medium"}
                      color={active ? "white" : "gray.300"}
                      textAlign="left"
                    >
                      {item.label}
                    </Text>
                    {active && <Icon as={LuChevronRight} color="gold.400" fontSize="xs" />}
                  </Flex>
                </Box>
              )
            })}
          </VStack>

          <Separator borderColor="rgba(139,47,201,0.2)" />

          {/* User profile section */}
          <Box px="4" py="4">
            <Box
              p="3" rounded="xl"
              bg="rgba(139,47,201,0.1)"
              borderWidth="1px"
              borderColor="rgba(139,47,201,0.2)"
            >
              <HStack gap="3">
                <Avatar
                  size="sm"
                  name={profile?.display_name ?? profile?.username ?? "Player"}
                  src={profile?.avatar_url ?? undefined}
                />
                <Box flex="1" minW="0">
                  <Text fontSize="sm" fontWeight="semibold" color="white" truncate>
                    {profile?.display_name ?? profile?.username ?? "Player"}
                  </Text>
                  <Text fontSize="xs" color="purple.300" truncate>
                    {profile?.role === "admin" ? "Administrador" : "Membro"}
                  </Text>
                </Box>
                <Box
                  as="button"
                  p="1.5" rounded="lg" cursor="pointer"
                  _hover={{ bg: "rgba(239,68,68,0.2)" }}
                  onClick={signOut}
                >
                  <Icon as={LuLogOut} color="gray.400" fontSize="md" />
                </Box>
              </HStack>
            </Box>
          </Box>
        </Flex>
      </Box>

      {/* Main content */}
      <Box ml={{ base: "0", md: "72" }} minH="100vh" pb={{ base: "80px", md: "0" }}>
        <Box maxW="7xl" mx="auto" px={{ base: "4", md: "8" }} py={{ base: "6", md: "8" }}>
          <Outlet />
        </Box>
      </Box>

      {/* Mobile bottom nav */}
      <Box
        position="fixed"
        bottom="0" left="0" right="0"
        zIndex="sticky"
        bg="rgba(13,1,24,0.95)"
        borderTopWidth="1px"
        borderTopColor="rgba(139,47,201,0.3)"
        backdropFilter="blur(20px)"
        display={{ base: "block", md: "none" }}
      >
        <Flex justify="around" px="2" py="2">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Box
                key={item.path}
                as="button"
                flex="1"
                display="flex"
                flexDir="column"
                alignItems="center"
                gap="1"
                py="2" px="1"
                cursor="pointer"
                onClick={() => handleNavigate(item.path)}
                transition="all 0.2s"
              >
                <Box
                  p="1.5" rounded="lg"
                  bg={active ? "rgba(139,47,201,0.3)" : "transparent"}
                  transition="all 0.2s"
                >
                  <Icon as={item.icon} fontSize="xl" color={active ? "gold.400" : "gray.500"} />
                </Box>
                <Text
                  fontSize="2xs"
                  fontWeight={active ? "semibold" : "normal"}
                  color={active ? "gold.400" : "gray.500"}
                >
                  {item.label}
                </Text>
              </Box>
            )
          })}
        </Flex>
      </Box>
    </Box>
  )
}
