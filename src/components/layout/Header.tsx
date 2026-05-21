import { Link, useNavigate } from 'react-router-dom'
import { User, ArrowLeft, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export interface HeaderProps {
  showBack?: boolean
  onBack?: () => void
  title?: string
  className?: string
}

export function Header({ showBack, onBack, title, className }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className={cn('bg-white border-b border-outline-variant/30 sticky top-0 z-50', className)}>
      <div className="max-w-container mx-auto px-lg">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {showBack && (
              <button 
                onClick={onBack} 
                className="p-2 -ml-2 rounded-lg hover:bg-surface-container-high transition-colors"
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
            )}
            <Link
              to="/ruta"
              className="flex items-center gap-3 rounded-lg transition-opacity hover:opacity-90"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
                <span className="text-xl font-bold text-white">N</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                Nexu
              </span>
            </Link>
            {title && (
              <>
                <span className="text-outline-variant">|</span>
                <span className="text-body-md text-foreground-muted">{title}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-outline-variant/30">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-body-sm font-medium text-foreground hidden sm:block">
                  {user.fullName?.split(' ')[0]}
                </span>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-foreground-muted hover:text-error"
                  aria-label="Cerrar sesion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
