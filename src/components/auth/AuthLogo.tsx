export function AuthLogo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-16 h-16 rounded-3xl flex items-center justify-center flex-shrink-0 relative overflow-hidden bg-featured-song-gradient"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="M22 8v10.5a3.5 3.5 0 1 1-2-3.18V10.5l-8 2V22.5a3.5 3.5 0 1 1-2-3.18V9l12-3V8z"
            fill="white"
          />
        </svg>
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-harmonic-text tracking-tight">Harmoniq</h1>
        <p className="text-harmonic-muted text-sm mt-1 font-medium">
          Built for worship teams. Not spreadsheets.
        </p>
      </div>
    </div>
  )
}
