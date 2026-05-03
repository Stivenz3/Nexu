import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, ClipboardCheck, Award, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/ruta', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Learning Path', href: '/ruta', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Assessments', href: '/evaluacion', icon: <ClipboardCheck className="w-5 h-5" /> },
  { label: 'Certificates', href: '/certificado', icon: <Award className="w-5 h-5" /> },
  { label: 'Settings', href: '#', icon: <Settings className="w-5 h-5" /> },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-60 bg-white border-r border-outline-variant/30 min-h-screen flex flex-col">
      <div className="p-lg">
        <h2 className="text-body-md font-semibold text-primary">Nexu Learning</h2>
        <p className="text-body-sm text-foreground-muted">Food Safety Tier 1</p>
      </div>

      <nav className="flex-1 px-md">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                    isActive
                      ? 'text-primary bg-primary/5 border-r-2 border-primary'
                      : 'text-foreground-muted hover:bg-surface-container-high hover:text-foreground'
                  )}
                >
                  {item.icon}
                  <span className="text-body-md font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
