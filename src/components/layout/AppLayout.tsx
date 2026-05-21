import { type ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

export interface AppLayoutProps {
  children: ReactNode
  showSidebar?: boolean
  headerTitle?: string
  showBack?: boolean
  onBack?: () => void
  className?: string
}

export function AppLayout({ 
  children, 
  showSidebar = true, 
  headerTitle,
  showBack,
  onBack,
  className 
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-surface">
      <Header showBack={showBack} onBack={onBack} title={headerTitle} />
      
      <div className="flex">
        {showSidebar && <Sidebar />}

        <main
          className={cn(
            'min-h-[calc(100vh-4rem)] flex-1 overflow-y-auto p-lg transition-[margin-left] duration-200 ease-in-out',
            showSidebar && 'ml-[var(--sidebar-width,15rem)]',
            className
          )}
        >
          <div className="max-w-container mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
