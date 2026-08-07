import { Box, Flex, Icon, Text } from "@chakra-ui/react"
import { LuLayoutDashboard, LuDumbbell, LuLayoutGrid, LuBrainCircuit, LuTrophy, LuNewspaper } from "react-icons/lu"

const navItems = [
  { label: "Home", icon: LuLayoutDashboard, page: "dashboard" },
  { label: "Treinar", icon: LuDumbbell, page: "training" },
  { label: "Ranges", icon: LuLayoutGrid, page: "ranges" },
  { label: "Quiz", icon: LuBrainCircuit, page: "quiz" },
  { label: "Torneios", icon: LuTrophy, page: "tournaments" },
  { label: "News", icon: LuNewspaper, page: "news" },
]

interface MobileNavProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function MobileNav({ currentPage, onNavigate }: MobileNavProps) {
  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      zIndex="sticky"
      bg="rgba(13,1,24,0.95)"
      borderTopWidth="1px"
      borderTopColor="rgba(139,47,201,0.3)"
      backdropFilter="blur(20px)"
      display={{ base: "block", md: "none" }}
      safeAreaPaddingBottom="env(safe-area-inset-bottom)"
    >
      <Flex justify="around" px="2" py="2">
        {navItems.map((item) => {
          const isActive = currentPage === item.page
          return (
            <Box
              key={item.page}
              as="button"
              flex="1"
              display="flex"
              flexDir="column"
              alignItems="center"
              gap="1"
              py="2"
              px="1"
              cursor="pointer"
              onClick={() => onNavigate(item.page)}
              transition="all 0.2s"
            >
              <Box
                p="1.5"
                rounded="lg"
                bg={isActive ? "rgba(139,47,201,0.3)" : "transparent"}
                transition="all 0.2s"
              >
                <Icon
                  as={item.icon}
                  fontSize="xl"
                  color={isActive ? "gold.400" : "gray.500"}
                />
              </Box>
              <Text
                fontSize="2xs"
                fontWeight={isActive ? "semibold" : "normal"}
                color={isActive ? "gold.400" : "gray.500"}
              >
                {item.label}
              </Text>
            </Box>
          )
        })}
      </Flex>
    </Box>
  )
}
