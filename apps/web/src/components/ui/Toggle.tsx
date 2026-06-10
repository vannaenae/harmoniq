import { cn } from '@harmoniq/shared'

interface ToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  description?: string
  ariaLabel?: string
  id?: string
}

export function Toggle({ checked, onCheckedChange, label, description, ariaLabel, id }: ToggleProps) {
  const toggleId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <label htmlFor={toggleId} className="flex-1 cursor-pointer">
          {label && <span className="block text-sm font-medium text-harmonic-text">{label}</span>}
          {description && <span className="block text-xs text-harmonic-muted mt-0.5">{description}</span>}
        </label>
      )}
      <button
        type="button"
        role="switch"
        id={toggleId}
        aria-checked={checked}
        aria-label={ariaLabel ?? label}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 rounded-pill transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harmonic-primary focus-visible:ring-offset-2',
          checked ? 'bg-harmonic-primary' : 'bg-harmonic-border',
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform mt-0.5',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}
