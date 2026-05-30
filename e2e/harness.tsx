import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Select } from '@/components/ui/Select'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import '../src/index.css'

// Mirrors the exact option shapes the Library / SetListBuilder / AddCustomSong
// pages pass — the empty-string ('' = "All / none") values that used to crash
// Radix's <Select.Item>.
const GENRES = ['Gospel', 'Contemporary', 'Hymn', 'Modern', 'Anthem', 'Other']

function Harness() {
  const [genre, setGenre] = useState('')      // starts as '' (All genres)
  const [lastChange, setLastChange] = useState<string>('<none>')

  return (
    <ErrorBoundary>
      <div style={{ padding: 24 }}>
        <h1>Select harness</h1>
        <div data-testid="genre-value">genre=[{genre}]</div>
        <div data-testid="last-change">change=[{lastChange}]</div>
        <Select
          ariaLabel="Filter by genre"
          value={genre}
          onValueChange={v => { setGenre(v); setLastChange(v === '' ? 'EMPTY' : v) }}
          options={[{ value: '', label: 'All genres' }, ...GENRES.map(g => ({ value: g, label: g }))]}
          placeholder="Genre"
        />
      </div>
    </ErrorBoundary>
  )
}

createRoot(document.getElementById('root')!).render(<Harness />)
