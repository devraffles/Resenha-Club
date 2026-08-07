import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./lib/auth"
import { Toaster } from "./components/ui/toaster"
import { RequireAuth, RequireAdmin, RequirePasswordChange } from "./components/guards/RequireAuth"
import { MemberLayout } from "./components/layout/MemberLayout"
import { AdminLayout } from "./components/layout/AdminLayout"
import { LandingPage } from "./pages/public/LandingPage"
import { PrivacyPolicyPage } from "./pages/public/PrivacyPolicyPage"
import { LoginPage } from "./pages/public/LoginPage"
import { ResetPasswordPage } from "./pages/public/ResetPasswordPage"
import { MemberHomePage } from "./pages/app/MemberHomePage"
import { RankingPage } from "./pages/app/RankingPage"
import { GtoPage } from "./pages/app/GtoPage"
import { MemberFormsPage } from "./pages/app/MemberFormsPage"
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { AdminFormsPage } from "./pages/admin/AdminFormsPage"
import { AdminUsersPage } from "./pages/admin/AdminUsersPage"
import { AdminRankingPage } from "./pages/admin/AdminRankingPage"
import { AdminLandingPage } from "./pages/admin/AdminLandingPage"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
          <Route path="/primeiro-acesso" element={<ResetPasswordPage />} />

          {/* Member routes (auth required, password change enforced) */}
          <Route element={<RequireAuth />}>
            <Route element={<RequirePasswordChange />}>
              <Route element={<MemberLayout />}>
                <Route path="/app" element={<MemberHomePage />} />
                <Route path="/app/ranking" element={<RankingPage />} />
                <Route path="/app/gto" element={<GtoPage />} />
                <Route path="/app/formularios" element={<MemberFormsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Admin routes (admin role required) */}
          <Route element={<RequireAuth />}>
            <Route element={<RequireAdmin />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/formularios" element={<AdminFormsPage />} />
                <Route path="/admin/usuarios" element={<AdminUsersPage />} />
                <Route path="/admin/ranking" element={<AdminRankingPage />} />
                <Route path="/admin/landing" element={<AdminLandingPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  )
}
