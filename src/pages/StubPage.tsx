import { AppLayout } from '@/components/layout/AppLayout'

interface StubPageProps {
  title: string
  description?: string
}

export function StubPage({ title, description }: StubPageProps) {
  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #18005F 0%, #560056 100%)' }}
            aria-hidden="true"
          >
            <span className="text-2xl text-white">♪</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-harmonic-text">{title}</h1>
            {description && (
              <p className="text-harmonic-muted text-sm mt-1 max-w-xs">{description}</p>
            )}
            <p className="text-xs text-harmonic-muted mt-4 font-medium uppercase tracking-widest">
              Coming in the next phase
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
