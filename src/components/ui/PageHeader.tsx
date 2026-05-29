import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Show a back button */
  back?: boolean | string
  /** Right-aligned actions (buttons etc.) */
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, back, actions }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-2 min-w-0">
        {back && (
          <button
            onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
            aria-label="Go back"
            className="p-1.5 -ml-1.5 mt-0.5 rounded-full hover:bg-harmonic-surface transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center flex-shrink-0"
          >
            <ChevronLeft size={20} className="text-harmonic-text" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-harmonic-text truncate">{title}</h1>
          {subtitle && <p className="text-sm text-harmonic-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  )
}
