import { test, expect } from '@playwright/test'
import { generateMockSongs, setMockSongs } from './test-utils'
import { Song } from '@/types'

const mockSongs = generateMockSongs(20)

test.describe('SongLibraryDetail rendering', () => {
  let consoleErrors: string[] = []
  let pageErrors: string[] = []

  test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    // Mock Firebase global functions to prevent actual initialization
    // Define a global 'firebase' object if it doesn't exist
    // This assumes Firebase SDK is loaded globally, which might not be the case with module bundlers.
    // If Firebase is imported as modules, this needs further refinement.
    window.firebase = window.firebase || {};
    window.firebase.initializeApp = () => ({
      name: 'mock-app',
      options: {},
      auth: () => window.firebase.auth.getAuth(),
      firestore: () => window.firebase.firestore.getFirestore(),
      storage: () => window.firebase.storage.getStorage(),
      functions: () => window.firebase.functions.getFunctions(),
    });

    // Mock individual Firebase services
    window.firebase.auth = window.firebase.auth || {};
    window.firebase.auth.getAuth = () => ({
      currentUser: { uid: 'mock-user-id', email: 'mock@example.com', displayName: 'Mock User', photoURL: 'https://example.com/photo.jpg', emailVerified: true },
      onAuthStateChanged: (callback: (user: any) => void) => {
        // Immediately call with a mock user
        callback(window.firebase.auth.getAuth().currentUser);
        return () => {}; // Return an unsubscribe function
      },
      signInWithPopup: async () => ({ user: window.firebase.auth.getAuth().currentUser }),
      signInWithEmailAndPassword: async () => ({ user: window.firebase.auth.getAuth().currentUser }),
      createUserWithEmailAndPassword: async () => ({ user: window.firebase.auth.getAuth().currentUser }),
      sendPasswordResetEmail: async () => {},
      sendEmailVerification: async () => {},
      updateProfile: async () => {},
      signOut: async () => {},
    });
    window.firebase.GoogleAuthProvider = class MockGoogleAuthProvider {
      setCustomParameters() {}
      addScope() {}
    };

    window.firebase.firestore = window.firebase.firestore || {};
    window.firebase.firestore.getFirestore = () => ({
      doc: () => ({}),
      getDoc: async () => ({
        exists: () => true,
        data: () => ({
          // Mock data for HarmonicUser or Choir
          uid: 'mock-user-id',
          email: 'mock@example.com',
          displayName: 'Mock User',
          onboardingComplete: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          notificationPrefs: { serviceUpdates: true, availabilityReminders: true, announcements: true, system: true, reminderTiming: '24h' },
          id: 'mock-choir-id',
          name: 'Mock Choir',
          inviteCode: 'mock-invite',
          inviteExpiry: new Date(),
          ownerId: 'mock-user-id',
          memberCount: 1,
          licensing: { attested: true },
        }),
      }),
      setDoc: async () => {},
      collection: () => ({}),
      getDocs: async () => ({
        empty: false,
        docs: [
          {
            id: 'mock-member-id',
            data: () => ({
              uid: 'mock-member-id',
              displayName: 'Mock Member',
              email: 'member@example.com',
              role: 'member',
              voicePart: 'soprano',
              joinedAt: new Date(),
            }),
          },
        ],
      }),
      onSnapshot: () => () => {},
    });

    window.firebase.storage = window.firebase.storage || {};
    window.firebase.storage.getStorage = () => ({});

    window.firebase.functions = window.firebase.functions || {};
    window.firebase.functions.getFunctions = () => ({});
    
    // Clear local storage to ensure a clean state
    window.localStorage.clear();
  });
    consoleErrors = []
    pageErrors = []
    page.on('console', m => {
      if (m.type() === 'error') consoleErrors.push(m.text())
      console.log(`[Browser Console] ${m.text()}`) // Add this for debugging
    })
    page.on('pageerror', e => {
      pageErrors.push(e.message)
      console.error(`[Page Error] ${e.message}`) // Add this for debugging
    })

    // Expose setMockSongs to the browser context
    await page.exposeFunction('setMockSongsInBrowser', (songs: Song[]) => {
      setMockSongs(songs)
    })

    // Add a script to run before the page loads to set up the mock songs
    await page.addInitScript(() => {
      // @ts-ignore
      window.setMockSongs = (songs) => window.setMockSongsInBrowser(songs)
    })

    await page.goto('/e2e/harness.html')
    // Wait for the harness to load and router to be ready
    // Removed: await expect(page.getByText('Select harness')).toBeVisible() // Sanity check for existing harness content
  })

  for (const song of mockSongs) {
    test(`renders song "${song.title}" (${song.id}) correctly`, async ({ page }) => {
      // Set the current mock song for the harness
      await page.evaluate((s) => {
        // @ts-ignore
        window.setMockSongs([s])
      }, song)

      // Navigate to the song detail page in the harness
      await page.goto(`/e2e/harness.html#/e2e/song-detail-harness/${song.id}`)

      // Log page content for debugging
      console.log(`--- Page Content for ${song.title} (${song.id}) ---`)
      console.log(await page.content())
      console.log(`--- End Page Content ---`)

      // Add assertion for "Song not found"
      await expect(page.getByText('Song not found')).not.toBeVisible({ timeout: 1000 }) // Add a short timeout here

      // Wait for loading skeleton to disappear
      await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 10000 })



      // Assert that key elements are visible
      await expect(page.getByRole('heading', { name: song.title, level: 1 })).toBeVisible()
      if (song.artist) {
        await expect(page.getByText(song.artist)).toBeVisible()
      }
      await expect(page.getByText(song.defaultKey!)).toBeVisible()
      await expect(page.getByText(song.genre!)).toBeVisible()
      if (song.meta?.themes && song.meta.themes.length > 0) {
        for (const theme of song.meta.themes) {
          await expect(page.getByText(theme)).toBeVisible()
        }
      }

      // Check for lyrics if present
      if (song.lyrics && song.lyrics.length > 0) {
        await expect(page.getByText(song.lyrics[0].lines[0])).toBeVisible()
      } else {
        await expect(page.getByText(/lyrics not available/i)).toBeVisible()
      }

      // Check for album art if present
      if (song.albumArtUrl) {
        await expect(page.getByAltText(`${song.title} artwork`)).toBeVisible()
      }

      // Check for media embeds if present
      if (song.media?.spotifyTrackId) {
        await expect(page.frameLocator(`iframe[title="Play ${song.title} on Spotify"]`).first().locator('body')).toBeVisible()
      }
      if (song.media?.youtubeVideoId || song.media?.youtubeOfficialAudioId) {
        await expect(page.frameLocator(`iframe[title="Watch ${song.title} on YouTube"]`).first().locator('body')).toBeVisible()
      }

      // Assert no console or page errors
      expect(consoleErrors).toEqual([])
      expect(pageErrors).toEqual([])
    })
  }
})
