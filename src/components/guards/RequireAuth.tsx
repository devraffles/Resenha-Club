import { Navigate, Outlet } from "react-router-dom"
import { Box, Spinner } from "@chakra-ui/react"
import { useAuth } from "@/lib/auth"

export function RequireAuth() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <Box minH="100vh" bg="#0D0118" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="purple.500" />
      </Box>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return <Outlet />
}

export function RequireAdmin() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <Box minH="100vh" bg="#0D0118" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="purple.500" />
      </Box>
    )
  }

  if (profile?.role !== "admin") return <Navigate to="/app" replace />

  return <Outlet />
}

export function RequirePasswordChange() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <Box minH="100vh" bg="#0D0118" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="purple.500" />
      </Box>
    )
  }

  if (profile?.must_change_password) return <Navigate to="/primeiro-acesso" replace />

  return <Outlet />
}
