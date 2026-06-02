/**
 * Seeds the global, read-only song library at /songs (rev-2 schema).
 *
 * Run once after deploy:  npm --prefix functions run seed
 * (Requires GOOGLE_APPLICATION_CREDENTIALS or `firebase login` + default creds.)
 *
 * Rights model
 * ------------
 * - `ccli_required` entries are LINK-OUT ONLY: media IDs may be populated,
 *   but `lyrics` MUST be empty. The pre-write rights gate aborts the seed
 *   if any entry violates this — enforces the HARA-25.9 acceptance:
 *   "Rights audit: zero CCLI-required songs have full lyrics hosted."
 * - `public_domain` entries carry full structured LyricSection[].
 *
 * Schema fields populated here mirror src/types/index.ts > Song (rev-2).
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

initializeApp({ credential: applicationDefault() })
const db = getFirestore()

// ── Local schema mirrors (kept inline so functions/ has no src/ import) ──────

type Language = 'en' | 'yo' | 'ig' | 'ha' | 'pcm' | 'fr' | 'sw' | 'pt' | 'la' | 'other'
type RightsStatus = 'public_domain' | 'ccli_required' | 'royalty_free' | 'unlicensed' | 'unknown'
type LyricKind = 'verse' | 'chorus' | 'pre_chorus' | 'bridge' | 'tag' | 'refrain' | 'intro' | 'outro' | 'interlude'

interface LyricSection {
  kind: LyricKind
  number?: number
  lines: string[]
  language: Language
}

interface SongRights {
  status: RightsStatus
  ccliNumber?: string
  publisher?: string
  copyrightYear?: number
  notes?: string
}

interface SongMediaLinks {
  youtubeVideoId?: string
  spotifyTrackId?: string
}

interface SeedSong {
  id: string
  title: string
  artist?: string
  composers?: string[]
  primaryLanguage: Language
  availableLanguages: Language[]
  genre: string
  defaultKey?: string
  rights: SongRights
  media: SongMediaLinks
  lyrics: LyricSection[]
  meta?: {
    bpm?: number
    scriptureRefs?: string[]
    themes?: string[]
    liturgicalSeason?: 'advent' | 'christmas' | 'lent' | 'easter' | 'pentecost' | 'ordinary'
  }
}

// ── CCLI-required catalogue (link-out only, no hosted lyrics) ────────────────
// Publishers per CCLI registry as of 2026. Lyrics body intentionally empty.

const CCLI_CATALOGUE: SeedSong[] = [
  // Maverick City Music
  { id: 'mc-promises',      title: 'Promises',                    artist: 'Maverick City Music', primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary', defaultKey: 'B',  rights: { status: 'ccli_required', publisher: 'Maverick City Publishing' }, media: {}, lyrics: [] },
  { id: 'mc-jireh',         title: 'Jireh',                       artist: 'Maverick City Music', primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary', defaultKey: 'E',  rights: { status: 'ccli_required', publisher: 'Maverick City Publishing' }, media: {}, lyrics: [] },
  { id: 'mc-mostbeautiful', title: 'Most Beautiful / So In Love', artist: 'Maverick City Music', primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary', defaultKey: 'F',  rights: { status: 'ccli_required', publisher: 'Maverick City Publishing' }, media: {}, lyrics: [] },
  // Bethel Music
  { id: 'bt-goodness',      title: 'Goodness of God',             artist: 'Bethel Music',        primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary', defaultKey: 'Ab', rights: { status: 'ccli_required', publisher: 'Bethel Music Publishing' }, media: {}, lyrics: [] },
  { id: 'bt-raise',         title: 'Raise A Hallelujah',          artist: 'Bethel Music',        primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary', defaultKey: 'A',  rights: { status: 'ccli_required', publisher: 'Bethel Music Publishing' }, media: {}, lyrics: [] },
  { id: 'bt-noones',        title: 'No Longer Slaves',            artist: 'Bethel Music',        primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary', defaultKey: 'D',  rights: { status: 'ccli_required', publisher: 'Bethel Music Publishing' }, media: {}, lyrics: [] },
  // Hillsong
  { id: 'hs-beautifulname', title: 'What A Beautiful Name',       artist: 'Hillsong Worship',    primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary', defaultKey: 'D',  rights: { status: 'ccli_required', publisher: 'Hillsong Music Publishing' }, media: {}, lyrics: [] },
  { id: 'hs-oceans',        title: 'Oceans (Where Feet May Fail)',artist: 'Hillsong Worship',    primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary', defaultKey: 'D',  rights: { status: 'ccli_required', publisher: 'Hillsong Music Publishing' }, media: {}, lyrics: [] },
  { id: 'hs-whoyousay',     title: 'Who You Say I Am',            artist: 'Hillsong Worship',    primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary', defaultKey: 'C',  rights: { status: 'ccli_required', publisher: 'Hillsong Music Publishing' }, media: {}, lyrics: [] },
  // Elevation
  { id: 'ev-graves',        title: 'Graves Into Gardens',         artist: 'Elevation Worship',   primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary', defaultKey: 'C',  rights: { status: 'ccli_required', publisher: 'Elevation Worship Publishing' }, media: {}, lyrics: [] },
  { id: 'ev-doitagain',     title: 'Do It Again',                 artist: 'Elevation Worship',   primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary', defaultKey: 'Bb', rights: { status: 'ccli_required', publisher: 'Elevation Worship Publishing' }, media: {}, lyrics: [] },
  { id: 'ev-rattle',        title: 'RATTLE!',                     artist: 'Elevation Worship',   primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary', defaultKey: 'C',  rights: { status: 'ccli_required', publisher: 'Elevation Worship Publishing' }, media: {}, lyrics: [] },
  // African gospel — independent labels but still copyrighted; link-out only
  { id: 'do-nayoudeyreign', title: 'Na You Dey Reign',            artist: 'Dunsin Oyekan',       primaryLanguage: 'pcm',availableLanguages: ['pcm','en'], genre: 'African Gospel', defaultKey: 'G', rights: { status: 'ccli_required', publisher: 'Dunsin Oyekan Music' }, media: {}, lyrics: [] },
  { id: 'do-fragrance',     title: 'The Fragrance',               artist: 'Dunsin Oyekan',       primaryLanguage: 'en', availableLanguages: ['en'], genre: 'African Gospel', defaultKey: 'F',  rights: { status: 'ccli_required', publisher: 'Dunsin Oyekan Music' }, media: {}, lyrics: [] },
  { id: 'sn-waymaker',      title: 'Way Maker',                   artist: 'Sinach',              primaryLanguage: 'en', availableLanguages: ['en'], genre: 'African Gospel', defaultKey: 'E',  rights: { status: 'ccli_required', publisher: 'Integrity Music (Sinach)' }, media: {}, lyrics: [] },
  { id: 'sn-greatestlord',  title: 'I Know Who I Am',             artist: 'Sinach',              primaryLanguage: 'en', availableLanguages: ['en'], genre: 'African Gospel', defaultKey: 'F',  rights: { status: 'ccli_required', publisher: 'Integrity Music (Sinach)' }, media: {}, lyrics: [] },
  { id: 'tg-intentional',   title: 'Intentional',                 artist: 'Travis Greene',       primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Gospel',         defaultKey: 'F',  rights: { status: 'ccli_required', publisher: 'RCA Inspiration' }, media: {}, lyrics: [] },
  { id: 'tg-madeaway',      title: 'Made A Way',                  artist: 'Travis Greene',       primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Gospel',         defaultKey: 'Ab', rights: { status: 'ccli_required', publisher: 'RCA Inspiration' }, media: {}, lyrics: [] },
  { id: 'tc-breakchain',    title: 'Break Every Chain',           artist: 'Tasha Cobbs Leonard', primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Gospel',         defaultKey: 'C',  rights: { status: 'ccli_required', publisher: 'Motown Gospel' }, media: {}, lyrics: [] },
  { id: 'tc-fillthisplace', title: 'You Know My Name',            artist: 'Tasha Cobbs Leonard', primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Gospel',         defaultKey: 'Bb', rights: { status: 'ccli_required', publisher: 'Motown Gospel' }, media: {}, lyrics: [] },
  { id: 'nb-imela',         title: 'Imela',                       artist: 'Nathaniel Bassey',    primaryLanguage: 'ig', availableLanguages: ['ig','en'], genre: 'African Gospel', defaultKey: 'Bb', rights: { status: 'ccli_required', publisher: 'Nathaniel Bassey Music' }, media: {}, lyrics: [] },
  { id: 'nb-onyedikagozie', title: 'Onyedikagozie',               artist: 'Nathaniel Bassey',    primaryLanguage: 'ig', availableLanguages: ['ig','en'], genre: 'African Gospel', defaultKey: 'G',  rights: { status: 'ccli_required', publisher: 'Nathaniel Bassey Music' }, media: {}, lyrics: [] },
  { id: 'fe-youaremighty',  title: 'You Are Mighty',              artist: 'Frank Edwards',       primaryLanguage: 'en', availableLanguages: ['en'], genre: 'African Gospel', defaultKey: 'A',  rights: { status: 'ccli_required', publisher: 'Rocktown Records' }, media: {}, lyrics: [] },
  { id: 'fe-okakaa',        title: 'Okaka',                       artist: 'Frank Edwards',       primaryLanguage: 'ig', availableLanguages: ['ig','en'], genre: 'African Gospel', defaultKey: 'G',  rights: { status: 'ccli_required', publisher: 'Rocktown Records' }, media: {}, lyrics: [] },

  // CCLI batch 2 — global contemporary worship + African gospel link-outs
  { id: 'hw-whatabeautifulname', title: 'What A Beautiful Name',   artist: 'Hillsong Worship',    primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary',   defaultKey: 'D',  rights: { status: 'ccli_required', publisher: 'Hillsong Music Publishing' }, media: {}, lyrics: [] },
  { id: 'hu-oceans',            title: 'Oceans (Where Feet May Fail)', artist: 'Hillsong United', primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary',   defaultKey: 'D',  rights: { status: 'ccli_required', publisher: 'Hillsong Music Publishing' }, media: {}, lyrics: [] },
  { id: 'hw-kingofkings',       title: 'King of Kings',            artist: 'Hillsong Worship',    primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary',   defaultKey: 'D',  rights: { status: 'ccli_required', publisher: 'Hillsong Music Publishing' }, media: {}, lyrics: [] },
  { id: 'el-comeotaltar',       title: 'O Come to the Altar',      artist: 'Elevation Worship',   primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary',   defaultKey: 'B',  rights: { status: 'ccli_required', publisher: 'Elevation Worship Publishing' }, media: {}, lyrics: [] },
  { id: 'el-graveintogardens',  title: 'Graves Into Gardens',      artist: 'Elevation Worship',   primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary',   defaultKey: 'F',  rights: { status: 'ccli_required', publisher: 'Elevation Worship Publishing' }, media: {}, lyrics: [] },
  { id: 'pw-houseofthelord',    title: 'House of the Lord',        artist: 'Phil Wickham',        primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary',   defaultKey: 'A',  rights: { status: 'ccli_required', publisher: 'Phil Wickham Music' }, media: {}, lyrics: [] },
  { id: 'cw-believeforit',      title: 'Believe For It',           artist: 'CeCe Winans',         primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Gospel',         defaultKey: 'Db', rights: { status: 'ccli_required', publisher: 'PureSprings Gospel' }, media: {}, lyrics: [] },
  { id: 'kf-imagine',           title: 'Imagine Me',               artist: 'Kirk Franklin',       primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Gospel',         defaultKey: 'F',  rights: { status: 'ccli_required', publisher: 'Fo Yo Soul Music' }, media: {}, lyrics: [] },
  { id: 'kf-loveTheory',        title: 'Love Theory',              artist: 'Kirk Franklin',       primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Gospel',         defaultKey: 'Eb', rights: { status: 'ccli_required', publisher: 'Fo Yo Soul Music' }, media: {}, lyrics: [] },
  { id: 'ms-mychampion',        title: 'My Testimony',             artist: 'Marvin Sapp',         primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Gospel',         defaultKey: 'G',  rights: { status: 'ccli_required', publisher: 'RCA Inspiration' }, media: {}, lyrics: [] },
  { id: 'ih-yougoodyougreat',   title: 'You Are Good',             artist: 'Israel Houghton',     primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Gospel',         defaultKey: 'C',  rights: { status: 'ccli_required', publisher: 'Integrity Music' }, media: {}, lyrics: [] },
  { id: 'jn-iBelieve',          title: 'I Believe (Island Medley)', artist: 'Jonathan Nelson',    primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Gospel',         defaultKey: 'A',  rights: { status: 'ccli_required', publisher: 'Integrity Music' }, media: {}, lyrics: [] },
  { id: 'ta-loganTiODe',        title: 'Logan Ti O De',            artist: 'Tope Alabi',          primaryLanguage: 'yo', availableLanguages: ['yo'], genre: 'African Gospel', defaultKey: 'F',  rights: { status: 'ccli_required', publisher: 'Tope Alabi Music' }, media: {}, lyrics: [] },
  { id: 'ta-oba',               title: 'Oba Awimayehun',           artist: 'Tope Alabi',          primaryLanguage: 'yo', availableLanguages: ['yo'], genre: 'African Gospel', defaultKey: 'D',  rights: { status: 'ccli_required', publisher: 'Tope Alabi Music' }, media: {}, lyrics: [] },
  { id: 'sb-baba',              title: 'Baba',                     artist: 'Sonnie Badu',         primaryLanguage: 'en', availableLanguages: ['en'], genre: 'African Gospel', defaultKey: 'G',  rights: { status: 'ccli_required', publisher: 'Songs of Sonnie Badu' }, media: {}, lyrics: [] },
  { id: 'jm-myethiopia',        title: 'My Ethiopia',              artist: 'Joe Mettle',          primaryLanguage: 'en', availableLanguages: ['en'], genre: 'African Gospel', defaultKey: 'Bb', rights: { status: 'ccli_required', publisher: 'Joe Mettle Music' }, media: {}, lyrics: [] },
  { id: 'mc-excessLove',        title: 'Excess Love',              artist: 'Mercy Chinwo',        primaryLanguage: 'en', availableLanguages: ['en','ig'], genre: 'African Gospel', defaultKey: 'C',  rights: { status: 'ccli_required', publisher: 'EeZee Conceptz' }, media: {}, lyrics: [] },
  { id: 'mc-akamdinelu',        title: 'Akamdinelu',               artist: 'Mercy Chinwo',        primaryLanguage: 'ig', availableLanguages: ['ig','en'], genre: 'African Gospel', defaultKey: 'D',  rights: { status: 'ccli_required', publisher: 'EeZee Conceptz' }, media: {}, lyrics: [] },
  { id: 'mc-obinasomidi',       title: 'Obinasomidi',              artist: 'Mercy Chinwo',        primaryLanguage: 'ig', availableLanguages: ['ig','en'], genre: 'African Gospel', defaultKey: 'Eb', rights: { status: 'ccli_required', publisher: 'EeZee Conceptz' }, media: {}, lyrics: [] },
  { id: 'nb-hallelujah',        title: 'Hallelujah Challenge',     artist: 'Nathaniel Bassey',    primaryLanguage: 'en', availableLanguages: ['en','yo'], genre: 'African Gospel', defaultKey: 'A',  rights: { status: 'ccli_required', publisher: 'Nathaniel Bassey Music' }, media: {}, lyrics: [] },

  // CCLI batch 3 — global modern worship classics + African gospel deeper roster
  { id: 'ct-howgreatisourgod',  title: 'How Great Is Our God',     artist: 'Chris Tomlin',        primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary',   defaultKey: 'C',  rights: { status: 'ccli_required', publisher: 'sixsteps Music' }, media: {}, lyrics: [] },
  { id: 'ct-goodgoodfather',    title: 'Good Good Father',         artist: 'Chris Tomlin',        primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary',   defaultKey: 'G',  rights: { status: 'ccli_required', publisher: 'Common Hymnal Publishing' }, media: {}, lyrics: [] },
  { id: 'mr-tenthousand',       title: '10,000 Reasons (Bless the Lord)', artist: 'Matt Redman',  primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary',   defaultKey: 'G',  rights: { status: 'ccli_required', publisher: 'Thankyou Music' }, media: {}, lyrics: [] },
  { id: 'kg-inchristalone',     title: 'In Christ Alone',          artist: 'Keith Getty & Stuart Townend', primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary', defaultKey: 'D', rights: { status: 'ccli_required', publisher: 'Thankyou Music' }, media: {}, lyrics: [] },
  { id: 'kg-cornerstone',       title: 'Cornerstone',              artist: 'Hillsong Worship',    primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary',   defaultKey: 'C',  rights: { status: 'ccli_required', publisher: 'Hillsong Music Publishing' }, media: {}, lyrics: [] },
  { id: 'st-howdeep',           title: 'How Deep the Father\u2019s Love For Us', artist: 'Stuart Townend', primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary', defaultKey: 'C', rights: { status: 'ccli_required', publisher: 'Thankyou Music' }, media: {}, lyrics: [] },
  { id: 'ld-youSay',            title: 'You Say',                  artist: 'Lauren Daigle',       primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary',   defaultKey: 'F',  rights: { status: 'ccli_required', publisher: 'Centricity Music Publishing' }, media: {}, lyrics: [] },
  { id: 'bl-toomuchsea',        title: 'Too Good to Not Believe',  artist: 'Brandon Lake',        primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Contemporary',   defaultKey: 'Bb', rights: { status: 'ccli_required', publisher: 'Bethel Music Publishing' }, media: {}, lyrics: [] },
  { id: 'dm-godwillmakeaway',   title: 'God Will Make a Way',      artist: 'Don Moen',            primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Worship',        defaultKey: 'C',  rights: { status: 'ccli_required', publisher: 'Integrity Music' }, media: {}, lyrics: [] },
  { id: 'dm-thankyoulord',      title: 'Thank You Lord',           artist: 'Don Moen',            primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Worship',        defaultKey: 'G',  rights: { status: 'ccli_required', publisher: 'Integrity Music' }, media: {}, lyrics: [] },
  { id: 'rk-mightywarrior',     title: 'Mighty Warrior',           artist: 'Ron Kenoly',          primaryLanguage: 'en', availableLanguages: ['en'], genre: 'Worship',        defaultKey: 'D',  rights: { status: 'ccli_required', publisher: 'Integrity Music' }, media: {}, lyrics: [] },
  { id: 'do-emi-mimo',          title: 'Emi Mimo',                 artist: 'Dunsin Oyekan',       primaryLanguage: 'yo', availableLanguages: ['yo','en'], genre: 'African Gospel', defaultKey: 'C',  rights: { status: 'ccli_required', publisher: 'Dunsin Oyekan Music' }, media: {}, lyrics: [] },
  { id: 'do-fragranceTBR',      title: 'Fragrance to Fire',        artist: 'Dunsin Oyekan',       primaryLanguage: 'en', availableLanguages: ['en'], genre: 'African Gospel', defaultKey: 'F',  rights: { status: 'ccli_required', publisher: 'Dunsin Oyekan Music' }, media: {}, lyrics: [] },
  { id: 'eb-godofmiracles',     title: 'God of Miracles',          artist: 'Eben',                primaryLanguage: 'en', availableLanguages: ['en'], genre: 'African Gospel', defaultKey: 'A',  rights: { status: 'ccli_required', publisher: 'Eben Music' }, media: {}, lyrics: [] },
  { id: 'ae-johovaaba',         title: 'Jehovah Overdo',           artist: 'Ada Ehi',             primaryLanguage: 'en', availableLanguages: ['en'], genre: 'African Gospel', defaultKey: 'Bb', rights: { status: 'ccli_required', publisher: 'FreeNation INC' }, media: {}, lyrics: [] },
  { id: 'ae-onelife',           title: 'Only You Jesus',           artist: 'Ada Ehi',             primaryLanguage: 'en', availableLanguages: ['en'], genre: 'African Gospel', defaultKey: 'Eb', rights: { status: 'ccli_required', publisher: 'FreeNation INC' }, media: {}, lyrics: [] },
  { id: 'gu-allthatmatters',    title: 'All That Matters',         artist: 'GUC',                 primaryLanguage: 'en', availableLanguages: ['en','ig'], genre: 'African Gospel', defaultKey: 'Db', rights: { status: 'ccli_required', publisher: 'EeZee Conceptz' }, media: {}, lyrics: [] },
  { id: 'gu-allofme',           title: 'All of Me',                artist: 'GUC',                 primaryLanguage: 'en', availableLanguages: ['en'], genre: 'African Gospel', defaultKey: 'G',  rights: { status: 'ccli_required', publisher: 'EeZee Conceptz' }, media: {}, lyrics: [] },
  { id: 'sc-mountainmover',     title: 'Mountain Mover',           artist: 'Steve Crown',         primaryLanguage: 'en', availableLanguages: ['en'], genre: 'African Gospel', defaultKey: 'D',  rights: { status: 'ccli_required', publisher: 'Steve Crown Music' }, media: {}, lyrics: [] },
  { id: 'sc-youaremighty',      title: 'You Are Mighty',           artist: 'Steve Crown',         primaryLanguage: 'en', availableLanguages: ['en'], genre: 'African Gospel', defaultKey: 'F',  rights: { status: 'ccli_required', publisher: 'Steve Crown Music' }, media: {}, lyrics: [] },
  { id: 'tg-naheyourname',      title: 'Nara',                     artist: 'Tim Godfrey',         primaryLanguage: 'ig', availableLanguages: ['ig','en'], genre: 'African Gospel', defaultKey: 'Bb', rights: { status: 'ccli_required', publisher: 'Rox Nation' }, media: {}, lyrics: [] },
  { id: 'po-eshahgreat',        title: 'Eshe',                     artist: 'Preye Odede',         primaryLanguage: 'en', availableLanguages: ['en'], genre: 'African Gospel', defaultKey: 'G',  rights: { status: 'ccli_required', publisher: 'Preye Odede Music' }, media: {}, lyrics: [] },
  { id: 'vo-defender',          title: 'Defender',                 artist: 'Victoria Orenze',     primaryLanguage: 'en', availableLanguages: ['en'], genre: 'African Gospel', defaultKey: 'Eb', rights: { status: 'ccli_required', publisher: 'Victoria Orenze Music' }, media: {}, lyrics: [] },
  { id: 'vo-akoutoukpe',        title: 'Akoutoukpe',               artist: 'Victoria Orenze',     primaryLanguage: 'yo', availableLanguages: ['yo','en'], genre: 'African Gospel', defaultKey: 'D',  rights: { status: 'ccli_required', publisher: 'Victoria Orenze Music' }, media: {}, lyrics: [] },
  { id: 'mh-megomega',          title: 'Mega God',                 artist: 'Mr M & Revelation',   primaryLanguage: 'en', availableLanguages: ['en'], genre: 'African Gospel', defaultKey: 'D',  rights: { status: 'ccli_required', publisher: 'Mr M Music' }, media: {}, lyrics: [] },
]

// ── Public-domain Western hymn batch (full structured lyrics) ────────────────
// Each entry sources clearly-public-domain text (pre-1928 US / author > 95y dead).

const PUBLIC_DOMAIN_HYMNS: SeedSong[] = [
  {
    id: 'pd-amazing-grace',
    title: 'Amazing Grace',
    composers: ['John Newton (1779)'],
    primaryLanguage: 'en', availableLanguages: ['en'],
    genre: 'Hymn', defaultKey: 'G',
    rights: { status: 'public_domain', copyrightYear: 1779, notes: 'Text: John Newton, 1779. Tune: "New Britain", 1835.' },
    media: {},
    meta: { themes: ['grace', 'salvation', 'testimony'], scriptureRefs: ['Ephesians 2:8-9', '1 Chronicles 17:16-17'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Amazing grace! how sweet the sound',
        'That saved a wretch like me!',
        'I once was lost, but now am found,',
        'Was blind, but now I see.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'T\u2019was grace that taught my heart to fear,',
        'And grace my fears relieved;',
        'How precious did that grace appear',
        'The hour I first believed!',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Through many dangers, toils and snares,',
        'I have already come;',
        '\u2019Tis grace hath brought me safe thus far,',
        'And grace will lead me home.',
      ]},
      { kind: 'verse', number: 4, language: 'en', lines: [
        'When we\u2019ve been there ten thousand years,',
        'Bright shining as the sun,',
        'We\u2019ve no less days to sing God\u2019s praise',
        'Than when we\u2019d first begun.',
      ]},
    ],
  },
  {
    id: 'pd-holy-holy-holy',
    title: 'Holy, Holy, Holy! Lord God Almighty',
    composers: ['Reginald Heber (1826)', 'John Bacchus Dykes (1861, tune "Nicaea")'],
    primaryLanguage: 'en', availableLanguages: ['en'],
    genre: 'Hymn', defaultKey: 'D',
    rights: { status: 'public_domain', copyrightYear: 1826 },
    media: {},
    meta: { themes: ['trinity', 'adoration', 'holiness'], scriptureRefs: ['Revelation 4:8', 'Isaiah 6:3'], liturgicalSeason: 'ordinary' },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Holy, holy, holy! Lord God Almighty!',
        'Early in the morning our song shall rise to Thee;',
        'Holy, holy, holy, merciful and mighty!',
        'God in three Persons, blessed Trinity!',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Holy, holy, holy! All the saints adore Thee,',
        'Casting down their golden crowns around the glassy sea;',
        'Cherubim and seraphim falling down before Thee,',
        'Which wert, and art, and evermore shalt be.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Holy, holy, holy! though the darkness hide Thee,',
        'Though the eye of sinful man Thy glory may not see;',
        'Only Thou art holy; there is none beside Thee,',
        'Perfect in power, in love, and purity.',
      ]},
      { kind: 'verse', number: 4, language: 'en', lines: [
        'Holy, holy, holy! Lord God Almighty!',
        'All Thy works shall praise Thy Name, in earth, and sky, and sea;',
        'Holy, holy, holy! merciful and mighty,',
        'God in three Persons, blessed Trinity!',
      ]},
    ],
  },
  {
    id: 'pd-mighty-fortress',
    title: 'A Mighty Fortress Is Our God',
    composers: ['Martin Luther (c.1529)', 'Frederick H. Hedge (tr. 1853)'],
    primaryLanguage: 'en', availableLanguages: ['en'],
    genre: 'Hymn', defaultKey: 'C',
    rights: { status: 'public_domain', copyrightYear: 1529, notes: 'Original German "Ein feste Burg ist unser Gott"; Hedge English translation 1853.' },
    media: {},
    meta: { themes: ['protection', 'spiritual warfare', 'reformation'], scriptureRefs: ['Psalm 46'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'A mighty fortress is our God,',
        'A bulwark never failing;',
        'Our helper He, amid the flood',
        'Of mortal ills prevailing.',
        'For still our ancient foe',
        'Doth seek to work us woe;',
        'His craft and power are great,',
        'And, armed with cruel hate,',
        'On earth is not his equal.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Did we in our own strength confide,',
        'Our striving would be losing;',
        'Were not the right Man on our side,',
        'The Man of God\u2019s own choosing.',
        'Dost ask who that may be?',
        'Christ Jesus, it is He;',
        'Lord Sabaoth His name,',
        'From age to age the same,',
        'And He must win the battle.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'And though this world, with devils filled,',
        'Should threaten to undo us,',
        'We will not fear, for God hath willed',
        'His truth to triumph through us.',
        'The Prince of Darkness grim,',
        'We tremble not for him;',
        'His rage we can endure,',
        'For lo! his doom is sure,',
        'One little word shall fell him.',
      ]},
    ],
  },
  {
    id: 'pd-it-is-well',
    title: 'It Is Well With My Soul',
    composers: ['Horatio Spafford (1873)', 'Philip Bliss (1876, tune "Ville du Havre")'],
    primaryLanguage: 'en', availableLanguages: ['en'],
    genre: 'Hymn', defaultKey: 'C',
    rights: { status: 'public_domain', copyrightYear: 1873 },
    media: {},
    meta: { themes: ['peace', 'suffering', 'assurance'], scriptureRefs: ['2 Kings 4:26', 'Romans 8:28'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'When peace, like a river, attendeth my way,',
        'When sorrows like sea billows roll;',
        'Whatever my lot, Thou hast taught me to say,',
        '\u201CIt is well, it is well with my soul.\u201D',
      ]},
      { kind: 'chorus', language: 'en', lines: [
        'It is well (it is well),',
        'With my soul (with my soul),',
        'It is well, it is well with my soul.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Though Satan should buffet, though trials should come,',
        'Let this blest assurance control,',
        'That Christ hath regarded my helpless estate,',
        'And hath shed His own blood for my soul.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'My sin\u2014oh, the bliss of this glorious thought!\u2014',
        'My sin, not in part but the whole,',
        'Is nailed to the cross, and I bear it no more,',
        'Praise the Lord, praise the Lord, O my soul!',
      ]},
      { kind: 'verse', number: 4, language: 'en', lines: [
        'And, Lord, haste the day when my faith shall be sight,',
        'The clouds be rolled back as a scroll;',
        'The trump shall resound, and the Lord shall descend,',
        'Even so, it is well with my soul.',
      ]},
    ],
  },
  {
    id: 'pd-when-i-survey',
    title: 'When I Survey the Wondrous Cross',
    composers: ['Isaac Watts (1707)'],
    primaryLanguage: 'en', availableLanguages: ['en'],
    genre: 'Hymn', defaultKey: 'F',
    rights: { status: 'public_domain', copyrightYear: 1707 },
    media: {},
    meta: { themes: ['cross', 'sacrifice', 'devotion'], scriptureRefs: ['Galatians 6:14'], liturgicalSeason: 'lent' },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'When I survey the wondrous cross',
        'On which the Prince of glory died,',
        'My richest gain I count but loss,',
        'And pour contempt on all my pride.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Forbid it, Lord, that I should boast,',
        'Save in the death of Christ my God!',
        'All the vain things that charm me most,',
        'I sacrifice them to His blood.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'See from His head, His hands, His feet,',
        'Sorrow and love flow mingled down!',
        'Did e\u2019er such love and sorrow meet,',
        'Or thorns compose so rich a crown?',
      ]},
      { kind: 'verse', number: 4, language: 'en', lines: [
        'Were the whole realm of nature mine,',
        'That were a present far too small;',
        'Love so amazing, so divine,',
        'Demands my soul, my life, my all.',
      ]},
    ],
  },
  {
    id: 'pd-come-thou-fount',
    title: 'Come, Thou Fount of Every Blessing',
    composers: ['Robert Robinson (1758)', 'John Wyeth (1813, tune "Nettleton")'],
    primaryLanguage: 'en', availableLanguages: ['en'],
    genre: 'Hymn', defaultKey: 'D',
    rights: { status: 'public_domain', copyrightYear: 1758 },
    media: {},
    meta: { themes: ['grace', 'praise', 'covenant'], scriptureRefs: ['1 Samuel 7:12'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Come, Thou Fount of every blessing,',
        'Tune my heart to sing Thy grace;',
        'Streams of mercy, never ceasing,',
        'Call for songs of loudest praise.',
        'Teach me some melodious sonnet,',
        'Sung by flaming tongues above;',
        'Praise the mount! I\u2019m fixed upon it,',
        'Mount of Thy redeeming love.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Here I raise mine Ebenezer;',
        'Hither by Thy help I\u2019m come;',
        'And I hope, by Thy good pleasure,',
        'Safely to arrive at home.',
        'Jesus sought me when a stranger,',
        'Wandering from the fold of God;',
        'He, to rescue me from danger,',
        'Interposed His precious blood.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'O to grace how great a debtor',
        'Daily I\u2019m constrained to be!',
        'Let Thy goodness, like a fetter,',
        'Bind my wandering heart to Thee.',
        'Prone to wander, Lord, I feel it,',
        'Prone to leave the God I love;',
        'Here\u2019s my heart, O take and seal it,',
        'Seal it for Thy courts above.',
      ]},
    ],
  },
  {
    id: 'pd-rock-of-ages',
    title: 'Rock of Ages, Cleft for Me',
    composers: ['Augustus Toplady (1763)', 'Thomas Hastings (1830, tune "Toplady")'],
    primaryLanguage: 'en', availableLanguages: ['en'],
    genre: 'Hymn', defaultKey: 'Eb',
    rights: { status: 'public_domain', copyrightYear: 1763 },
    media: {},
    meta: { themes: ['atonement', 'refuge', 'salvation'], scriptureRefs: ['Exodus 33:22', '1 Corinthians 10:4'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Rock of Ages, cleft for me,',
        'Let me hide myself in Thee;',
        'Let the water and the blood,',
        'From Thy wounded side which flowed,',
        'Be of sin the double cure,',
        'Save from wrath and make me pure.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Not the labor of my hands',
        'Can fulfill Thy law\u2019s demands;',
        'Could my zeal no respite know,',
        'Could my tears forever flow,',
        'All for sin could not atone;',
        'Thou must save, and Thou alone.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Nothing in my hand I bring,',
        'Simply to the cross I cling;',
        'Naked, come to Thee for dress;',
        'Helpless, look to Thee for grace;',
        'Foul, I to the fountain fly;',
        'Wash me, Saviour, or I die.',
      ]},
      { kind: 'verse', number: 4, language: 'en', lines: [
        'While I draw this fleeting breath,',
        'When my eyes shall close in death,',
        'When I soar to worlds unknown,',
        'See Thee on Thy judgment throne,',
        'Rock of Ages, cleft for me,',
        'Let me hide myself in Thee.',
      ]},
    ],
  },
  {
    id: 'pd-crown-him',
    title: 'Crown Him With Many Crowns',
    composers: ['Matthew Bridges (1851)', 'Godfrey Thring (1874)', 'George J. Elvey (tune "Diademata")'],
    primaryLanguage: 'en', availableLanguages: ['en'],
    genre: 'Hymn', defaultKey: 'D',
    rights: { status: 'public_domain', copyrightYear: 1851 },
    media: {},
    meta: { themes: ['kingship', 'resurrection', 'majesty'], scriptureRefs: ['Revelation 19:12'], liturgicalSeason: 'easter' },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Crown Him with many crowns,',
        'The Lamb upon His throne;',
        'Hark! how the heavenly anthem drowns',
        'All music but its own:',
        'Awake, my soul, and sing',
        'Of Him who died for thee,',
        'And hail Him as thy matchless King',
        'Through all eternity.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Crown Him the Lord of love;',
        'Behold His hands and side,',
        'Those wounds, yet visible above,',
        'In beauty glorified;',
        'No angel in the sky',
        'Can fully bear that sight,',
        'But downward bends his burning eye',
        'At mysteries so bright.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Crown Him the Lord of life,',
        'Who triumphed o\u2019er the grave,',
        'And rose victorious in the strife',
        'For those He came to save;',
        'His glories now we sing,',
        'Who died and rose on high,',
        'Who died eternal life to bring,',
        'And lives that death may die.',
      ]},
    ],
  },
  {
    id: 'pd-praise-to-the-lord',
    title: 'Praise to the Lord, the Almighty',
    composers: ['Joachim Neander (1680)', 'Catherine Winkworth (tr. 1863)'],
    primaryLanguage: 'en', availableLanguages: ['en'],
    genre: 'Hymn', defaultKey: 'F',
    rights: { status: 'public_domain', copyrightYear: 1680 },
    media: {},
    meta: { themes: ['praise', 'creation', 'sovereignty'], scriptureRefs: ['Psalm 103', 'Psalm 150'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Praise to the Lord, the Almighty, the King of creation!',
        'O my soul, praise Him, for He is thy health and salvation!',
        'All ye who hear, now to His temple draw near;',
        'Praise Him in glad adoration.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Praise to the Lord, who o\u2019er all things so wondrously reigneth,',
        'Shelters thee under His wings, yea, so gently sustaineth!',
        'Hast thou not seen how thy desires e\u2019er have been',
        'Granted in what He ordaineth?',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Praise to the Lord, who doth prosper thy work and defend thee;',
        'Surely His goodness and mercy here daily attend thee.',
        'Ponder anew what the Almighty can do,',
        'If with His love He befriend thee.',
      ]},
      { kind: 'verse', number: 4, language: 'en', lines: [
        'Praise to the Lord! O let all that is in me adore Him!',
        'All that hath life and breath, come now with praises before Him.',
        'Let the Amen sound from His people again,',
        'Gladly for aye we adore Him.',
      ]},
    ],
  },
  {
    id: 'pd-joyful-joyful',
    title: 'Joyful, Joyful, We Adore Thee',
    composers: ['Henry van Dyke (1907)', 'Ludwig van Beethoven (tune "Ode to Joy", 1824)'],
    primaryLanguage: 'en', availableLanguages: ['en'],
    genre: 'Hymn', defaultKey: 'D',
    rights: { status: 'public_domain', copyrightYear: 1907 },
    media: {},
    meta: { themes: ['joy', 'praise', 'creation'], scriptureRefs: ['Psalm 148'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Joyful, joyful, we adore Thee,',
        'God of glory, Lord of love;',
        'Hearts unfold like flowers before Thee,',
        'Opening to the sun above.',
        'Melt the clouds of sin and sadness,',
        'Drive the dark of doubt away;',
        'Giver of immortal gladness,',
        'Fill us with the light of day!',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'All Thy works with joy surround Thee,',
        'Earth and heaven reflect Thy rays,',
        'Stars and angels sing around Thee,',
        'Center of unbroken praise.',
        'Field and forest, vale and mountain,',
        'Flowery meadow, flashing sea,',
        'Singing bird and flowing fountain,',
        'Call us to rejoice in Thee.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Mortals join the mighty chorus',
        'Which the morning stars began;',
        'Father love is reigning o\u2019er us,',
        'Brother love binds man to man.',
        'Ever singing, march we onward,',
        'Victors in the midst of strife;',
        'Joyful music leads us sunward,',
        'In the triumph song of life.',
      ]},
    ],
  },
  {
    id: 'pd-blessed-assurance',
    title: 'Blessed Assurance',
    composers: ['Fanny Crosby (1873)', 'Phoebe Knapp (tune)'],
    primaryLanguage: 'en', availableLanguages: ['en'],
    genre: 'Hymn', defaultKey: 'D',
    rights: { status: 'public_domain', copyrightYear: 1873 },
    media: {},
    meta: { themes: ['assurance', 'testimony', 'joy'], scriptureRefs: ['Hebrews 10:22', '2 Timothy 1:12'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Blessed assurance, Jesus is mine!',
        'O what a foretaste of glory divine!',
        'Heir of salvation, purchase of God,',
        'Born of His Spirit, washed in His blood.',
      ]},
      { kind: 'chorus', language: 'en', lines: [
        'This is my story, this is my song,',
        'Praising my Saviour all the day long;',
        'This is my story, this is my song,',
        'Praising my Saviour all the day long.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Perfect submission, perfect delight,',
        'Visions of rapture now burst on my sight;',
        'Angels descending bring from above',
        'Echoes of mercy, whispers of love.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Perfect submission, all is at rest,',
        'I in my Saviour am happy and blest,',
        'Watching and waiting, looking above,',
        'Filled with His goodness, lost in His love.',
      ]},
    ],
  },
  {
    id: 'pd-what-a-friend',
    title: 'What a Friend We Have in Jesus',
    composers: ['Joseph Scriven (1855)', 'Charles Converse (1868, tune "Converse")'],
    primaryLanguage: 'en', availableLanguages: ['en'],
    genre: 'Hymn', defaultKey: 'F',
    rights: { status: 'public_domain', copyrightYear: 1855 },
    media: {},
    meta: { themes: ['prayer', 'friendship', 'comfort'], scriptureRefs: ['Proverbs 18:24', 'Philippians 4:6-7'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'What a friend we have in Jesus,',
        'All our sins and griefs to bear!',
        'What a privilege to carry',
        'Everything to God in prayer!',
        'O what peace we often forfeit,',
        'O what needless pain we bear,',
        'All because we do not carry',
        'Everything to God in prayer!',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Have we trials and temptations?',
        'Is there trouble anywhere?',
        'We should never be discouraged,',
        'Take it to the Lord in prayer.',
        'Can we find a friend so faithful,',
        'Who will all our sorrows share?',
        'Jesus knows our every weakness,',
        'Take it to the Lord in prayer.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Are we weak and heavy laden,',
        'Cumbered with a load of care?',
        'Precious Saviour, still our refuge,',
        'Take it to the Lord in prayer.',
        'Do thy friends despise, forsake thee?',
        'Take it to the Lord in prayer;',
        'In His arms He\u2019ll take and shield thee,',
        'Thou wilt find a solace there.',
      ]},
    ],
  },

  // ── PD batch 2 (Wesley corpus, additional Watts/Crosby, classics) ──────────

  {
    id: 'pd-andcanitbe',
    title: 'And Can It Be That I Should Gain',
    composers: ['Charles Wesley'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'G',
    rights: { status: 'public_domain', copyrightYear: 1738, publisher: 'Public Domain', notes: 'Text by Charles Wesley (1738).' },
    media: {},
    meta: { themes: ['atonement', 'grace', 'freedom'], scriptureRefs: ['Romans 8:1', 'Acts 16:26'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'And can it be that I should gain',
        'An interest in the Saviour\u2019s blood?',
        'Died He for me, who caused His pain?',
        'For me, who Him to death pursued?',
        'Amazing love! How can it be',
        'That Thou, my God, shouldst die for me?',
      ]},
      { kind: 'refrain', language: 'en', lines: [
        'Amazing love! How can it be',
        'That Thou, my God, shouldst die for me?',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Long my imprisoned spirit lay,',
        'Fast bound in sin and nature\u2019s night;',
        'Thine eye diffused a quickening ray,',
        'I woke, the dungeon flamed with light;',
        'My chains fell off, my heart was free,',
        'I rose, went forth and followed Thee.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'No condemnation now I dread;',
        'Jesus, and all in Him, is mine!',
        'Alive in Him, my living Head,',
        'And clothed in righteousness divine,',
        'Bold I approach the eternal throne,',
        'And claim the crown, through Christ, my own.',
      ]},
    ],
  },

  {
    id: 'pd-othousandtongues',
    title: 'O for a Thousand Tongues to Sing',
    composers: ['Charles Wesley'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'D',
    rights: { status: 'public_domain', copyrightYear: 1739, publisher: 'Public Domain', notes: 'Text by Charles Wesley (1739).' },
    media: {},
    meta: { themes: ['praise', 'name of Jesus'], scriptureRefs: ['Psalm 35:28', 'Acts 4:12'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'O for a thousand tongues to sing',
        'My great Redeemer\u2019s praise,',
        'The glories of my God and King,',
        'The triumphs of His grace!',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'My gracious Master and my God,',
        'Assist me to proclaim,',
        'To spread through all the earth abroad',
        'The honours of Thy name.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Jesus! the name that charms our fears,',
        'That bids our sorrows cease;',
        '\u2019Tis music in the sinner\u2019s ears,',
        '\u2019Tis life, and health, and peace.',
      ]},
      { kind: 'verse', number: 4, language: 'en', lines: [
        'He breaks the power of cancelled sin,',
        'He sets the prisoner free;',
        'His blood can make the foulest clean,',
        'His blood availed for me.',
      ]},
    ],
  },

  {
    id: 'pd-lovedivine',
    title: 'Love Divine, All Loves Excelling',
    composers: ['Charles Wesley'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'F',
    rights: { status: 'public_domain', copyrightYear: 1747, publisher: 'Public Domain', notes: 'Text by Charles Wesley (1747).' },
    media: {},
    meta: { themes: ['love', 'sanctification', 'indwelling'], scriptureRefs: ['1 John 4:8', 'Ephesians 3:17'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Love divine, all loves excelling,',
        'Joy of heaven, to earth come down,',
        'Fix in us Thy humble dwelling,',
        'All Thy faithful mercies crown.',
        'Jesus, Thou art all compassion,',
        'Pure, unbounded love Thou art;',
        'Visit us with Thy salvation,',
        'Enter every trembling heart.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Breathe, O breathe Thy loving Spirit',
        'Into every troubled breast;',
        'Let us all in Thee inherit,',
        'Let us find the promised rest.',
        'Take away the love of sinning;',
        'Alpha and Omega be;',
        'End of faith, as its beginning,',
        'Set our hearts at liberty.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Finish then Thy new creation,',
        'Pure and spotless let us be;',
        'Let us see Thy great salvation,',
        'Perfectly restored in Thee.',
        'Changed from glory into glory,',
        'Till in heaven we take our place,',
        'Till we cast our crowns before Thee,',
        'Lost in wonder, love, and praise.',
      ]},
    ],
  },

  {
    id: 'pd-harkherald',
    title: 'Hark! the Herald Angels Sing',
    composers: ['Charles Wesley', 'Felix Mendelssohn'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'F',
    rights: { status: 'public_domain', copyrightYear: 1739, publisher: 'Public Domain', notes: 'Text by Charles Wesley (1739), tune adapted from Mendelssohn (1840).' },
    media: {},
    meta: { themes: ['incarnation', 'nativity'], scriptureRefs: ['Luke 2:13-14'], liturgicalSeason: 'christmas' },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Hark! the herald angels sing,',
        '\u201CGlory to the newborn King;',
        'Peace on earth, and mercy mild,',
        'God and sinners reconciled!\u201D',
        'Joyful, all ye nations rise,',
        'Join the triumph of the skies;',
        'With the angelic host proclaim,',
        '\u201CChrist is born in Bethlehem!\u201D',
      ]},
      { kind: 'refrain', language: 'en', lines: [
        'Hark! the herald angels sing,',
        '\u201CGlory to the newborn King!\u201D',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Christ, by highest heaven adored,',
        'Christ, the everlasting Lord,',
        'Late in time behold Him come,',
        'Offspring of the Virgin\u2019s womb.',
        'Veiled in flesh the Godhead see;',
        'Hail the incarnate Deity,',
        'Pleased as man with us to dwell,',
        'Jesus, our Emmanuel!',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Hail the heaven-born Prince of Peace!',
        'Hail the Sun of Righteousness!',
        'Light and life to all He brings,',
        'Risen with healing in His wings.',
        'Mild He lays His glory by,',
        'Born that man no more may die,',
        'Born to raise the sons of earth,',
        'Born to give them second birth.',
      ]},
    ],
  },

  {
    id: 'pd-bethoumyvision',
    title: 'Be Thou My Vision',
    composers: ['Anonymous (8th c. Irish)', 'Mary E. Byrne (tr. 1905)', 'Eleanor Hull (vers. 1912)'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'Eb',
    rights: { status: 'public_domain', copyrightYear: 1912, publisher: 'Public Domain', notes: 'Irish hymn (8th c.); Byrne translation (1905); Hull versification (1912).' },
    media: {},
    meta: { themes: ['surrender', 'guidance'], scriptureRefs: ['Proverbs 3:5-6'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Be Thou my Vision, O Lord of my heart;',
        'Naught be all else to me, save that Thou art;',
        'Thou my best Thought, by day or by night,',
        'Waking or sleeping, Thy presence my light.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Be Thou my Wisdom, and Thou my true Word;',
        'I ever with Thee and Thou with me, Lord;',
        'Thou my great Father, I Thy true son;',
        'Thou in me dwelling, and I with Thee one.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Riches I heed not, nor man\u2019s empty praise,',
        'Thou mine inheritance, now and always;',
        'Thou and Thou only, first in my heart,',
        'High King of Heaven, my Treasure Thou art.',
      ]},
      { kind: 'verse', number: 4, language: 'en', lines: [
        'High King of Heaven, my victory won,',
        'May I reach Heaven\u2019s joys, O bright Heaven\u2019s Sun!',
        'Heart of my own heart, whatever befall,',
        'Still be my Vision, O Ruler of all.',
      ]},
    ],
  },

  {
    id: 'pd-allhailpower',
    title: 'All Hail the Power of Jesus\u2019 Name',
    composers: ['Edward Perronet'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'G',
    rights: { status: 'public_domain', copyrightYear: 1779, publisher: 'Public Domain', notes: 'Text by Edward Perronet (1779).' },
    media: {},
    meta: { themes: ['coronation', 'sovereignty', 'name of Jesus'], scriptureRefs: ['Philippians 2:9-11', 'Revelation 19:12'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'All hail the power of Jesus\u2019 name!',
        'Let angels prostrate fall;',
        'Bring forth the royal diadem,',
        'And crown Him Lord of all!',
        'Bring forth the royal diadem,',
        'And crown Him Lord of all!',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Ye chosen seed of Israel\u2019s race,',
        'Ye ransomed from the fall,',
        'Hail Him who saves you by His grace,',
        'And crown Him Lord of all!',
        'Hail Him who saves you by His grace,',
        'And crown Him Lord of all!',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Let every kindred, every tribe,',
        'On this terrestrial ball,',
        'To Him all majesty ascribe,',
        'And crown Him Lord of all!',
        'To Him all majesty ascribe,',
        'And crown Him Lord of all!',
      ]},
    ],
  },

  {
    id: 'pd-nearermygod',
    title: 'Nearer, My God, to Thee',
    composers: ['Sarah Flower Adams', 'Lowell Mason'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'F',
    rights: { status: 'public_domain', copyrightYear: 1841, publisher: 'Public Domain', notes: 'Text by Sarah Flower Adams (1841).' },
    media: {},
    meta: { themes: ['nearness', 'consolation'], scriptureRefs: ['Genesis 28:11-19'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Nearer, my God, to Thee, nearer to Thee!',
        'E\u2019en though it be a cross that raiseth me;',
        'Still all my song shall be,',
        'Nearer, my God, to Thee,',
        'Nearer, my God, to Thee, nearer to Thee!',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Though like the wanderer, the sun gone down,',
        'Darkness be over me, my rest a stone,',
        'Yet in my dreams I\u2019d be',
        'Nearer, my God, to Thee,',
        'Nearer, my God, to Thee, nearer to Thee!',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'There let the way appear steps unto heaven;',
        'All that Thou sendest me, in mercy given;',
        'Angels to beckon me',
        'Nearer, my God, to Thee,',
        'Nearer, my God, to Thee, nearer to Thee!',
      ]},
    ],
  },

  {
    id: 'pd-oldruggedcross',
    title: 'The Old Rugged Cross',
    composers: ['George Bennard'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'Bb',
    rights: { status: 'public_domain', copyrightYear: 1913, publisher: 'Public Domain', notes: 'Text and tune by George Bennard (1913); pre-1928 US works are public domain.' },
    media: {},
    meta: { themes: ['cross', 'redemption'], scriptureRefs: ['1 Corinthians 1:18'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'On a hill far away stood an old rugged cross,',
        'The emblem of suffering and shame;',
        'And I love that old cross where the dearest and best',
        'For a world of lost sinners was slain.',
      ]},
      { kind: 'refrain', language: 'en', lines: [
        'So I\u2019ll cherish the old rugged cross,',
        'Till my trophies at last I lay down;',
        'I will cling to the old rugged cross,',
        'And exchange it some day for a crown.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'O that old rugged cross, so despised by the world,',
        'Has a wondrous attraction for me;',
        'For the dear Lamb of God left His glory above',
        'To bear it to dark Calvary.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'In the old rugged cross, stained with blood so divine,',
        'A wondrous beauty I see;',
        'For \u2019twas on that old cross Jesus suffered and died',
        'To pardon and sanctify me.',
      ]},
      { kind: 'verse', number: 4, language: 'en', lines: [
        'To the old rugged cross I will ever be true,',
        'Its shame and reproach gladly bear;',
        'Then He\u2019ll call me some day to my home far away,',
        'Where His glory forever I\u2019ll share.',
      ]},
    ],
  },

  {
    id: 'pd-justasiam',
    title: 'Just As I Am',
    composers: ['Charlotte Elliott', 'William B. Bradbury'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'F',
    rights: { status: 'public_domain', copyrightYear: 1835, publisher: 'Public Domain', notes: 'Text by Charlotte Elliott (1835).' },
    media: {},
    meta: { themes: ['invitation', 'repentance'], scriptureRefs: ['John 6:37'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Just as I am, without one plea,',
        'But that Thy blood was shed for me,',
        'And that Thou bidd\u2019st me come to Thee,',
        'O Lamb of God, I come, I come.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Just as I am, and waiting not',
        'To rid my soul of one dark blot,',
        'To Thee whose blood can cleanse each spot,',
        'O Lamb of God, I come, I come.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Just as I am, though tossed about',
        'With many a conflict, many a doubt,',
        'Fightings and fears within, without,',
        'O Lamb of God, I come, I come.',
      ]},
      { kind: 'verse', number: 4, language: 'en', lines: [
        'Just as I am, Thou wilt receive,',
        'Wilt welcome, pardon, cleanse, relieve;',
        'Because Thy promise I believe,',
        'O Lamb of God, I come, I come.',
      ]},
    ],
  },

  {
    id: 'pd-ineedthee',
    title: 'I Need Thee Every Hour',
    composers: ['Annie S. Hawks', 'Robert Lowry'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'G',
    rights: { status: 'public_domain', copyrightYear: 1872, publisher: 'Public Domain', notes: 'Text by Annie S. Hawks (1872); refrain by Robert Lowry.' },
    media: {},
    meta: { themes: ['dependence', 'prayer'], scriptureRefs: ['John 15:5'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'I need Thee every hour, most gracious Lord;',
        'No tender voice like Thine can peace afford.',
      ]},
      { kind: 'refrain', language: 'en', lines: [
        'I need Thee, O I need Thee;',
        'Every hour I need Thee;',
        'O bless me now, my Saviour, I come to Thee.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'I need Thee every hour, stay Thou nearby;',
        'Temptations lose their power when Thou art nigh.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'I need Thee every hour, in joy or pain;',
        'Come quickly and abide, or life is vain.',
      ]},
      { kind: 'verse', number: 4, language: 'en', lines: [
        'I need Thee every hour, teach me Thy will;',
        'And Thy rich promises in me fulfill.',
      ]},
    ],
  },

  {
    id: 'pd-takemylife',
    title: 'Take My Life and Let It Be',
    composers: ['Frances R. Havergal'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'G',
    rights: { status: 'public_domain', copyrightYear: 1874, publisher: 'Public Domain', notes: 'Text by Frances R. Havergal (1874).' },
    media: {},
    meta: { themes: ['consecration', 'surrender'], scriptureRefs: ['Romans 12:1'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Take my life and let it be',
        'Consecrated, Lord, to Thee;',
        'Take my moments and my days,',
        'Let them flow in ceaseless praise.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Take my hands and let them move',
        'At the impulse of Thy love;',
        'Take my feet and let them be',
        'Swift and beautiful for Thee.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Take my voice and let me sing',
        'Always, only, for my King;',
        'Take my lips and let them be',
        'Filled with messages from Thee.',
      ]},
      { kind: 'verse', number: 4, language: 'en', lines: [
        'Take my silver and my gold,',
        'Not a mite would I withhold;',
        'Take my intellect and use',
        'Every power as Thou shalt choose.',
      ]},
      { kind: 'verse', number: 5, language: 'en', lines: [
        'Take my will and make it Thine,',
        'It shall be no longer mine;',
        'Take my heart, it is Thine own,',
        'It shall be Thy royal throne.',
      ]},
    ],
  },

  {
    id: 'pd-sweethourprayer',
    title: 'Sweet Hour of Prayer',
    composers: ['William W. Walford', 'William B. Bradbury'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'F',
    rights: { status: 'public_domain', copyrightYear: 1845, publisher: 'Public Domain', notes: 'Text attributed to William W. Walford (1845); tune by William B. Bradbury (1861).' },
    media: {},
    meta: { themes: ['prayer', 'communion'], scriptureRefs: ['Matthew 6:6'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Sweet hour of prayer! Sweet hour of prayer!',
        'That calls me from a world of care,',
        'And bids me at my Father\u2019s throne',
        'Make all my wants and wishes known.',
        'In seasons of distress and grief,',
        'My soul has often found relief,',
        'And oft escaped the tempter\u2019s snare,',
        'By thy return, sweet hour of prayer!',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Sweet hour of prayer! Sweet hour of prayer!',
        'The joys I feel, the bliss I share,',
        'Of those whose anxious spirits burn',
        'With strong desires for thy return!',
        'With such I hasten to the place',
        'Where God my Saviour shows His face,',
        'And gladly take my station there,',
        'And wait for thee, sweet hour of prayer!',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Sweet hour of prayer! Sweet hour of prayer!',
        'Thy wings shall my petition bear',
        'To Him whose truth and faithfulness',
        'Engage the waiting soul to bless.',
        'And since He bids me seek His face,',
        'Believe His word, and trust His grace,',
        'I\u2019ll cast on Him my every care,',
        'And wait for thee, sweet hour of prayer!',
      ]},
    ],
  },

  // ── PD batch 3 (additional canonical hymns) ────────────────────────────────

  {
    id: 'pd-doxology',
    title: 'Praise God from Whom All Blessings Flow (Doxology)',
    composers: ['Thomas Ken', 'Louis Bourgeois'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'G',
    rights: { status: 'public_domain', copyrightYear: 1674, publisher: 'Public Domain', notes: 'Text by Thomas Ken (1674); tune \u201COld 100th\u201D by Louis Bourgeois (1551).' },
    media: {},
    meta: { themes: ['doxology', 'praise', 'trinity'], scriptureRefs: ['Psalm 100', 'Ephesians 1:3'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Praise God, from whom all blessings flow;',
        'Praise Him, all creatures here below;',
        'Praise Him above, ye heavenly host;',
        'Praise Father, Son, and Holy Ghost. Amen.',
      ]},
    ],
  },

  {
    id: 'pd-forallthesaints',
    title: 'For All the Saints',
    composers: ['William Walsham How', 'Ralph Vaughan Williams'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'G',
    rights: { status: 'public_domain', copyrightYear: 1864, publisher: 'Public Domain', notes: 'Text by William Walsham How (1864).' },
    media: {},
    meta: { themes: ['saints', 'communion of saints', 'all saints'], scriptureRefs: ['Hebrews 12:1'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'For all the saints, who from their labours rest,',
        'Who Thee by faith before the world confessed,',
        'Thy name, O Jesus, be forever blessed.',
        'Alleluia, Alleluia!',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Thou wast their Rock, their Fortress, and their Might;',
        'Thou, Lord, their Captain in the well-fought fight;',
        'Thou, in the darkness drear, their one true Light.',
        'Alleluia, Alleluia!',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'O may Thy soldiers, faithful, true, and bold,',
        'Fight as the saints who nobly fought of old,',
        'And win, with them, the victor\u2019s crown of gold.',
        'Alleluia, Alleluia!',
      ]},
      { kind: 'verse', number: 4, language: 'en', lines: [
        'O blest communion, fellowship divine!',
        'We feebly struggle, they in glory shine;',
        'Yet all are one in Thee, for all are Thine.',
        'Alleluia, Alleluia!',
      ]},
    ],
  },

  {
    id: 'pd-onwardchristian',
    title: 'Onward, Christian Soldiers',
    composers: ['Sabine Baring-Gould', 'Arthur Sullivan'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'Eb',
    rights: { status: 'public_domain', copyrightYear: 1865, publisher: 'Public Domain', notes: 'Text by Sabine Baring-Gould (1865); tune by Arthur Sullivan (1871).' },
    media: {},
    meta: { themes: ['mission', 'church militant'], scriptureRefs: ['2 Timothy 2:3'] },
    lyrics: [
      { kind: 'refrain', language: 'en', lines: [
        'Onward, Christian soldiers, marching as to war,',
        'With the cross of Jesus going on before.',
        'Christ, the royal Master, leads against the foe;',
        'Forward into battle, see His banners go!',
      ]},
      { kind: 'verse', number: 1, language: 'en', lines: [
        'At the sign of triumph Satan\u2019s host doth flee;',
        'On then, Christian soldiers, on to victory!',
        'Hell\u2019s foundations quiver at the shout of praise;',
        'Brothers, lift your voices, loud your anthems raise.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Like a mighty army moves the church of God;',
        'Brothers, we are treading where the saints have trod.',
        'We are not divided, all one body we,',
        'One in hope and doctrine, one in charity.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Onward, then, ye people, join our happy throng,',
        'Blend with ours your voices in the triumph song.',
        'Glory, laud, and honour unto Christ the King,',
        'This through countless ages men and angels sing.',
      ]},
    ],
  },

  {
    id: 'pd-thereisafountain',
    title: 'There Is a Fountain Filled with Blood',
    composers: ['William Cowper', 'Lowell Mason'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'C',
    rights: { status: 'public_domain', copyrightYear: 1772, publisher: 'Public Domain', notes: 'Text by William Cowper (1772).' },
    media: {},
    meta: { themes: ['atonement', 'blood', 'cleansing'], scriptureRefs: ['Zechariah 13:1', '1 John 1:7'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'There is a fountain filled with blood',
        'Drawn from Immanuel\u2019s veins;',
        'And sinners plunged beneath that flood',
        'Lose all their guilty stains.',
        'Lose all their guilty stains,',
        'Lose all their guilty stains;',
        'And sinners plunged beneath that flood',
        'Lose all their guilty stains.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'The dying thief rejoiced to see',
        'That fountain in his day;',
        'And there have I, though vile as he,',
        'Washed all my sins away.',
        'Washed all my sins away,',
        'Washed all my sins away;',
        'And there have I, though vile as he,',
        'Washed all my sins away.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Dear dying Lamb, Thy precious blood',
        'Shall never lose its power,',
        'Till all the ransomed church of God',
        'Be saved, to sin no more.',
        'Be saved, to sin no more,',
        'Be saved, to sin no more;',
        'Till all the ransomed church of God',
        'Be saved, to sin no more.',
      ]},
    ],
  },

  {
    id: 'pd-standupforjesus',
    title: 'Stand Up, Stand Up for Jesus',
    composers: ['George Duffield Jr.', 'George J. Webb'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'Bb',
    rights: { status: 'public_domain', copyrightYear: 1858, publisher: 'Public Domain', notes: 'Text by George Duffield Jr. (1858).' },
    media: {},
    meta: { themes: ['courage', 'discipleship', 'mission'], scriptureRefs: ['Ephesians 6:13-14'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Stand up, stand up for Jesus,',
        'Ye soldiers of the cross;',
        'Lift high His royal banner,',
        'It must not suffer loss.',
        'From victory unto victory,',
        'His army shall He lead,',
        'Till every foe is vanquished,',
        'And Christ is Lord indeed.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Stand up, stand up for Jesus,',
        'The trumpet call obey;',
        'Forth to the mighty conflict,',
        'In this His glorious day.',
        'Ye that are men now serve Him',
        'Against unnumbered foes;',
        'Let courage rise with danger,',
        'And strength to strength oppose.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Stand up, stand up for Jesus,',
        'Stand in His strength alone;',
        'The arm of flesh will fail you,',
        'Ye dare not trust your own.',
        'Put on the gospel armour,',
        'Each piece put on with prayer;',
        'Where duty calls or danger,',
        'Be never wanting there.',
      ]},
    ],
  },

  {
    id: 'pd-myfaithlooks',
    title: 'My Faith Looks Up to Thee',
    composers: ['Ray Palmer', 'Lowell Mason'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'F',
    rights: { status: 'public_domain', copyrightYear: 1830, publisher: 'Public Domain', notes: 'Text by Ray Palmer (1830); tune \u201COlivet\u201D by Lowell Mason (1832).' },
    media: {},
    meta: { themes: ['faith', 'consecration'], scriptureRefs: ['Hebrews 12:2'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'My faith looks up to Thee,',
        'Thou Lamb of Calvary,',
        'Saviour divine;',
        'Now hear me while I pray,',
        'Take all my guilt away,',
        'O let me from this day',
        'Be wholly Thine!',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'May Thy rich grace impart',
        'Strength to my fainting heart,',
        'My zeal inspire;',
        'As Thou hast died for me,',
        'O may my love to Thee',
        'Pure, warm, and changeless be,',
        'A living fire!',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'While life\u2019s dark maze I tread,',
        'And griefs around me spread,',
        'Be Thou my guide;',
        'Bid darkness turn to day,',
        'Wipe sorrow\u2019s tears away,',
        'Nor let me ever stray',
        'From Thee aside.',
      ]},
    ],
  },

  {
    id: 'pd-tissosweet',
    title: '\u2019Tis So Sweet to Trust in Jesus',
    composers: ['Louisa M. R. Stead', 'William J. Kirkpatrick'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'Eb',
    rights: { status: 'public_domain', copyrightYear: 1882, publisher: 'Public Domain', notes: 'Text by Louisa M. R. Stead (1882).' },
    media: {},
    meta: { themes: ['trust', 'assurance'], scriptureRefs: ['Psalm 84:12', '1 Peter 2:7'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        '\u2019Tis so sweet to trust in Jesus,',
        'Just to take Him at His Word;',
        'Just to rest upon His promise,',
        'Just to know, \u201CThus saith the Lord!\u201D',
      ]},
      { kind: 'refrain', language: 'en', lines: [
        'Jesus, Jesus, how I trust Him!',
        'How I\u2019ve proved Him o\u2019er and o\u2019er!',
        'Jesus, Jesus, precious Jesus!',
        'O for grace to trust Him more!',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'O how sweet to trust in Jesus,',
        'Just to trust His cleansing blood;',
        'Just in simple faith to plunge me',
        '\u2019Neath the healing, cleansing flood!',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Yes, \u2019tis sweet to trust in Jesus,',
        'Just from sin and self to cease;',
        'Just from Jesus simply taking',
        'Life, and rest, and joy, and peace.',
      ]},
    ],
  },

  {
    id: 'pd-togodbeglory',
    title: 'To God Be the Glory',
    composers: ['Fanny J. Crosby', 'William H. Doane'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'Ab',
    rights: { status: 'public_domain', copyrightYear: 1875, publisher: 'Public Domain', notes: 'Text by Fanny J. Crosby (1875).' },
    media: {},
    meta: { themes: ['glory of God', 'redemption'], scriptureRefs: ['John 3:16', 'Ephesians 1:6'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'To God be the glory, great things He hath done!',
        'So loved He the world that He gave us His Son,',
        'Who yielded His life an atonement for sin,',
        'And opened the life-gate that all may go in.',
      ]},
      { kind: 'refrain', language: 'en', lines: [
        'Praise the Lord, praise the Lord,',
        'Let the earth hear His voice!',
        'Praise the Lord, praise the Lord,',
        'Let the people rejoice!',
        'O come to the Father, through Jesus the Son,',
        'And give Him the glory, great things He hath done!',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'O perfect redemption, the purchase of blood,',
        'To every believer the promise of God;',
        'The vilest offender who truly believes,',
        'That moment from Jesus a pardon receives.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Great things He hath taught us, great things He hath done,',
        'And great our rejoicing through Jesus the Son;',
        'But purer, and higher, and greater will be',
        'Our wonder, our transport, when Jesus we see.',
      ]},
    ],
  },

  {
    id: 'pd-trustandobey',
    title: 'Trust and Obey',
    composers: ['John H. Sammis', 'Daniel B. Towner'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'Eb',
    rights: { status: 'public_domain', copyrightYear: 1887, publisher: 'Public Domain', notes: 'Text by John H. Sammis (1887).' },
    media: {},
    meta: { themes: ['obedience', 'fellowship'], scriptureRefs: ['John 14:23', '1 John 1:7'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'When we walk with the Lord',
        'In the light of His Word,',
        'What a glory He sheds on our way!',
        'While we do His good will,',
        'He abides with us still,',
        'And with all who will trust and obey.',
      ]},
      { kind: 'refrain', language: 'en', lines: [
        'Trust and obey, for there\u2019s no other way',
        'To be happy in Jesus,',
        'But to trust and obey.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Not a burden we bear,',
        'Not a sorrow we share,',
        'But our toil He doth richly repay;',
        'Not a grief or a loss,',
        'Not a frown or a cross,',
        'But is blest if we trust and obey.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Then in fellowship sweet',
        'We will sit at His feet,',
        'Or we\u2019ll walk by His side in the way;',
        'What He says we will do,',
        'Where He sends we will go,',
        'Never fear, only trust and obey.',
      ]},
    ],
  },

  {
    id: 'pd-standingonpromises',
    title: 'Standing on the Promises',
    composers: ['Russell Kelso Carter'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'Bb',
    rights: { status: 'public_domain', copyrightYear: 1886, publisher: 'Public Domain', notes: 'Text and tune by Russell Kelso Carter (1886).' },
    media: {},
    meta: { themes: ['promises of God', 'assurance'], scriptureRefs: ['2 Peter 1:4'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Standing on the promises of Christ my King,',
        'Through eternal ages let His praises ring;',
        'Glory in the highest, I will shout and sing,',
        'Standing on the promises of God.',
      ]},
      { kind: 'refrain', language: 'en', lines: [
        'Standing, standing,',
        'Standing on the promises of God my Saviour;',
        'Standing, standing,',
        'I\u2019m standing on the promises of God.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Standing on the promises that cannot fail,',
        'When the howling storms of doubt and fear assail,',
        'By the living Word of God I shall prevail,',
        'Standing on the promises of God.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Standing on the promises I now can see',
        'Perfect, present cleansing in the blood for me;',
        'Standing in the liberty where Christ makes free,',
        'Standing on the promises of God.',
      ]},
    ],
  },

  {
    id: 'pd-atthecross',
    title: 'At the Cross',
    composers: ['Isaac Watts', 'Ralph E. Hudson'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'Bb',
    rights: { status: 'public_domain', copyrightYear: 1885, publisher: 'Public Domain', notes: 'Verses by Isaac Watts (1707); refrain by Ralph E. Hudson (1885).' },
    media: {},
    meta: { themes: ['cross', 'conversion'], scriptureRefs: ['Galatians 6:14'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Alas! and did my Saviour bleed,',
        'And did my Sovereign die?',
        'Would He devote that sacred head',
        'For such a worm as I?',
      ]},
      { kind: 'refrain', language: 'en', lines: [
        'At the cross, at the cross where I first saw the light,',
        'And the burden of my heart rolled away,',
        'It was there by faith I received my sight,',
        'And now I am happy all the day!',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Was it for crimes that I have done,',
        'He groaned upon the tree?',
        'Amazing pity! Grace unknown!',
        'And love beyond degree!',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'But drops of grief can ne\u2019er repay',
        'The debt of love I owe;',
        'Here, Lord, I give myself away,',
        '\u2019Tis all that I can do.',
      ]},
    ],
  },

  {
    id: 'pd-wonderfulwords',
    title: 'Wonderful Words of Life',
    composers: ['Philip P. Bliss'],
    primaryLanguage: 'en',
    availableLanguages: ['en'],
    genre: 'Hymn',
    defaultKey: 'F',
    rights: { status: 'public_domain', copyrightYear: 1874, publisher: 'Public Domain', notes: 'Text and tune by Philip P. Bliss (1874).' },
    media: {},
    meta: { themes: ['scripture', 'word of God'], scriptureRefs: ['John 6:68'] },
    lyrics: [
      { kind: 'verse', number: 1, language: 'en', lines: [
        'Sing them over again to me,',
        'Wonderful words of life;',
        'Let me more of their beauty see,',
        'Wonderful words of life.',
        'Words of life and beauty,',
        'Teach me faith and duty.',
      ]},
      { kind: 'refrain', language: 'en', lines: [
        'Beautiful words, wonderful words,',
        'Wonderful words of life;',
        'Beautiful words, wonderful words,',
        'Wonderful words of life.',
      ]},
      { kind: 'verse', number: 2, language: 'en', lines: [
        'Christ, the blessed One, gives to all',
        'Wonderful words of life;',
        'Sinner, list to the loving call,',
        'Wonderful words of life.',
        'All so freely given,',
        'Wooing us to heaven.',
      ]},
      { kind: 'verse', number: 3, language: 'en', lines: [
        'Sweetly echo the gospel call,',
        'Wonderful words of life;',
        'Offer pardon and peace to all,',
        'Wonderful words of life.',
        'Jesus, only Saviour,',
        'Sanctify forever.',
      ]},
    ],
  },
]

// ── Rights validation gate (enforces HARA-25.9 acceptance) ───────────────────

function validateRights(catalogue: SeedSong[]): void {
  const violations: string[] = []
  for (const s of catalogue) {
    if (s.rights.status === 'ccli_required' && s.lyrics.length > 0) {
      violations.push(`  - ${s.id} "${s.title}" (${s.artist ?? 'unknown'}): ccli_required with ${s.lyrics.length} hosted lyric section(s)`)
    }
    if (s.rights.status === 'public_domain' && s.lyrics.length === 0) {
      violations.push(`  - ${s.id} "${s.title}": public_domain but no lyrics (curation gap; expected structured lyrics)`)
    }
  }
  if (violations.length > 0) {
    console.error('Rights validation failed:')
    console.error(violations.join('\n'))
    throw new Error(`Rights validation failed: ${violations.length} violation(s) — aborting seed.`)
  }
}

// ── Seed runner ──────────────────────────────────────────────────────────────

async function run() {
  const catalogue: SeedSong[] = [...CCLI_CATALOGUE, ...PUBLIC_DOMAIN_HYMNS]

  validateRights(catalogue)

  const batch = db.batch()
  for (const song of catalogue) {
    batch.set(db.collection('songs').doc(song.id), {
      ...song,
      origin: 'seed',
      addedBy: 'seed',
      archived: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  }
  await batch.commit()

  const ccli = catalogue.filter(s => s.rights.status === 'ccli_required').length
  const pd = catalogue.filter(s => s.rights.status === 'public_domain').length
  console.log(`Seeded ${catalogue.length} songs into /songs (${ccli} CCLI link-out, ${pd} public-domain with full lyrics).`)
}

run().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1) })
