import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  value: number
  max?: number
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'secondary',
  size = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const variantStyles = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
  }

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-body-sm text-foreground-muted">Progreso</span>
          <span className="text-body-sm font-semibold text-foreground">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-surface-container-high rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', variantStyles[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
