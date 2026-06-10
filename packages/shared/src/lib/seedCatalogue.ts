import type { Song, SongGenre } from '../types'

/** Curated worship catalogue. Mirrors the global /songs seed (functions/src/seed.ts).
 *  Used as a graceful fallback in the Song Library until the Firestore seed is run. */
interface SeedSong {
  id: string
  title: string
  artist: string
  genre: SongGenre
  defaultKey: string
}

export const SEED_CATALOGUE: SeedSong[] = [
  // Maverick City Music
  { id: 'mc-promises',        title: 'Promises',                 artist: 'Maverick City Music',   genre: 'Contemporary', defaultKey: 'B'  },
  { id: 'mc-jireh',           title: 'Jireh',                    artist: 'Maverick City Music',   genre: 'Contemporary', defaultKey: 'E'  },
  { id: 'mc-mostbeautiful',   title: 'Most Beautiful / So In Love', artist: 'Maverick City Music', genre: 'Contemporary', defaultKey: 'F' },
  // Bethel Music
  { id: 'bt-goodness',        title: 'Goodness of God',          artist: 'Bethel Music',          genre: 'Contemporary', defaultKey: 'Ab' },
  { id: 'bt-raise',           title: 'Raise A Hallelujah',       artist: 'Bethel Music',          genre: 'Contemporary', defaultKey: 'A'  },
  { id: 'bt-noones',          title: 'No Longer Slaves',         artist: 'Bethel Music',          genre: 'Contemporary', defaultKey: 'D'  },
  // Hillsong Worship
  { id: 'hs-beautifulname',   title: 'What A Beautiful Name',    artist: 'Hillsong Worship',      genre: 'Contemporary', defaultKey: 'D'  },
  { id: 'hs-oceans',          title: 'Oceans (Where Feet May Fail)', artist: 'Hillsong Worship',  genre: 'Contemporary', defaultKey: 'D'  },
  { id: 'hs-whoyousay',       title: 'Who You Say I Am',         artist: 'Hillsong Worship',      genre: 'Contemporary', defaultKey: 'C'  },
  // Elevation Worship
  { id: 'ev-graves',          title: 'Graves Into Gardens',      artist: 'Elevation Worship',     genre: 'Contemporary', defaultKey: 'C'  },
  { id: 'ev-doitagain',       title: 'Do It Again',              artist: 'Elevation Worship',     genre: 'Contemporary', defaultKey: 'Bb' },
  { id: 'ev-rattle',          title: 'RATTLE!',                  artist: 'Elevation Worship',     genre: 'Contemporary', defaultKey: 'C'  },
  // Dunsin Oyekan
  { id: 'do-nayoudeyreign',   title: 'Na You Dey Reign',         artist: 'Dunsin Oyekan',         genre: 'Gospel',       defaultKey: 'G'  },
  { id: 'do-fragrance',       title: 'The Fragrance',            artist: 'Dunsin Oyekan',         genre: 'Gospel',       defaultKey: 'F'  },
  // Sinach
  { id: 'sn-waymaker',        title: 'Way Maker',                artist: 'Sinach',                genre: 'Gospel',       defaultKey: 'E'  },
  { id: 'sn-greatestlord',    title: 'I Know Who I Am',          artist: 'Sinach',                genre: 'Gospel',       defaultKey: 'F'  },
  // Travis Greene
  { id: 'tg-intentional',     title: 'Intentional',              artist: 'Travis Greene',         genre: 'Gospel',       defaultKey: 'F'  },
  { id: 'tg-madeaway',        title: 'Made A Way',               artist: 'Travis Greene',         genre: 'Gospel',       defaultKey: 'Ab' },
  // Tasha Cobbs Leonard
  { id: 'tc-breakchain',      title: 'Break Every Chain',        artist: 'Tasha Cobbs Leonard',   genre: 'Gospel',       defaultKey: 'C'  },
  { id: 'tc-fillthisplace',   title: 'You Know My Name',         artist: 'Tasha Cobbs Leonard',   genre: 'Gospel',       defaultKey: 'Bb' },
  // Nathaniel Bassey
  { id: 'nb-imela',           title: 'Imela',                    artist: 'Nathaniel Bassey',      genre: 'Gospel',       defaultKey: 'Bb' },
  { id: 'nb-onyedikagozie',   title: 'Onyedikagozie',            artist: 'Nathaniel Bassey',      genre: 'Gospel',       defaultKey: 'G'  },
  // Frank Edwards
  { id: 'fe-youaremighty',    title: 'You Are Mighty',           artist: 'Frank Edwards',         genre: 'Gospel',       defaultKey: 'A'  },
  { id: 'fe-okakaa',          title: 'Okaka',                    artist: 'Frank Edwards',         genre: 'Gospel',       defaultKey: 'G'  },
]

const now = new Date()

export function seedCatalogueAsSongs(): Song[] {
  return SEED_CATALOGUE.map(s => ({
    id: s.id,
    origin: 'seed' as const,
    title: s.title,
    artist: s.artist,
    primaryLanguage: 'en' as const,
    availableLanguages: ['en' as const],
    genre: s.genre,
    defaultKey: s.defaultKey,
    meta: {},
    rights: { status: 'unknown' as const },
    media: {},
    lyrics: [],
    addedBy: 'seed',
    createdAt: now,
    updatedAt: now,
    // Transitional compat
    isCustom: false,
  }))
}
