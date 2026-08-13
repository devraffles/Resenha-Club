import { useState, useEffect, useRef } from "react"
import {
  Box, VStack, HStack, Text, Heading, Flex, Icon, Input, Textarea,
  Button, Separator, Image as ChakraImage,
} from "@chakra-ui/react"
import { Checkbox } from "@/components/ui/checkbox"
import { Field } from "@/components/ui/field"
import {
  LuCalendar, LuTrophy, LuLayers, LuUsers, LuArrowRight, LuCheck,
  LuCamera, LuX, LuChevronLeft, LuChevronRight,
} from "react-icons/lu"
import { supabase, type GalleryPhoto, type LandingContent } from "@/lib/supabase"
import { toaster } from "@/components/ui/toaster"

interface LandingHero {
  title: string
  subtitle: string
  cta: string
}
interface LandingHistory {
  title: string
  text: string
}
interface HowItWorksItem {
  icon: string
  title: string
  desc: string
}
interface LandingHowItWorks {
  title: string
  items: HowItWorksItem[]
}

const iconMap: Record<string, React.ElementType> = {
  calendar: LuCalendar,
  trophy: LuTrophy,
  cards: LuLayers,
  family: LuUsers,
}

export function LandingPage() {
  const [hero, setHero] = useState<LandingHero | null>(null)
  const [history, setHistory] = useState<LandingHistory | null>(null)
  const [howItWorks, setHowItWorks] = useState<LandingHowItWorks | null>(null)
  const [gallery, setGallery] = useState<GalleryPhoto[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Form state
  const [form, setForm] = useState({
    name: "", phone: "", instagram: "", city: "",
    poker_experience: "", message: "",
  })
  const [consentLgpd, setConsentLgpd] = useState(false)
  const [consentImage, setConsentImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from("landing_content").select("*").then(({ data }) => {
      if (data) {
        const items = data as LandingContent[]
        for (const item of items) {
          if (item.key === "hero") setHero(item.value as unknown as LandingHero)
          if (item.key === "history") setHistory(item.value as unknown as LandingHistory)
          if (item.key === "how_it_works") setHowItWorks(item.value as unknown as LandingHowItWorks)
        }
      }
    })
    supabase.from("gallery_photos").select("*").order("sort_order").then(({ data }) => {
      if (data) setGallery(data as GalleryPhoto[])
    })
  }, [])

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consentLgpd || !consentImage) {
      toaster.create({ title: "Consentimentos obrigatórios", description: "Você precisa aceitar ambos os consentimentos.", type: "error" })
      return
    }
    setSubmitting(true)
    const { error } = await supabase.from("interest_submissions").insert({
      name: form.name,
      phone: form.phone,
      instagram: form.instagram,
      city: form.city,
      poker_experience: form.poker_experience,
      message: form.message,
      consent_lgpd: consentLgpd,
      consent_image: consentImage,
    })
    setSubmitting(false)
    if (error) {
      toaster.create({ title: "Erro ao enviar", description: error.message, type: "error" })
    } else {
      setSubmitted(true)
      toaster.create({ title: "Solicitação enviada!", description: "O administrador entrará em contato.", type: "success" })
    }
  }

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const nextPhoto = () => setLightboxIndex((prev) => prev === null ? null : (prev + 1) % gallery.length)
  const prevPhoto = () => setLightboxIndex((prev) => prev === null ? null : (prev - 1 + gallery.length) % gallery.length)

  return (
    <Box minH="100vh" bg="#0D0118" overflow="hidden">
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
        <Flex maxW="7xl" mx="auto" px={{ base: "4", md: "8" }} py="4" align="center" justify="space-between">
          <Flex align="center" gap="3">
            <Box w="40px" h="40px" rounded="lg" overflow="hidden" border="2px solid" borderColor="rgba(245,158,11,0.5)">
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
          <Button
            variant="ghost" size="sm"
            color="gold.400"
            _hover={{ bg: "rgba(245,158,11,0.1)", color: "gold.300" }}
            onClick={() => window.location.href = "/login"}
            display={{ base: "none", md: "flex" }}
          >
            Área do Membro
          </Button>
        </Flex>
      </Box>

      {/* Hero Section */}
      <Box
        as="section"
        minH="100vh"
        display="flex"
        alignItems="center"
        position="relative"
        pt="80px"
        bg="linear-gradient(135deg, #2D0050 0%, #1A0030 40%, #0D0118 100%)"
      >
        <Box
          position="absolute" top="0" left="0" right="0" bottom="0"
          bg="radial-gradient(ellipse at 70% 50%, rgba(139,47,201,0.2) 0%, transparent 60%)"
          pointerEvents="none"
        />
        <Box
          position="absolute" top="10%" right="5%"
          w="400px" h="400px" rounded="full"
          bg="radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)"
          pointerEvents="none"
        />

        <Box maxW="7xl" mx="auto" px={{ base: "4", md: "8" }} position="relative" w="full">
          <Flex direction={{ base: "column", lg: "row" }} align="center" gap="12">
            <VStack flex="1" align="start" gap="6">
              <Box
                px="4" py="2" rounded="full"
                bg="rgba(245,158,11,0.1)"
                borderWidth="1px"
                borderColor="rgba(245,158,11,0.3)"
              >
                <HStack gap="2">
                  <Icon as={LuUsers} color="gold.400" fontSize="sm" />
                  <Text fontSize="sm" color="gold.400" fontWeight="medium">Clube Privado · Apenas por Convite</Text>
                </HStack>
              </Box>

              <Heading
                size="2xl"
                fontWeight="black"
                color="white"
                lineHeight="shorter"
                maxW="600px"
              >
                {hero?.title ?? "Mais que Poker. Uma Resenha entre Amigos."}
              </Heading>

              <Text color="gray.400" fontSize="lg" lineHeight="tall" maxW="500px">
                {hero?.subtitle ?? "O clube privado de poker que une técnica, estratégia e amizade. Acesso exclusivo para membros convidados."}
              </Text>

              <HStack gap="4" flexWrap="wrap">
                <Button
                  size="lg"
                  fontWeight="bold"
                  h="52px"
                  css={{
                    background: "linear-gradient(135deg, #8B2FC9, #6A0F91)",
                    border: "1px solid rgba(245,158,11,0.3)",
                    color: "white",
                    "&:hover:not(:disabled)": {
                      background: "linear-gradient(135deg, #9D44F0, #7B1FA2)",
                      boxShadow: "0 0 24px rgba(139,47,201,0.4)",
                      transform: "translateY(-1px)",
                    },
                  }}
                  onClick={scrollToForm}
                >
                  {hero?.cta ?? "Quero fazer parte da Resenha"}
                  <Icon as={LuArrowRight} ml="2" />
                </Button>
              </HStack>
            </VStack>

            <Box flex="1" display={{ base: "none", lg: "block" }} position="relative">
              <Box
                w="full" maxW="480px" aspectRatio="4/5"
                rounded="3xl" overflow="hidden"
                shadow="0 25px 80px rgba(0,0,0,0.5)"
                border="2px solid"
                borderColor="rgba(245,158,11,0.2)"
                position="relative"
              >
                {gallery[0] ? (
                  <ChakraImage src={gallery[0].url} alt={gallery[0].caption} w="full" h="full" objectFit="cover" />
                ) : (
                  <Box w="full" h="full" bg="linear-gradient(135deg, #4A0072, #2D0050)" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={LuCamera} fontSize="6xl" color="purple.400" />
                  </Box>
                )}
                <Box
                  position="absolute" bottom="0" left="0" right="0"
                  bg="linear-gradient(180deg, transparent, rgba(13,1,24,0.9))"
                  p="6"
                >
                  <Text color="white" fontWeight="bold" fontSize="lg">The Resenha Club</Text>
                  <Text color="gray.400" fontSize="sm">Onde a estratégia encontra a amizade</Text>
                </Box>
              </Box>
            </Box>
          </Flex>
        </Box>
      </Box>

      {/* History Section */}
      <Box as="section" py={{ base: "16", md: "24" }} position="relative">
        <Box maxW="5xl" mx="auto" px={{ base: "4", md: "8" }}>
          <VStack gap="8" align="center" textAlign="center">
            <Box
              px="4" py="2" rounded="full"
              bg="rgba(139,47,201,0.1)"
              borderWidth="1px"
              borderColor="rgba(139,47,201,0.3)"
            >
              <Text fontSize="sm" color="purple.300" fontWeight="medium">Nossa História</Text>
            </Box>
            <Heading size="xl" fontWeight="black" color="white" lineHeight="shorter">
              {history?.title ?? "Nossa História"}
            </Heading>
            <Text color="gray.400" fontSize="lg" lineHeight="tall" maxW="700px">
              {history?.text ?? "A Resenha Club nasceu da paixão por poker..."}
            </Text>
          </VStack>

          {gallery.length > 1 && (
            <Grid3Photos gallery={gallery} onOpen={openLightbox} />
          )}
        </Box>
      </Box>

      {/* How It Works Section */}
      <Box as="section" py={{ base: "16", md: "24" }} bg="linear-gradient(180deg, #0D0118, #1A0030, #0D0118)">
        <Box maxW="7xl" mx="auto" px={{ base: "4", md: "8" }}>
          <VStack gap="4" mb="12" textAlign="center">
            <Box
              px="4" py="2" rounded="full"
              bg="rgba(245,158,11,0.1)"
              borderWidth="1px"
              borderColor="rgba(245,158,11,0.3)"
            >
              <Text fontSize="sm" color="gold.400" fontWeight="medium">Como Funciona</Text>
            </Box>
            <Heading size="xl" fontWeight="black" color="white">
              {howItWorks?.title ?? "Como Funciona"}
            </Heading>
          </VStack>

          <Box
            display="grid"
            gridTemplateColumns={{ base: "1fr", md: "1fr 1fr", lg: "repeat(4, 1fr)" }}
            gap="6"
          >
            {(howItWorks?.items ?? []).map((item, i) => {
              const IconComp = iconMap[item.icon] ?? LuTrophy
              return (
                <Box
                  key={i}
                  p="6" rounded="2xl"
                  bg="rgba(26,0,48,0.6)"
                  borderWidth="1px"
                  borderColor="rgba(139,47,201,0.2)"
                  _hover={{ borderColor: "rgba(245,158,11,0.4)", transform: "translateY(-4px)" }}
                  transition="all 0.3s"
                  textAlign="center"
                >
                  <Box
                    w="56px" h="56px" rounded="xl"
                    mx="auto" mb="4"
                    display="flex" alignItems="center" justifyContent="center"
                    bg="linear-gradient(135deg, rgba(139,47,201,0.3), rgba(74,0,114,0.2))"
                    border="1px solid rgba(139,47,201,0.3)"
                  >
                    <Icon as={IconComp} fontSize="2xl" color="gold.400" />
                  </Box>
                  <Text fontWeight="bold" color="white" fontSize="md" mb="2">{item.title}</Text>
                  <Text color="gray.400" fontSize="sm" lineHeight="tall">{item.desc}</Text>
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <Box as="section" py={{ base: "16", md: "24" }}>
          <Box maxW="7xl" mx="auto" px={{ base: "4", md: "8" }}>
            <VStack gap="4" mb="12" textAlign="center">
              <Box
                px="4" py="2" rounded="full"
                bg="rgba(139,47,201,0.1)"
                borderWidth="1px"
                borderColor="rgba(139,47,201,0.3)"
              >
                <Text fontSize="sm" color="purple.300" fontWeight="medium">Galeria</Text>
              </Box>
              <Heading size="xl" fontWeight="black" color="white">Momentos da Resenha</Heading>
            </VStack>

            <Box
              display="grid"
              gridTemplateColumns={{ base: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }}
              gap="4"
            >
              {gallery.map((photo, i) => (
                <Box
                  key={photo.id}
                  aspectRatio="1"
                  rounded="xl" overflow="hidden"
                  cursor="pointer"
                  position="relative"
                  onClick={() => openLightbox(i)}
                  _hover={{ transform: "scale(1.02)" }}
                  transition="all 0.3s"
                >
                  <ChakraImage src={photo.url} alt={photo.caption} w="full" h="full" objectFit="cover" />
                  <Box
                    position="absolute" bottom="0" left="0" right="0"
                    bg="linear-gradient(180deg, transparent, rgba(13,1,24,0.8))"
                    p="3"
                    opacity="0"
                    _hover={{ opacity: 1 }}
                    transition="opacity 0.3s"
                  >
                    <Text color="white" fontSize="sm">{photo.caption}</Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Interest Form Section */}
      <Box as="section" ref={formRef} py={{ base: "16", md: "24" }} bg="linear-gradient(180deg, #0D0118, #1A0030)">
        <Box maxW="2xl" mx="auto" px={{ base: "4", md: "8" }}>
          <VStack gap="4" mb="8" textAlign="center">
            <Box
              px="4" py="2" rounded="full"
              bg="rgba(245,158,11,0.1)"
              borderWidth="1px"
              borderColor="rgba(245,158,11,0.3)"
            >
              <Text fontSize="sm" color="gold.400" fontWeight="medium">Faça Parte</Text>
            </Box>
            <Heading size="xl" fontWeight="black" color="white">
              Quero fazer parte da Resenha
            </Heading>
            <Text color="gray.400" fontSize="md">
              Preencha o formulário abaixo. O administrador entrará em contato caso você seja aprovado.
            </Text>
          </VStack>

          {submitted ? (
            <Box
              p="8" rounded="2xl"
              bg="rgba(34,197,94,0.1)"
              borderWidth="1px"
              borderColor="rgba(34,197,94,0.3)"
              textAlign="center"
            >
              <Box
                w="64px" h="64px" rounded="full"
                mx="auto" mb="4"
                display="flex" alignItems="center" justifyContent="center"
                bg="rgba(34,197,94,0.2)"
              >
                <Icon as={LuCheck} fontSize="3xl" color="green.400" />
              </Box>
              <Heading size="md" color="white" mb="2">Solicitação Enviada!</Heading>
              <Text color="gray.400" fontSize="sm">
                O administrador entrará em contato caso você seja aprovado.
              </Text>
            </Box>
          ) : (
            <Box
              p={{ base: "6", md: "8" }}
              rounded="2xl"
              bg="rgba(26,0,48,0.8)"
              borderWidth="1px"
              borderColor="rgba(139,47,201,0.2)"
            >
              <form onSubmit={handleSubmit}>
                <VStack gap="4" align="stretch">
                  <Field label="Nome completo" required>
                    <Input
                      placeholder="Seu nome"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      bg="rgba(139,47,201,0.1)"
                      borderColor="rgba(139,47,201,0.3)"
                      color="white"
                      _placeholder={{ color: "gray.500" }}
                      _hover={{ borderColor: "rgba(139,47,201,0.5)" }}
                      _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px rgba(139,47,201,0.5)" }}
                    />
                  </Field>

                  <HStack gap="4" flexDir={{ base: "column", sm: "row" }} align="stretch">
                    <Field label="Telefone" required flex="1">
                      <Input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                        bg="rgba(139,47,201,0.1)"
                        borderColor="rgba(139,47,201,0.3)"
                        color="white"
                        _placeholder={{ color: "gray.500" }}
                        _hover={{ borderColor: "rgba(139,47,201,0.5)" }}
                        _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px rgba(139,47,201,0.5)" }}
                      />
                    </Field>
                    <Field label="Instagram" flex="1">
                      <Input
                        placeholder="@seuinstagram"
                        value={form.instagram}
                        onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                        bg="rgba(139,47,201,0.1)"
                        borderColor="rgba(139,47,201,0.3)"
                        color="white"
                        _placeholder={{ color: "gray.500" }}
                        _hover={{ borderColor: "rgba(139,47,201,0.5)" }}
                        _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px rgba(139,47,201,0.5)" }}
                      />
                    </Field>
                  </HStack>

                  <Field label="Cidade" required>
                    <Input
                      placeholder="Sua cidade"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      required
                      bg="rgba(139,47,201,0.1)"
                      borderColor="rgba(139,47,201,0.3)"
                      color="white"
                      _placeholder={{ color: "gray.500" }}
                      _hover={{ borderColor: "rgba(139,47,201,0.5)" }}
                      _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px rgba(139,47,201,0.5)" }}
                    />
                  </Field>

                  <Field label="Experiência com Poker">
                    <Input
                      placeholder="Ex: Jogador recreativo há 2 anos"
                      value={form.poker_experience}
                      onChange={(e) => setForm({ ...form, poker_experience: e.target.value })}
                      bg="rgba(139,47,201,0.1)"
                      borderColor="rgba(139,47,201,0.3)"
                      color="white"
                      _placeholder={{ color: "gray.500" }}
                      _hover={{ borderColor: "rgba(139,47,201,0.5)" }}
                      _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px rgba(139,47,201,0.5)" }}
                    />
                  </Field>

                  <Field label="Mensagem">
                    <Textarea
                      placeholder="Conte um pouco sobre você e por que quer entrar no clube..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={4}
                      bg="rgba(139,47,201,0.1)"
                      borderColor="rgba(139,47,201,0.3)"
                      color="white"
                      _placeholder={{ color: "gray.500" }}
                      _hover={{ borderColor: "rgba(139,47,201,0.5)" }}
                      _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px rgba(139,47,201,0.5)" }}
                    />
                  </Field>

                  <Separator borderColor="rgba(139,47,201,0.15)" my="2" />

                  <VStack gap="3" align="stretch">
                    <Checkbox
                      checked={consentLgpd}
                      onCheckedChange={(e) => setConsentLgpd(!!e.checked)}
                      colorPalette="purple"
                    >
                      <Text fontSize="sm" color="gray.300">
                        Autorizo o tratamento dos meus dados pessoais conforme a{" "}
                        <Text
                          as="a" href="/politica-de-privacidade"
                          color="gold.400" textDecoration="underline"
                          target="_blank"
                        >
                          Política de Privacidade
                        </Text>{" "}
                        (LGPD). *
                      </Text>
                    </Checkbox>

                    <Checkbox
                      checked={consentImage}
                      onCheckedChange={(e) => setConsentImage(!!e.checked)}
                      colorPalette="purple"
                    >
                      <Text fontSize="sm" color="gray.300">
                        Autorizo o uso da minha imagem em fotos e vídeos do clube. *
                      </Text>
                    </Checkbox>
                  </VStack>

                  <Button
                    type="submit"
                    loading={submitting}
                    size="lg"
                    fontWeight="bold"
                    mt="2"
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
                    Enviar Solicitação
                  </Button>
                </VStack>
              </form>
            </Box>
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box as="footer" py="8" borderTopWidth="1px" borderTopColor="rgba(139,47,201,0.15)">
        <Box maxW="7xl" mx="auto" px={{ base: "4", md: "8" }}>
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap="4">
            <Flex align="center" gap="3">
              <Box w="32px" h="32px" rounded="lg" overflow="hidden">
                <ChakraImage src="/image.png" alt="Resenha Club" w="full" h="full" objectFit="cover" />
              </Box>
              <Text fontSize="sm" color="gray.500">© 2025 The Resenha Club. Todos os direitos reservados.</Text>
            </Flex>
            <HStack gap="6">
              <Text as="a" href="/politica-de-privacidade" fontSize="sm" color="gray.500" cursor="pointer" _hover={{ color: "gray.400" }}>
                Política de Privacidade
              </Text>
              <Text as="a" href="/login" fontSize="sm" color="gray.500" cursor="pointer" _hover={{ color: "gray.400" }}>
                Área do Membro
              </Text>
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* Lightbox */}
      {lightboxIndex !== null && gallery[lightboxIndex] && (
        <Box
          position="fixed"
          top="0" left="0" right="0" bottom="0"
          bg="rgba(0,0,0,0.9)"
          zIndex="modal"
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={closeLightbox}
        >
          <Box
            position="absolute" top="4" right="4"
            as="button"
            p="3" rounded="lg"
            cursor="pointer"
            bg="rgba(255,255,255,0.1)"
            _hover={{ bg: "rgba(255,255,255,0.2)" }}
            onClick={closeLightbox}
          >
            <Icon as={LuX} color="white" fontSize="xl" />
          </Box>

          {gallery.length > 1 && (
            <>
              <Box
                position="absolute" left="4" top="50%"
                transform="translateY(-50%)"
                as="button"
                p="3" rounded="lg"
                cursor="pointer"
                bg="rgba(255,255,255,0.1)"
                _hover={{ bg: "rgba(255,255,255,0.2)" }}
                onClick={(e) => { e.stopPropagation(); prevPhoto() }}
              >
                <Icon as={LuChevronLeft} color="white" fontSize="xl" />
              </Box>
              <Box
                position="absolute" right="4" top="50%"
                transform="translateY(-50%)"
                as="button"
                p="3" rounded="lg"
                cursor="pointer"
                bg="rgba(255,255,255,0.1)"
                _hover={{ bg: "rgba(255,255,255,0.2)" }}
                onClick={(e) => { e.stopPropagation(); nextPhoto() }}
              >
                <Icon as={LuChevronRight} color="white" fontSize="xl" />
              </Box>
            </>
          )}

          <Box
            maxW="90vw" maxH="85vh"
            onClick={(e) => e.stopPropagation()}
            rounded="xl" overflow="hidden"
          >
            <ChakraImage
              src={gallery[lightboxIndex].url}
              alt={gallery[lightboxIndex].caption}
              maxW="90vw" maxH="80vh"
              objectFit="contain"
            />
            {gallery[lightboxIndex].caption && (
              <Text color="white" fontSize="md" textAlign="center" mt="4">
                {gallery[lightboxIndex].caption}
              </Text>
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}

function Grid3Photos({ gallery, onOpen }: { gallery: GalleryPhoto[]; onOpen: (i: number) => void }) {
  const photos = gallery.slice(1, 4)
  if (photos.length === 0) return null
  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
      gap="4"
      mt="12"
    >
      {photos.map((photo, i) => (
        <Box
          key={photo.id}
          aspectRatio="4/3"
          rounded="xl" overflow="hidden"
          cursor="pointer"
          _hover={{ transform: "scale(1.02)" }}
          transition="all 0.3s"
          onClick={() => onOpen(i + 1)}
        >
          <ChakraImage src={photo.url} alt={photo.caption} w="full" h="full" objectFit="cover" />
        </Box>
      ))}
    </Box>
  )
}
