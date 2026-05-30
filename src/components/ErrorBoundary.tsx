import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/** Catches render-time errors anywhere below it so a single failing component
 *  shows a recoverable message instead of unmounting the whole app (a blank
 *  white screen). */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('Render error caught by ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-harmonic-background flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <h1 className="text-lg font-bold text-harmonic-text">Something went wrong</h1>
            <p className="text-sm text-harmonic-muted mt-2">
              This page hit an unexpected error. Try reloading — if it keeps happening, let us know.
            </p>
            <pre className="mt-4 text-left text-xs text-harmonic-danger bg-harmonic-surface rounded-xl p-3 overflow-auto max-h-40">
              {this.state.error.message}
            </pre>
            <button
              onClick={() => { this.setState({ error: null }); window.location.reload() }}
              className="mt-5 inline-flex items-center justify-center rounded-pill bg-harmonic-primary text-white px-5 py-2.5 text-sm font-medium min-h-[44px]"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
