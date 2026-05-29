/**
 * Seeds the global, read-only song library at /songs.
 * Run once after deploy:  npm --prefix functions run seed
 * (Requires GOOGLE_APPLICATION_CREDENTIALS or `firebase login` + default creds.)
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

initializeApp({ credential: applicationDefault() })
const db = getFirestore()

const CATALOGUE = [
  { id: 'mc-promises',      title: 'Promises',                    artist: 'Maverick City Music', genre: 'Contemporary', defaultKey: 'B'  },
  { id: 'mc-jireh',         title: 'Jireh',                       artist: 'Maverick City Music', genre: 'Contemporary', defaultKey: 'E'  },
  { id: 'mc-mostbeautiful', title: 'Most Beautiful / So In Love', artist: 'Maverick City Music', genre: 'Contemporary', defaultKey: 'F'  },
  { id: 'bt-goodness',      title: 'Goodness of God',             artist: 'Bethel Music',        genre: 'Contemporary', defaultKey: 'Ab' },
  { id: 'bt-raise',         title: 'Raise A Hallelujah',          artist: 'Bethel Music',        genre: 'Contemporary', defaultKey: 'A'  },
  { id: 'bt-noones',        title: 'No Longer Slaves',            artist: 'Bethel Music',        genre: 'Contemporary', defaultKey: 'D'  },
  { id: 'hs-beautifulname', title: 'What A Beautiful Name',       artist: 'Hillsong Worship',    genre: 'Contemporary', defaultKey: 'D'  },
  { id: 'hs-oceans',        title: 'Oceans (Where Feet May Fail)',artist: 'Hillsong Worship',    genre: 'Contemporary', defaultKey: 'D'  },
  { id: 'hs-whoyousay',     title: 'Who You Say I Am',            artist: 'Hillsong Worship',    genre: 'Contemporary', defaultKey: 'C'  },
  { id: 'ev-graves',        title: 'Graves Into Gardens',         artist: 'Elevation Worship',   genre: 'Contemporary', defaultKey: 'C'  },
  { id: 'ev-doitagain',     title: 'Do It Again',                 artist: 'Elevation Worship',   genre: 'Contemporary', defaultKey: 'Bb' },
  { id: 'ev-rattle',        title: 'RATTLE!',                     artist: 'Elevation Worship',   genre: 'Contemporary', defaultKey: 'C'  },
  { id: 'do-nayoudeyreign', title: 'Na You Dey Reign',            artist: 'Dunsin Oyekan',       genre: 'Gospel',       defaultKey: 'G'  },
  { id: 'do-fragrance',     title: 'The Fragrance',               artist: 'Dunsin Oyekan',       genre: 'Gospel',       defaultKey: 'F'  },
  { id: 'sn-waymaker',      title: 'Way Maker',                   artist: 'Sinach',              genre: 'Gospel',       defaultKey: 'E'  },
  { id: 'sn-greatestlord',  title: 'I Know Who I Am',             artist: 'Sinach',              genre: 'Gospel',       defaultKey: 'F'  },
  { id: 'tg-intentional',   title: 'Intentional',                 artist: 'Travis Greene',       genre: 'Gospel',       defaultKey: 'F'  },
  { id: 'tg-madeaway',      title: 'Made A Way',                  artist: 'Travis Greene',       genre: 'Gospel',       defaultKey: 'Ab' },
  { id: 'tc-breakchain',    title: 'Break Every Chain',           artist: 'Tasha Cobbs Leonard', genre: 'Gospel',       defaultKey: 'C'  },
  { id: 'tc-fillthisplace', title: 'You Know My Name',            artist: 'Tasha Cobbs Leonard', genre: 'Gospel',       defaultKey: 'Bb' },
  { id: 'nb-imela',         title: 'Imela',                       artist: 'Nathaniel Bassey',    genre: 'Gospel',       defaultKey: 'Bb' },
  { id: 'nb-onyedikagozie', title: 'Onyedikagozie',               artist: 'Nathaniel Bassey',    genre: 'Gospel',       defaultKey: 'G'  },
  { id: 'fe-youaremighty',  title: 'You Are Mighty',              artist: 'Frank Edwards',       genre: 'Gospel',       defaultKey: 'A'  },
  { id: 'fe-okakaa',        title: 'Okaka',                       artist: 'Frank Edwards',       genre: 'Gospel',       defaultKey: 'G'  },
]

async function run() {
  const batch = db.batch()
  for (const song of CATALOGUE) {
    batch.set(db.collection('songs').doc(song.id), {
      ...song,
      isCustom: false,
      addedBy: 'seed',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  }
  await batch.commit()
  console.log(`Seeded ${CATALOGUE.length} songs into /songs`)
}

run().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1) })
