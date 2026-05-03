import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-label-caps uppercase tracking-wider text-foreground-muted mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-3 rounded-lg border bg-white',
              'focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none',
              'placeholder:text-foreground-muted transition-colors duration-200',
              icon && 'pl-12',
              error ? 'border-error' : 'border-outline-variant',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-body-sm text-error">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
