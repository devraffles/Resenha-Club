import { Box, Flex, Icon, Text, VStack, HStack, Image, Badge, Separator } from "@chakra-ui/react"
import { LuLayoutDashboard, LuDumbbell, LuLayoutGrid, LuBrainCircuit, LuTrophy, LuNewspaper, LuSettings, LuLogOut, LuBell, LuChevronRight } from "react-icons/lu"
import { useAuth } from "../../lib/auth"
import { Avatar } from "../ui/avatar"

interface NavItem {
  label: string
  icon: React.ElementType
  page: string
  badge?: string
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LuLayoutDashboard, page: "dashboard" },
  { label: "Treinar", icon: LuDumbbell, page: "training" },
  { label: "Ranges", icon: LuLayoutGrid, page: "ranges" },
  { label: "Quiz GTO", icon: LuBrainCircuit, page: "quiz", badge: "HOT" },
  { label: "Torneios", icon: LuTrophy, page: "tournaments" },
  { label: "Notícias", icon: LuNewspaper, page: "news" },
]

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
  notificationCount?: number
}

export function Sidebar({ currentPage, onNavigate, notificationCount = 0 }: SidebarProps) {
  const { profile, signOut } = useAuth()

  return (
    <Box
      w={{ base: "full", md: "72" }}
      h="100vh"
      pos="fixed"
      left="0"
      top="0"
      zIndex="docked"
      bg="linear-gradient(180deg, #1A0030 0%, #0D0118 100%)"
      borderRightWidth="1px"
      borderRightColor="rgba(139,47,201,0.2)"
      display="flex"
      flexDir="column"
      overflowY="auto"
      css={{
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(139,47,201,0.15) 0%, transparent 60%)",
          pointerEvents: "none",
        },
      }}
    >
      {/* Logo */}
      <Box px="6" py="6">
        <Flex align="center" gap="3" cursor="pointer" onClick={() => onNavigate("dashboard")}>
          <Box
            w="48px"
            h="48px"
            rounded="xl"
            overflow="hidden"
            shadow="0 0 20px rgba(139,47,201,0.5)"
            border="2px solid"
            borderColor="rgba(245,158,11,0.5)"
            flexShrink="0"
          >
            <Image src="/image.png" alt="Resenha Club" w="full" h="full" objectFit="cover" />
          </Box>
          <Box>
            <Text
              fontWeight="black"
              fontSize="md"
              lineHeight="tight"
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
          const isActive = currentPage === item.page
          return (
            <Box
              key={item.page}
              as="button"
              onClick={() => onNavigate(item.page)}
              px="4"
              py="3"
              rounded="xl"
              cursor="pointer"
              transition="all 0.2s"
              position="relative"
              bg={isActive ? "rgba(139,47,201,0.2)" : "transparent"}
              borderWidth="1px"
              borderColor={isActive ? "rgba(139,47,201,0.4)" : "transparent"}
              _hover={{
                bg: "rgba(139,47,201,0.15)",
                borderColor: "rgba(139,47,201,0.3)",
                transform: "translateX(2px)",
              }}
              css={isActive ? {
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: "20%",
                  bottom: "20%",
                  width: "3px",
                  background: "linear-gradient(180deg, #FFD700, #F59E0B)",
                  borderRadius: "0 4px 4px 0",
                },
              } : {}}
            >
              <Flex align="center" gap="3">
                <Icon
                  as={item.icon}
                  color={isActive ? "gold.400" : "purple.300"}
                  fontSize="lg"
                />
                <Text
                  flex="1"
                  fontSize="sm"
                  fontWeight={isActive ? "semibold" : "medium"}
                  color={isActive ? "white" : "gray.300"}
                  textAlign="left"
                >
                  {item.label}
                </Text>
                {item.badge && (
                  <Badge
                    fontSize="2xs"
                    px="1.5"
                    py="0.5"
                    rounded="full"
                    colorPalette="orange"
                    variant="solid"
                  >
                    {item.badge}
                  </Badge>
                )}
                {isActive && (
                  <Icon as={LuChevronRight} color="gold.400" fontSize="xs" />
                )}
              </Flex>
            </Box>
          )
        })}
      </VStack>

      <Separator borderColor="rgba(139,47,201,0.2)" />

      {/* Bottom actions */}
      <Box px="4" py="4">
        <VStack gap="1" align="stretch">
          <Box
            as="button"
            px="4"
            py="3"
            rounded="xl"
            cursor="pointer"
            onClick={() => onNavigate("settings")}
            bg={currentPage === "settings" ? "rgba(139,47,201,0.2)" : "transparent"}
            _hover={{ bg: "rgba(139,47,201,0.1)" }}
            transition="all 0.2s"
          >
            <Flex align="center" gap="3">
              <Icon as={LuSettings} color="purple.300" fontSize="lg" />
              <Text fontSize="sm" fontWeight="medium" color="gray.300" textAlign="left">Configurações</Text>
            </Flex>
          </Box>

          <Box
            as="button"
            px="4"
            py="3"
            rounded="xl"
            cursor="pointer"
            position="relative"
            onClick={() => onNavigate("notifications")}
            _hover={{ bg: "rgba(139,47,201,0.1)" }}
            transition="all 0.2s"
          >
            <Flex align="center" gap="3">
              <Box position="relative">
                <Icon as={LuBell} color="purple.300" fontSize="lg" />
                {notificationCount > 0 && (
                  <Box
                    position="absolute"
                    top="-1"
                    right="-1"
                    w="4"
                    h="4"
                    bg="red.500"
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="2xs" fontWeight="bold" color="white">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Text>
                  </Box>
                )}
              </Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.300" textAlign="left">Notificações</Text>
            </Flex>
          </Box>
        </VStack>

        {/* User profile section */}
        <Box
          mt="4"
          p="3"
          rounded="xl"
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
                {profile?.rank_points ?? 0} pts
              </Text>
            </Box>
            <Box
              as="button"
              p="1.5"
              rounded="lg"
              cursor="pointer"
              _hover={{ bg: "rgba(239,68,68,0.2)" }}
              onClick={signOut}
            >
              <Icon as={LuLogOut} color="gray.400" fontSize="md" />
            </Box>
          </HStack>
        </Box>
      </Box>
    </Box>
  )
}
