import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import type { DocumentType, User } from '@/types'
import { auth, db } from '@/firebase/config'

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

const isDocumentType = (value: string): value is DocumentType => {
  return value === 'cc' || value === 'ce' || value === 'passport'
}

const normalizeDocumentType = (value?: string): DocumentType => {
  if (!value) return 'cc'
  const normalized = value.toLowerCase()
  if (isDocumentType(normalized)) return normalized
  return 'cc'
}

function mapFirebaseUser(firebaseUser: FirebaseUser, profile?: Partial<User>): User {
  return {
    id: firebaseUser.uid,
    fullName: profile?.fullName ?? firebaseUser.displayName ?? '',
    email: firebaseUser.email ?? profile?.email ?? '',
    documentType: normalizeDocumentType(profile?.documentType),
    documentNumber: profile?.documentNumber ?? '',
    createdAt: profile?.createdAt ?? new Date(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setIsLoading(false)
        return
      }

      // Sesión válida antes de Firestore para que las rutas protegidas no redirijan con user=null.
      setUser(mapFirebaseUser(firebaseUser))
      setIsLoading(false)

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        const profileData = userDoc.exists() ? (userDoc.data() as Partial<User>) : undefined
        setUser(mapFirebaseUser(firebaseUser, profileData))
      } catch {
        setUser(mapFirebaseUser(firebaseUser))
      }
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch {
      return false
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const credentials = await createUserWithEmailAndPassword(auth, userData.email, userData.password)
      await updateProfile(credentials.user, { displayName: userData.fullName })

      await setDoc(doc(db, 'users', credentials.user.uid), {
        fullName: userData.fullName,
        email: userData.email,
        documentType: normalizeDocumentType(userData.documentType),
        documentNumber: userData.documentNumber,
        createdAt: serverTimestamp(),
      })

      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    void signOut(auth)
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
