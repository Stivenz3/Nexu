import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export interface ModalProps {
  children: React.ReactNode
  onClose: () => void
  className?: string
  panelClassName?: string
}

export function Modal({
  children,
  onClose,
  className = '',
  panelClassName = '',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 ${className}`}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className={`relative bg-white rounded-xl shadow-xl border border-outline-variant/30 w-full max-w-3xl max-h-[min(90vh,900px)] flex flex-col p-6 sm:p-8 ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-container-high transition-colors text-xl leading-none"
          aria-label="Cerrar"
        >
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}
