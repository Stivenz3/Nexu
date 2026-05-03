import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { User, CreditCard, Mail, Lock, ShieldCheck, Zap, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button, Input, Select, Checkbox } from '@/components/ui'
import { FirebaseError } from 'firebase/app'
import { createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'

const documentTypes = [
  { value: 'cc', label: 'Cedula de Ciudadania' },
  { value: 'ce', label: 'Cedula de Extranjeria' },
  { value: 'passport', label: 'Pasaporte' },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autofillShield, setAutofillShield] = useState(true)
  const [formData, setFormData] = useState({
    fullName: '',
    documentType: 'cc',
    documentNumber: '',
    email: '',
    password: '',
    acceptTerms: false,
  })

  useEffect(() => {
    setAutofillShield(true)
    setFormData({
      fullName: '',
      documentType: 'cc',
      documentNumber: '',
      email: '',
      password: '',
      acceptTerms: false,
    })
    setError(null)
    const unlock = window.setTimeout(() => setAutofillShield(false), 250)
    return () => window.clearTimeout(unlock)
  }, [location.pathname, location.key])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const credentials = await createUserWithEmailAndPassword(auth, formData.email, formData.password)

      // Si falla el perfil/Firestore, no rompemos el registro ya creado en Auth.
      try {
        await updateProfile(credentials.user, { displayName: formData.fullName })
        await setDoc(doc(db, 'users', credentials.user.uid), {
          fullName: formData.fullName,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          email: formData.email,
          createdAt: serverTimestamp(),
        })
      } catch (profileError) {
        console.warn('Cuenta creada pero no se pudo guardar el perfil en Firestore:', profileError)
      }

      await signOut(auth)
      setIsLoading(false)
      navigate('/login', { state: { registered: true } })
    } catch (firebaseError) {
      setIsLoading(false)
      if (firebaseError instanceof FirebaseError) {
        const messages: Record<string, string> = {
          'auth/email-already-in-use': 'Este correo ya esta registrado.',
          'auth/invalid-email': 'El correo no es valido.',
          'auth/weak-password': 'La contrasena debe tener al menos 6 caracteres.',
          'auth/network-request-failed': 'Sin conexion. Revisa tu internet.',
        }
        setError(messages[firebaseError.code] ?? 'No se pudo crear la cuenta.')
        return
      }
      setError('No se pudo crear la cuenta.')
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
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <Link to="/" className="text-h3 font-bold text-primary">Nexu</Link>
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
                backgroundImage: 'url(https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/50" />
            
            <div className="relative z-10 p-xl flex flex-col h-full justify-end">
              <h2 className="text-h1 text-white mb-4">
                Comienza tu certificacion hoy.
              </h2>
              <p className="text-body-lg text-white/80 mb-8">
                Unete a miles de profesionales que confian en Nexu para su formacion oficial en manipulacion de alimentos.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-success" />
                  </div>
                  <span>Certificados avalados por entes reguladores.</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-secondary" />
                  </div>
                  <span>Formacion rapida y 100% digital.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="lg:pl-xl">
            <h1 className="text-h2 text-foreground mb-2">Registro de Manipulador</h1>
            <p className="text-body-md text-foreground-muted mb-8">
              Completa tus datos para crear tu perfil profesional.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/30">
                <p className="text-body-sm text-error">{error}</p>
              </div>
            )}

            <form
              autoComplete="off"
              onSubmit={handleSubmit}
              className="space-y-6"
              key={`register-${location.key}`}
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
                <input
                  type="password"
                  title="omitir"
                  placeholder="omitir"
                  autoComplete="current-password"
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>
              <Input
                label="Nombre completo"
                name="nexu-reg-full-name"
                autoComplete="off"
                placeholder="Ej. Juan Perez"
                icon={<User className="w-5 h-5" />}
                value={formData.fullName}
                readOnly={autofillShield}
                onFocus={() => setAutofillShield(false)}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Select
                  label="Tipo de documento"
                  options={documentTypes}
                  icon={<CreditCard className="w-5 h-5" />}
                  value={formData.documentType}
                  autoComplete="off"
                  name="nexu-reg-doc-type"
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                />
                <Input
                  label="Numero de documento"
                  placeholder="123456789"
                  name="nexu-reg-doc-number"
                  autoComplete="off"
                  value={formData.documentNumber}
                  readOnly={autofillShield}
                  onFocus={() => setAutofillShield(false)}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Correo electronico"
                type="email"
                name="nexu-reg-email"
                autoComplete="off"
                placeholder="usuario@email.com"
                icon={<Mail className="w-5 h-5" />}
                value={formData.email}
                readOnly={autofillShield}
                onFocus={() => setAutofillShield(false)}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Input
                label="Contrasena"
                type="password"
                name="nexu-reg-password"
                autoComplete="new-password"
                placeholder="********"
                icon={<Lock className="w-5 h-5" />}
                value={formData.password}
                readOnly={autofillShield}
                onFocus={() => setAutofillShield(false)}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />

              <Checkbox
                label={
                  <span>
                    Acepto el tratamiento de mis datos personales de acuerdo con la{' '}
                    <a href="#" className="text-primary hover:underline">Ley 1581 de 2012</a>
                    {' '}y la politica de privacidad de Nexu.
                  </span>
                }
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              />

              <Button 
                type="submit" 
                size="lg" 
                className="w-full justify-between group"
                isLoading={isLoading}
                disabled={!formData.acceptTerms}
              >
                <span>Crear mi cuenta</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="text-center text-body-sm text-foreground-muted">
                Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Inicia sesion
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
