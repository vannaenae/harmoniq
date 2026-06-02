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
