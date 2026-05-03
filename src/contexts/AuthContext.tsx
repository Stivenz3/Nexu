import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
}

interface RegisterData {
  fullName: string
  documentType: string
  documentNumber: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextType | null>(null)

const AUTH_STORAGE_KEY = 'nexu_auth_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would call an API
    // For now, we check if user exists in localStorage from registration
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
    
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      if (userData.email === email) {
        setUser(userData)
        return true
      }
    }
    
    // If no user found, return false
    return false
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    // In a real app, this would call an API
    const newUser: User = {
      id: `NX-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      fullName: userData.fullName,
      email: userData.email,
      documentType: userData.documentType,
      documentNumber: userData.documentNumber,
      progress: {
        completedLessons: [],
        currentLesson: '1',
        overallPercentage: 0,
      },
      createdAt: new Date(),
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
    setUser(newUser)
    return true
  }

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
