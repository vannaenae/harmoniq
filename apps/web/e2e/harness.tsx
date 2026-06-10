import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import '../src/index.css'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { SongLibraryDetail } from '@/pages/library/SongLibraryDetail'

// Import AuthContext and ChoirContext
import { AuthContext } from '@/contexts/AuthContext'
import { ChoirContext } from '@/contexts/ChoirContext'
// Import the mock context values
import { mockUseAuth, mockUseChoir } from './test-utils'

function AppHarness() {
  // Get the mocked context values
  const authContextValue = mockUseAuth()
  const choirContextValue = mockUseChoir()

  return (
    <AuthContext.Provider value={authContextValue}>
      <ChoirContext.Provider value={choirContextValue}>
        <HashRouter>
          <Routes>
            <Route path="/e2e/song-detail-harness/:songId" element={<SongLibraryDetail />} />
          </Routes>
        </HashRouter>
      </ChoirContext.Provider>
    </AuthContext.Provider>
  )
}

createRoot(document.getElementById('root')!).render(<AppHarness />)
