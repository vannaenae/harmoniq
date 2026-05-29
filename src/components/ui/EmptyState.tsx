import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg, #18005F 0%, #560056 100%)' }}
          aria-hidden="true"
        >
          <Icon size={24} className="text-white" />
        </div>
      )}
      <h2 className="text-lg font-semibold text-harmonic-text">{title}</h2>
      {description && (
        <p className="text-sm text-harmonic-muted mt-1.5 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
