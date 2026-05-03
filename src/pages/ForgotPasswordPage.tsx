import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { FirebaseError } from 'firebase/app'
import { sendPasswordResetEmail } from 'firebase/auth'
import { Button, Input } from '@/components/ui'
import { auth } from '@/firebase/config'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [autofillShield, setAutofillShield] = useState(true)

  useEffect(() => {
    setAutofillShield(true)
    setEmail('')
    setError(null)
    setSent(false)
    const unlock = window.setTimeout(() => setAutofillShield(false), 250)
    return () => window.clearTimeout(unlock)
  }, [location.pathname, location.key])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
    } catch (firebaseError) {
      if (firebaseError instanceof FirebaseError) {
        const messages: Record<string, string> = {
          'auth/user-not-found': 'No existe una cuenta con ese correo.',
          'auth/invalid-email': 'Correo invalido.',
          'auth/network-request-failed': 'Sin conexion. Revisa tu internet.',
        }
        setError(messages[firebaseError.code] ?? 'No se pudo enviar el correo.')
      } else {
        setError('No se pudo enviar el correo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-outline-variant/30">
        <div className="max-w-container mx-auto px-lg">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-lg hover:bg-surface-container-high transition-colors"
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <Link to="/" className="text-h3 font-bold text-primary">
                Nexu
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-container mx-auto px-lg py-xl">
        <div className="max-w-lg mx-auto rounded-2xl border border-outline-variant/30 bg-white p-8">
          <h1 className="text-h2 text-foreground mb-2">Recuperar contrasena</h1>
          <p className="text-body-md text-foreground-muted mb-8">
            Te enviaremos un enlace para restablecer tu contrasena.
          </p>

          {!sent ? (
            <form
              autoComplete="off"
              onSubmit={handleSubmit}
              className="space-y-6"
              key={`forgot-${location.key}`}
            >
              <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
                <input
                  type="text"
                  title="omitir"
                  placeholder="omitir"
                  autoComplete="username"
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>
              <Input
                label="Correo electronico"
                type="email"
                name="nexu-forgot-email"
                autoComplete="off"
                placeholder="usuario@email.com"
                icon={<Mail className="w-5 h-5" />}
                value={email}
                readOnly={autofillShield}
                onFocus={() => setAutofillShield(false)}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && (
                <div className="p-4 rounded-lg bg-error/10 border border-error/30">
                  <p className="text-body-sm text-error">{error}</p>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                Enviar enlace de recuperacion
              </Button>

              <p className="text-center text-body-sm text-foreground-muted">
                Recordaste tu contrasena?{' '}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Inicia sesion
                </Link>
              </p>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-body-md text-foreground">
                Enviamos el enlace de recuperacion a <span className="font-semibold">{email}</span>.
              </p>
              <Button type="button" size="lg" className="w-full" onClick={() => navigate('/login')}>
                Volver a login
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
