import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

/** Fallback solo desarrollo cuando no existe `.env` local. Producción debe usar siempre las variables Vercel (VITE_*). */
const devFallback: FirebaseOptions = {
  apiKey: 'AIzaSyDjFyLsiJzZSMHKTahuNNMKEnO4VnUKioY',
  authDomain: 'nexu-156ce.firebaseapp.com',
  projectId: 'nexu-156ce',
  storageBucket: 'nexu-156ce.firebasestorage.app',
  messagingSenderId: '661629916502',
  appId: '1:661629916502:web:0ed25d517141c6030c72f7',
}

function resolveFirebaseConfig(): FirebaseOptions {
  const fromEnv: FirebaseOptions = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
  }

  const allSet =
    !!fromEnv.apiKey &&
    !!fromEnv.authDomain &&
    !!fromEnv.projectId &&
    !!fromEnv.storageBucket &&
    !!fromEnv.messagingSenderId &&
    !!fromEnv.appId

  if (allSet) return fromEnv

  if (!import.meta.env.PROD) return devFallback

  console.error('[Firebase] Falta configurar las variables VITE_FIREBASE_* en Vercel (build).')
  throw new Error('Configuracion de Firebase incompleta. Define las variables de entorno en Vercel.')
}

const firebaseConfig = resolveFirebaseConfig()

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
