import { useState, useEffect } from "react"
import {
  Box, VStack, HStack, Text, Heading, Flex, Icon, Grid,
  Button, Input, Textarea, Separator,
} from "@chakra-ui/react"
import {
  LuImage, LuPlus, LuTrash2, LuSave, LuPencil, LuLayoutPanelTop, LuFileText,
} from "react-icons/lu"
import { Field } from "@/components/ui/field"
import { supabase, type GalleryPhoto, type LandingContent } from "@/lib/supabase"
import { toaster } from "@/components/ui/toaster"

type TabId = "gallery" | "content"

export function AdminLandingPage() {
  const [tab, setTab] = useState<TabId>("gallery")
  const [gallery, setGallery] = useState<GalleryPhoto[]>([])
  const [content, setContent] = useState<LandingContent[]>([])
  const [loading, setLoading] = useState(true)

  // Gallery form
  const [galleryForm, setGalleryForm] = useState({ url: "", caption: "", consent_by: "" })
  const [addingPhoto, setAddingPhoto] = useState(false)

  // Content editing
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: gal }, { data: cont }] = await Promise.all([
      supabase.from("gallery_photos").select("*").order("sort_order"),
      supabase.from("landing_content").select("*").order("key"),
    ])
    if (gal) setGallery(gal as GalleryPhoto[])
    if (cont) setContent(cont as LandingContent[])
    setLoading(false)
  }

  async function addPhoto() {
    if (!galleryForm.url) {
      toaster.create({ title: "URL da foto é obrigatória", type: "error" })
      return
    }
    setAddingPhoto(true)
    const { error } = await supabase.from("gallery_photos").insert({
      url: galleryForm.url,
      caption: galleryForm.caption,
      consent_by: galleryForm.consent_by,
      sort_order: gallery.length,
    })
    if (error) toaster.create({ title: "Erro", description: error.message, type: "error" })
    else {
      toaster.create({ title: "Foto adicionada!", type: "success" })
      setGalleryForm({ url: "", caption: "", consent_by: "" })
      await loadData()
    }
    setAddingPhoto(false)
  }

  async function removePhoto(id: string) {
    if (!confirm("Remover esta foto?")) return
    const { error } = await supabase.from("gallery_photos").delete().eq("id", id)
    if (error) toaster.create({ title: "Erro", description: error.message, type: "error" })
    else {
      toaster.create({ title: "Foto removida", type: "success" })
      await loadData()
    }
  }

  async function toggleActive(photo: GalleryPhoto) {
    const { error } = await supabase
      .from("gallery_photos")
      .update({ is_active: !photo.is_active })
      .eq("id", photo.id)
    if (error) toaster.create({ title: "Erro", description: error.message, type: "error" })
    else await loadData()
  }

  function startEdit(item: LandingContent) {
    setEditingKey(item.key)
    setEditingValue(JSON.stringify(item.value, null, 2))
  }

  async function saveContent() {
    if (!editingKey) return
    try {
      const parsed = JSON.parse(editingValue)
      const { error } = await supabase
        .from("landing_content")
        .update({ value: parsed, updated_at: new Date().toISOString() })
        .eq("key", editingKey)
      if (error) toaster.create({ title: "Erro", description: error.message, type: "error" })
      else {
        toaster.create({ title: "Conteúdo salvo!", type: "success" })
        setEditingKey(null)
        await loadData()
      }
    } catch {
      toaster.create({ title: "JSON inválido", description: "Verifique o formato do conteúdo.", type: "error" })
    }
  }

  const tabs = [
    { id: "gallery" as const, label: "Galeria", icon: LuImage },
    { id: "content" as const, label: "Conteúdo", icon: LuFileText },
  ]

  return (
    <Box>
      <VStack gap="2" mb="8" align="start">
        <HStack gap="2">
          <Box p="2" rounded="lg" bg="rgba(245,158,11,0.1)" borderWidth="1px" borderColor="rgba(245,158,11,0.3)">
            <Icon as={LuLayoutPanelTop} color="gold.400" fontSize="lg" />
          </Box>
          <Heading size="xl" fontWeight="black" color="white">Landing Page</Heading>
        </HStack>
        <Text color="gray.400" fontSize="sm">Gerencie fotos da galeria e textos da página inicial</Text>
      </VStack>

      {/* Tabs */}
      <Flex gap="2" mb="6">
        {tabs.map((t) => {
          const active = tab === t.id
          return (
            <Box
              key={t.id}
              as="button"
              px="4" py="2.5" rounded="xl"
              cursor="pointer" transition="all 0.2s"
              bg={active ? "rgba(139,47,201,0.2)" : "rgba(26,0,48,0.6)"}
              borderWidth="1px"
              borderColor={active ? "rgba(139,47,201,0.4)" : "rgba(139,47,201,0.15)"}
              _hover={{ borderColor: "rgba(139,47,201,0.3)" }}
              onClick={() => setTab(t.id)}
            >
              <Flex align="center" gap="2">
                <Icon as={t.icon} color={active ? "gold.400" : "purple.300"} fontSize="md" />
                <Text fontSize="sm" fontWeight={active ? "semibold" : "medium"} color={active ? "white" : "gray.400"}>
                  {t.label}
                </Text>
              </Flex>
            </Box>
          )
        })}
      </Flex>

      {loading ? (
        <Text color="gray.500" fontSize="sm">Carregando...</Text>
      ) : tab === "gallery" ? (
        <VStack gap="6" align="stretch">
          {/* Add photo */}
          <Box p="5" rounded="2xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
            <Text fontWeight="bold" color="white" fontSize="md" mb="4">Adicionar Foto</Text>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap="4" mb="4">
              <Field label="URL da foto" required>
                <Input
                  placeholder="https://..."
                  value={galleryForm.url}
                  onChange={(e) => setGalleryForm({ ...galleryForm, url: e.target.value })}
                  bg="rgba(139,47,201,0.1)"
                  borderColor="rgba(139,47,201,0.3)"
                  color="white"
                  _placeholder={{ color: "gray.500" }}
                />
              </Field>
              <Field label="Legenda">
                <Input
                  placeholder="Legenda da foto"
                  value={galleryForm.caption}
                  onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                  bg="rgba(139,47,201,0.1)"
                  borderColor="rgba(139,47,201,0.3)"
                  color="white"
                  _placeholder={{ color: "gray.500" }}
                />
              </Field>
              <Field label="Consentido por">
                <Input
                  placeholder="Nome de quem autorizou"
                  value={galleryForm.consent_by}
                  onChange={(e) => setGalleryForm({ ...galleryForm, consent_by: e.target.value })}
                  bg="rgba(139,47,201,0.1)"
                  borderColor="rgba(139,47,201,0.3)"
                  color="white"
                  _placeholder={{ color: "gray.500" }}
                />
              </Field>
            </Grid>
            <Button
              loading={addingPhoto}
              fontWeight="semibold"
              variant="outline"
              borderColor="rgba(139,47,201,0.4)"
              color="purple.300"
              _hover={{ bg: "rgba(139,47,201,0.1)" }}
              onClick={addPhoto}
            >
              <Icon as={LuPlus} mr="2" /> Adicionar
            </Button>
          </Box>

          {/* Gallery list */}
          <Box p="5" rounded="2xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
            <Text fontWeight="bold" color="white" fontSize="md" mb="4">Fotos da Galeria ({gallery.length})</Text>
            {gallery.length === 0 ? (
              <Text color="gray.500" fontSize="sm">Nenhuma foto cadastrada</Text>
            ) : (
              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }} gap="4">
                {gallery.map((photo) => (
                  <Box
                    key={photo.id}
                    rounded="xl" overflow="hidden"
                    bg="rgba(139,47,201,0.05)"
                    borderWidth="1px"
                    borderColor="rgba(139,47,201,0.1)"
                  >
                    <Box aspectRatio="1" overflow="hidden" opacity={photo.is_active ? 1 : 0.4}>
                      <Box w="full" h="full" bg="rgba(139,47,201,0.2)" display="flex" alignItems="center" justifyContent="center">
                        <Icon as={LuImage} color="purple.300" fontSize="2xl" />
                      </Box>
                    </Box>
                    <Box p="3">
                      <Text fontSize="xs" color="white" truncate>{photo.caption || "Sem legenda"}</Text>
                      <HStack gap="2" mt="2">
                        <Button
                          size="2xs" variant="ghost"
                          color={photo.is_active ? "green.400" : "gray.500"}
                          _hover={{ bg: "rgba(139,47,201,0.1)" }}
                          onClick={() => toggleActive(photo)}
                        >
                          {photo.is_active ? "Ativa" : "Inativa"}
                        </Button>
                        <Button
                          size="2xs" variant="ghost"
                          color="red.400"
                          _hover={{ bg: "rgba(239,68,68,0.1)" }}
                          onClick={() => removePhoto(photo.id)}
                        >
                          <Icon as={LuTrash2} />
                        </Button>
                      </HStack>
                    </Box>
                  </Box>
                ))}
              </Grid>
            )}
          </Box>
        </VStack>
      ) : (
        /* Content tab */
        <Box p="5" rounded="2xl" bg="rgba(26,0,48,0.8)" borderWidth="1px" borderColor="rgba(139,47,201,0.2)">
          <Text fontWeight="bold" color="white" fontSize="md" mb="4">Conteúdo da Landing Page</Text>
          {content.length === 0 ? (
            <Text color="gray.500" fontSize="sm">Nenhum conteúdo cadastrado</Text>
          ) : (
            <VStack gap="4" align="stretch">
              {content.map((item) => (
                <Box
                  key={item.key}
                  p="4" rounded="xl"
                  bg="rgba(139,47,201,0.05)"
                  borderWidth="1px"
                  borderColor="rgba(139,47,201,0.1)"
                >
                  <Flex justify="space-between" align="center" mb="2">
                    <Text fontSize="sm" fontWeight="semibold" color="gold.400" fontFamily="mono">{item.key}</Text>
                    {editingKey === item.key ? (
                      <HStack gap="2">
                        <Button size="xs" colorPalette="green" variant="solid" onClick={saveContent}>
                          <Icon as={LuSave} mr="1" /> Salvar
                        </Button>
                        <Button size="xs" variant="ghost" color="gray.400" onClick={() => setEditingKey(null)}>
                          Cancelar
                        </Button>
                      </HStack>
                    ) : (
                      <Button
                        size="xs" variant="ghost"
                        color="purple.300"
                        _hover={{ bg: "rgba(139,47,201,0.1)" }}
                        onClick={() => startEdit(item)}
                      >
                        <Icon as={LuPencil} mr="1" /> Editar
                      </Button>
                    )}
                  </Flex>
                  {editingKey === item.key ? (
                    <Textarea
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      rows={10}
                      fontFamily="mono"
                      fontSize="sm"
                      bg="rgba(139,47,201,0.1)"
                      borderColor="rgba(139,47,201,0.3)"
                      color="white"
                    />
                  ) : (
                    <Box
                      p="3" rounded="lg"
                      bg="rgba(13,1,24,0.5)"
                      fontFamily="mono"
                      fontSize="xs"
                      color="gray.400"
                      whiteSpace="pre-wrap"
                      overflowX="auto"
                      maxH="200px"
                    >
                      {JSON.stringify(item.value, null, 2)}
                    </Box>
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  )
}
