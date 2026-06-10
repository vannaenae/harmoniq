import * as RadixSelect from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@harmoniq/shared'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value?: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  label?: string
  ariaLabel?: string
  className?: string
}

// Radix's <Select.Item /> throws if given an empty-string value (it reserves
// "" to clear the selection). Callers use "" to mean "All / none", so map it
// to a sentinel internally and translate back at the boundary.
const EMPTY = '__select_empty__'
const toRadix = (v: string) => (v === '' ? EMPTY : v)
const fromRadix = (v: string) => (v === EMPTY ? '' : v)

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  label,
  ariaLabel,
  className,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-harmonic-text">{label}</span>}
      <RadixSelect.Root
        value={value === undefined ? undefined : toRadix(value)}
        onValueChange={v => onValueChange(fromRadix(v))}
      >
        <RadixSelect.Trigger
          aria-label={ariaLabel ?? label ?? placeholder}
          className={cn(
            'inline-flex items-center justify-between gap-2 bg-harmonic-surface rounded-pill',
            'px-4 py-2.5 text-sm min-h-[44px] outline-none border border-transparent',
            'focus:border-harmonic-primary transition-colors data-[placeholder]:text-harmonic-muted',
            className,
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown size={16} className="text-harmonic-muted" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={6}
            className="z-50 bg-white rounded-card shadow-card-hover border border-harmonic-border overflow-hidden min-w-[var(--radix-select-trigger-width)]"
          >
            <RadixSelect.Viewport className="p-1">
              {options.map(opt => (
                <RadixSelect.Item
                  key={opt.value}
                  value={toRadix(opt.value)}
                  className="relative flex items-center px-8 py-2 text-sm rounded-lg cursor-pointer
                             text-harmonic-text outline-none data-[highlighted]:bg-harmonic-surface
                             data-[state=checked]:font-medium select-none"
                >
                  <RadixSelect.ItemIndicator className="absolute left-2 inline-flex items-center">
                    <Check size={14} className="text-harmonic-primary" />
                  </RadixSelect.ItemIndicator>
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  )
}
