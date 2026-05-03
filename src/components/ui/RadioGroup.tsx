import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface RadioOption {
  value: string
  label: string
}

export interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  options: RadioOption[]
  selectedValue?: string
  onValueChange?: (value: string) => void
  variant?: 'default' | 'card'
  isCorrect?: boolean
  showFeedback?: boolean
}

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ className, options, selectedValue, onValueChange, variant = 'default', name, isCorrect, showFeedback }, _ref) => {
    const radioName = name || `radio-${Math.random().toString(36).substr(2, 9)}`

    if (variant === 'card') {
      return (
        <div className={cn('flex flex-col gap-3', className)}>
          {options.map((option) => {
            const isSelected = selectedValue === option.value
            const showCorrectFeedback = showFeedback && isSelected && isCorrect

            return (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
                  isSelected
                    ? showCorrectFeedback
                      ? 'border-primary bg-primary/5'
                      : 'border-primary bg-primary/5'
                    : 'border-outline-variant hover:border-primary/50'
                )}
              >
                <div className="relative flex-shrink-0">
                  <input
                    type="radio"
                    name={radioName}
                    value={option.value}
                    checked={isSelected}
                    onChange={(e) => onValueChange?.(e.target.value)}
                    className="peer sr-only"
                  />
                  <div className={cn(
                    'w-6 h-6 rounded-full border-2 transition-colors duration-200',
                    isSelected ? 'border-primary bg-primary' : 'border-outline-variant'
                  )} />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
                <span className={cn(
                  'text-body-md flex-1',
                  isSelected ? 'text-primary font-medium' : 'text-foreground'
                )}>
                  {option.label}
                </span>
                {showCorrectFeedback && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </label>
            )
          })}
        </div>
      )
    }

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex-shrink-0">
              <input
                type="radio"
                name={radioName}
                value={option.value}
                checked={selectedValue === option.value}
                onChange={(e) => onValueChange?.(e.target.value)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 rounded-full border-2 border-outline-variant transition-colors duration-200 peer-checked:border-primary peer-focus:ring-2 peer-focus:ring-primary/20 group-hover:border-primary" />
              <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform duration-200" />
            </div>
            <span className="text-body-sm text-foreground select-none">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'
