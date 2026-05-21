import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  GraduationCap,
  ClipboardCheck,
  Award,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'nexu-sidebar-collapsed'
const WIDTH_EXPANDED = '15rem'
const WIDTH_COLLAPSED = '4.5rem'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  isActive: (pathname: string) => boolean
}

const navItems: NavItem[] = [
  {
    label: 'Ruta',
    href: '/ruta',
    icon: <GraduationCap className="w-5 h-5 shrink-0" />,
    isActive: (p) =>
      p === '/ruta' || (p.startsWith('/leccion/') && !p.endsWith('/evaluacion')),
  },
  {
    label: 'Evaluación',
    href: '/leccion/lesson_01_higiene_personal/evaluacion',
    icon: <ClipboardCheck className="w-5 h-5 shrink-0" />,
    isActive: (p) => p.includes('/evaluacion'),
  },
  {
    label: 'Certificados',
    href: '/certificado',
    icon: <Award className="w-5 h-5 shrink-0" />,
    isActive: (p) => p.startsWith('/certificado'),
  },
]

function NavLink({
  item,
  collapsed,
}: {
  item: NavItem
  collapsed: boolean
}) {
  const location = useLocation()
  const active = item.isActive(location.pathname)

  return (
    <li>
      <Link
        to={item.href}
        title={collapsed ? item.label : undefined}
        className={cn(
          'group relative flex items-center rounded-lg transition-colors duration-200',
          collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
          active
            ? 'text-primary bg-primary/5'
            : 'text-foreground-muted hover:bg-surface-container-high hover:text-foreground'
        )}
      >
        {item.icon}
        {!collapsed && (
          <span className="text-body-md font-medium truncate">{item.label}</span>
        )}
        {collapsed && (
          <span
            role="tooltip"
            className={cn(
              'pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2',
              'whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-body-sm text-white shadow-lg',
              'opacity-0 transition-opacity duration-150 group-hover:opacity-100'
            )}
          >
            {item.label}
          </span>
        )}
        {active && !collapsed && (
          <span className="absolute right-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
        )}
      </Link>
    </li>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') setCollapsed(true)
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED
    )
  }, [collapsed])

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] flex-col overflow-hidden',
        'border-r border-outline-variant/30 bg-white transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-[4.5rem]' : 'w-60'
      )}
    >
      <div
        className={cn(
          'flex shrink-0 items-center gap-2 border-b border-outline-variant/30',
          collapsed ? 'justify-center px-2 py-3' : 'justify-between px-3 py-3'
        )}
      >
        {collapsed ? (
          <span className="text-lg font-bold text-primary" title="Nexu">
            N
          </span>
        ) : (
          <div className="min-w-0 flex-1">
            <h2 className="text-body-md font-bold leading-tight text-primary">Nexu</h2>
            <p className="text-body-sm leading-tight text-foreground-muted">
              Certificación BPM
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? 'Expandir menú' : 'Recoger menú'}
          title={collapsed ? 'Expandir menú' : 'Recoger menú'}
          className="shrink-0 rounded-lg p-2 text-foreground-muted transition-colors hover:bg-surface-container-high hover:text-foreground"
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className={cn('shrink-0 overflow-hidden', collapsed ? 'px-2' : 'px-md pb-4')}>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.label} item={item} collapsed={collapsed} />
          ))}
        </ul>
      </nav>
    </aside>
  )
}
