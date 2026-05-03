import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ShieldCheck, Zap, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button, Input, Checkbox } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const success = await login(formData.email, formData.password)

    setIsLoading(false)
    
    if (success) {
      navigate('/ruta')
    } else {
      setError('Credenciales incorrectas. Por favor verifica tu correo y contrasena.')
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant/30">
        <div className="max-w-container mx-auto px-lg">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-lg hover:bg-surface-container-high transition-colors"
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

      {/* Main content */}
      <main className="max-w-container mx-auto px-lg py-xl">
        <div className="grid lg:grid-cols-2 gap-xl items-start">
          {/* Left side - Hero */}
          <div className="relative rounded-2xl overflow-hidden bg-primary min-h-[500px] hidden lg:block">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{
                backgroundImage:
                  'url(https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/50" />

            <div className="relative z-10 p-xl flex flex-col h-full justify-end">
              <h2 className="text-h1 text-white mb-4">Bienvenido de nuevo.</h2>
              <p className="text-body-lg text-white/80 mb-8">
                Continua tu camino hacia la certificacion en manipulacion segura
                de alimentos.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-success" />
                  </div>
                  <span>Retoma donde lo dejaste.</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-secondary" />
                  </div>
                  <span>Acceso instantaneo a tus lecciones.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="lg:pl-xl">
            <h1 className="text-h2 text-foreground mb-2">Iniciar Sesion</h1>
            <p className="text-body-md text-foreground-muted mb-8">
              Ingresa tus credenciales para acceder a tu cuenta.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/30">
                <p className="text-body-sm text-error">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Correo electronico"
                type="email"
                placeholder="usuario@email.com"
                icon={<Mail className="w-5 h-5" />}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              <Input
                label="Contrasena"
                type="password"
                placeholder="********"
                icon={<Lock className="w-5 h-5" />}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />

              <div className="flex items-center justify-between">
                <Checkbox
                  label="Recordar mi sesion"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({ ...formData, rememberMe: e.target.checked })
                  }
                />
                <a
                  href="#"
                  className="text-body-sm text-primary font-semibold hover:underline"
                >
                  Olvidaste tu contrasena?
                </a>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full justify-between group"
                isLoading={isLoading}
              >
                <span>Ingresar</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="text-center text-body-sm text-foreground-muted">
                No tienes una cuenta?{' '}
                <Link
                  to="/registro"
                  className="text-primary font-semibold hover:underline"
                >
                  Registrate aqui
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
