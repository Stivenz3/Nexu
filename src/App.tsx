import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { WelcomePage } from '@/pages/WelcomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { LearningPathPage } from '@/pages/LearningPathPage'
import { LessonFlowPage } from '@/pages/LessonFlowPage'
import { LessonExamPage } from '@/pages/LessonExamPage'
import { CertificatePage } from '@/pages/CertificatePage'
import { VerificationPage } from '@/pages/VerificationPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/ruta"
        element={
          <ProtectedRoute>
            <LearningPathPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leccion/:id"
        element={
          <ProtectedRoute>
            <LessonFlowPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leccion/:id/evaluacion"
        element={
          <ProtectedRoute>
            <LessonExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificado"
        element={
          <ProtectedRoute>
            <CertificatePage />
          </ProtectedRoute>
        }
      />
      <Route path="/verificar/:code" element={<VerificationPage />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
