import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui'

export function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light flex flex-col">
      {/* Header */}
      <header className="p-lg">
        <div className="flex items-center gap-2 text-white/80">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-label-caps uppercase tracking-widest">Professional Standard</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-lg text-center">
        {/* Logo */}
        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <span className="text-4xl font-bold text-primary">N</span>
        </div>

        {/* Brand */}
        <h1 className="text-5xl font-bold text-white mb-4">Nexu</h1>
        
        {/* Tagline */}
        <p className="text-xl text-white/90 mb-6 max-w-md">
          Tu certificacion BPM, sin filas ni vueltas.
        </p>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-body-sm mb-16">
          <ShieldCheck className="w-4 h-4" />
          <span>Avalado por entes reguladores</span>
        </div>
      </main>

      {/* Bottom actions */}
      <footer className="bg-primary-dark/30 p-lg pb-8">
        <div className="max-w-md mx-auto space-y-4">
          <Link to="/registro" className="block">
            <Button variant="secondary" size="lg" className="w-full justify-between group">
              <span>Crear cuenta</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <Link to="/login" className="block">
            <Button variant="outline" size="lg" className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20">
              Ya tengo cuenta
            </Button>
          </Link>
          
          <p className="text-center text-white/60 text-body-sm pt-4">
            Al continuar, aceptas nuestros{' '}
            <a href="#" className="underline hover:text-white/80">Terminos de Servicio</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
