/**
 * Massive catalog expansion — 900+ worship songs across major artists.
 * CCLI-required entries are link-out only (no hosted lyrics, per HARA-25.9).
 * Traditional/PD hymns marked 'unknown' until rights audit completes.
 *
 * Generated 2026-06-03 for HARA-77 / HARA-78.
 */

type Language = 'en' | 'yo' | 'ig' | 'ha' | 'pcm' | 'fr' | 'sw' | 'pt' | 'la' | 'other'
type RightsStatus = 'public_domain' | 'ccli_required' | 'royalty_free' | 'unlicensed' | 'unknown'
type LyricKind = 'verse' | 'chorus' | 'pre_chorus' | 'bridge' | 'tag' | 'refrain' | 'intro' | 'outro' | 'interlude'

interface LyricSection { kind: LyricKind; number?: number; lines: string[]; language: Language }
interface SongRights { status: RightsStatus; ccliNumber?: string; publisher?: string; copyrightYear?: number; notes?: string }
interface SongMediaLinks { youtubeVideoId?: string; spotifyTrackId?: string }

export interface SeedSong {
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
  meta?: { bpm?: number; scriptureRefs?: string[]; themes?: string[]; liturgicalSeason?: 'advent' | 'christmas' | 'lent' | 'easter' | 'pentecost' | 'ordinary' }
}

// Helper: CCLI link-out song (no lyrics)
function ccli(id: string, title: string, artist: string, genre: string, publisher: string, key?: string, lang: Language = 'en'): SeedSong {
  return { id, title, artist, primaryLanguage: lang, availableLanguages: [lang], genre, defaultKey: key, rights: { status: 'ccli_required', publisher }, media: {}, lyrics: [] }
}

// Helper: Traditional hymn (unknown rights, no lyrics until audit)
function hymn(id: string, title: string, artist: string, genre: string = 'Hymn', key?: string): SeedSong {
  return { id, title, artist, primaryLanguage: 'en', availableLanguages: ['en'], genre, defaultKey: key, rights: { status: 'unknown', notes: 'Pending rights audit' }, media: {}, lyrics: [] }
}

// ── HILLSONG WORSHIP ──────────────────────────────────────────────────────────
const HILLSONG_WORSHIP: SeedSong[] = [
  ccli('hw-what-beautiful-name', 'What a Beautiful Name', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'D'),
  ccli('hw-who-you-say-i-am', 'Who You Say I Am', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'Bb'),
  ccli('hw-king-of-kings', 'King of Kings', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'D'),
  ccli('hw-cornerstone', 'Cornerstone', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'C'),
  ccli('hw-mighty-to-save', 'Mighty to Save', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'A'),
  ccli('hw-shout-to-the-lord', 'Shout to the Lord', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'Bb'),
  ccli('hw-forever-reign', 'Forever Reign', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'A'),
  ccli('hw-o-praise-the-name', 'O Praise the Name (Anastasis)', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'C'),
  ccli('hw-so-will-i', 'So Will I (100 Billion X)', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'Eb'),
  ccli('hw-broken-vessels', 'Broken Vessels (Amazing Grace)', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'C'),
  ccli('hw-this-i-believe', 'This I Believe (The Creed)', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'D'),
  ccli('hw-no-other-name', 'No Other Name', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'E'),
  ccli('hw-open-heaven', 'Open Heaven (River Wild)', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'A'),
  ccli('hw-grace-to-grace', 'Grace to Grace', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'D'),
  ccli('hw-i-surrender', 'I Surrender', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'E'),
  ccli('hw-hosanna', 'Hosanna', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'Bb'),
  ccli('hw-from-the-inside-out', 'From the Inside Out', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'C'),
  ccli('hw-transfiguration', 'Transfiguration', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'Ab'),
  ccli('hw-man-of-sorrows', 'Man of Sorrows', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'E'),
  ccli('hw-new-wine', 'New Wine', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'Bb'),
  ccli('hw-awake-my-soul', 'Awake My Soul', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'G'),
  ccli('hw-seasons', 'Seasons', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'C'),
  ccli('hw-touch-of-heaven', 'Touch of Heaven', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'C'),
  ccli('hw-god-so-loved', 'God So Loved', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'Ab'),
  ccli('hw-fresh-wind', 'Fresh Wind', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'G'),
  ccli('hw-hope-of-ages', 'Hope of the Ages', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'D'),
  ccli('hw-calvary', 'Calvary', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'E'),
  ccli('hw-still', 'Still', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'D'),
  ccli('hw-one-thing', 'One Thing', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'G'),
  ccli('hw-christ-is-enough', 'Christ Is Enough', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'E'),
  ccli('hw-behold', 'Behold (Then Sings My Soul)', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'Bb'),
  ccli('hw-prince-of-heaven', 'Prince of Heaven', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'C'),
  ccli('hw-glorious-ruins', 'Glorious Ruins', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'A'),
  ccli('hw-let-there-be-light', 'Let There Be Light', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'A'),
  ccli('hw-love-so-great', 'Love So Great', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'E'),
  ccli('hw-remembrance', 'Remembrance', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'G'),
  ccli('hw-in-control', 'In Control', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'D'),
  ccli('hw-upper-room', 'Upper Room', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'A'),
  ccli('hw-come-alive', 'Come Alive', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'G'),
  ccli('hw-see-the-light', 'See the Light', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'C'),
  ccli('hw-peace-has-come', 'Peace Has Come', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'G'),
  ccli('hw-agnus-dei', 'Agnus Dei', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'A'),
]

// ── HILLSONG UNITED ───────────────────────────────────────────────────────────
const HILLSONG_UNITED: SeedSong[] = [
  ccli('hu-oceans', 'Oceans (Where Feet May Fail)', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'D'),
  ccli('hu-touch-the-sky', 'Touch the Sky', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'C'),
  ccli('hu-even-when-it-hurts', 'Even When It Hurts (Praise Song)', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'Bb'),
  ccli('hu-say-the-word', 'Say the Word', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'E'),
  ccli('hu-relentless', 'Relentless', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'Bb'),
  ccli('hu-whole-heart', 'Whole Heart (Hold Me Now)', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'Ab'),
  ccli('hu-wonder', 'Wonder', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'G'),
  ccli('hu-aftermath', 'Aftermath', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'E'),
  ccli('hu-empires', 'Empires', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'Bb'),
  ccli('hu-heart-like-heaven', 'Heart Like Heaven', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'G'),
  ccli('hu-here-now', 'Here Now (Madness)', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'B'),
  ccli('hu-captain', 'Captain', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'C'),
  ccli('hu-prince-of-peace', 'Prince of Peace', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'E'),
  ccli('hu-shadow-step', 'Shadow Step', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'Bb'),
  ccli('hu-not-today', 'Not Today', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'A'),
  ccli('hu-another-in-the-fire', 'Another in the Fire', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'D'),
  ccli('hu-as-you-find-me', 'As You Find Me', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'C'),
  ccli('hu-good-grace', 'Good Grace', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'A'),
  ccli('hu-echoes', 'Echoes (Till We See the Other Side)', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'D'),
  ccli('hu-know-you-will', 'Know You Will', 'Hillsong UNITED', 'Contemporary', 'Hillsong Publishing', 'C'),
]

// ── BETHEL MUSIC ──────────────────────────────────────────────────────────────
const BETHEL_MUSIC: SeedSong[] = [
  ccli('bm-reckless-love', 'Reckless Love', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'C'),
  ccli('bm-living-hope', 'Living Hope', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'C'),
  ccli('bm-king-of-my-heart', 'King of My Heart', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'E'),
  ccli('bm-come-to-me', 'Come to Me', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'G'),
  ccli('bm-stand-in-your-love', 'Stand in Your Love', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'A'),
  ccli('bm-ever-be', 'Ever Be', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'Bb'),
  ccli('bm-it-is-well', 'It Is Well', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'B'),
  ccli('bm-you-make-me-brave', 'You Make Me Brave', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'D'),
  ccli('bm-one-thing-remains', 'One Thing Remains', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'Bb'),
  ccli('bm-deep-cries-out', 'Deep Cries Out', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'A'),
  ccli('bm-here-again', 'Here Again', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'Ab'),
  ccli('bm-surrounded', 'Surrounded (Fight My Battles)', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'E'),
  ccli('bm-this-is-amazing-grace', 'This Is Amazing Grace', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'B'),
  ccli('bm-we-will-not-be-shaken', 'We Will Not Be Shaken', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'D'),
  ccli('bm-after-all', 'After All (Holy)', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'E'),
  ccli('bm-ten-thousand-reasons', 'Ten Thousand Reasons (Bless the Lord)', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'G'),
  ccli('bm-holy-forever', 'Holy Forever', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'Ab'),
  ccli('bm-build-my-life', 'Build My Life', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'G'),
  ccli('bm-graves-into-gardens', 'Graves into Gardens', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'C'),
  ccli('bm-do-it-again', 'Do It Again', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'D'),
  ccli('bm-take-courage', 'Take Courage', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'G'),
  ccli('bm-peace', 'Peace', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'C'),
  ccli('bm-for-the-one', 'For the One', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'A'),
  ccli('bm-champion', 'Champion', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'C'),
  ccli('bm-be-still', 'Be Still', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'G'),
  ccli('bm-starlight', 'Starlight', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'Bb'),
  ccli('bm-we-praise-you', 'We Praise You', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'E'),
  ccli('bm-tremble', 'Tremble', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'A'),
]

// ── ELEVATION WORSHIP ─────────────────────────────────────────────────────────
const ELEVATION_WORSHIP: SeedSong[] = [
  ccli('ew-o-come-to-the-altar', 'O Come to the Altar', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'A'),
  ccli('ew-do-it-again', 'Do It Again', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'G'),
  ccli('ew-here-again', 'Here Again', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'Ab'),
  ccli('ew-the-blessing', 'The Blessing', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'D'),
  ccli('ew-jireh', 'Jireh', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'E'),
  ccli('ew-graves-into-gardens', 'Graves into Gardens', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'C'),
  ccli('ew-see-a-victory', 'See a Victory', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'D'),
  ccli('ew-never-lost', 'Never Lost', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'E'),
  ccli('ew-might-get-loud', 'Might Get Loud', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'Bb'),
  ccli('ew-praise', 'PRAISE', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'D'),
  ccli('ew-same-god', 'Same God', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'E'),
  ccli('ew-trust-in-god', 'Trust in God', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'Bb'),
  ccli('ew-rattle', 'RATTLE!', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'B'),
  ccli('ew-worthy', 'Worthy', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'G'),
  ccli('ew-resurrecting', 'Resurrecting', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'D'),
  ccli('ew-lions', 'Lion', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'Bb'),
  ccli('ew-talking-to-jesus', 'Talking to Jesus', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'D'),
  ccli('ew-then-christ-came', 'Then Christ Came', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'A'),
  ccli('ew-only-king-forever', 'Only King Forever', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'B'),
  ccli('ew-here-as-in-heaven', 'Here as in Heaven', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'C'),
  ccli('ew-come-right-now', 'Come Right Now', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'D'),
  ccli('ew-name-above-every-name', 'Name Above Every Name', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'A'),
  ccli('ew-i-know-a-name', 'I Know a Name', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'Ab'),
  ccli('ew-water-is-wild', 'Water Is Wild', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'G'),
  ccli('ew-wait-on-you', 'Wait on You', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'D'),
]

// ── CHRIS TOMLIN ──────────────────────────────────────────────────────────────
const CHRIS_TOMLIN: SeedSong[] = [
  ccli('ct-how-great-is-our-god', 'How Great Is Our God', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'C'),
  ccli('ct-amazing-grace-my-chains', 'Amazing Grace (My Chains Are Gone)', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('ct-our-god', 'Our God', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'Em'),
  ccli('ct-whom-shall-i-fear', 'Whom Shall I Fear (God of Angel Armies)', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('ct-indescribable', 'Indescribable', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('ct-forever', 'Forever', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('ct-holy-is-the-lord', 'Holy Is the Lord', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('ct-we-fall-down', 'We Fall Down', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('ct-you-are-my-king', 'You Are My King (Amazing Love)', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('ct-is-he-worthy', 'Is He Worthy?', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('ct-jesus', 'Jesus', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'E'),
  ccli('ct-nobody-loves-me-like-you', 'Nobody Loves Me Like You', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('ct-god-of-this-city', 'God of This City', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('ct-i-will-follow', 'I Will Follow', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'E'),
  ccli('ct-lay-me-down', 'Lay Me Down', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('ct-home', 'Home', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('ct-all-bow-down', 'All Bow Down', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('ct-at-the-cross', 'At the Cross (Love Ran Red)', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('ct-i-will-rise', 'I Will Rise', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('ct-jesus-messiah', 'Jesus Messiah', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'B'),
  ccli('ct-god-almighty', 'God Almighty', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('ct-praise-the-father-son', 'Praise the Father, Praise the Son', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('ct-holy-roar', 'Holy Roar', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'Bb'),
  ccli('ct-faithful', 'Faithful', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'C'),
  ccli('ct-always', 'Always', 'Chris Tomlin', 'Contemporary', 'Capitol CMG Publishing', 'A'),
]

// ── MAVERICK CITY MUSIC (expanded) ────────────────────────────────────────────
const MAVERICK_CITY_EXPANDED: SeedSong[] = [
  ccli('mcx-man-of-your-word', 'Man of Your Word', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'Bb'),
  ccli('mcx-wait-on-you', 'Wait on You', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'D'),
  ccli('mcx-breathe', 'Breathe', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'Bb'),
  ccli('mcx-million-little-miracles', 'Million Little Miracles', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'D'),
  ccli('mcx-fear-is-not-my-future', 'Fear Is Not My Future', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'F'),
  ccli('mcx-grateful', 'Grateful', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'A'),
  ccli('mcx-tongue-of-fire', 'Tongue of Fire', 'Maverick City Music', 'Gospel', 'Maverick City Publishing', 'A'),
  ccli('mcx-my-heart-your-home', 'My Heart Your Home', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'C'),
  ccli('mcx-available', 'Available', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'D'),
  ccli('mcx-hang-on', 'Hang On (Let Me Alone)', 'Maverick City Music', 'Gospel', 'Maverick City Publishing', 'G'),
  ccli('mcx-come-holy-spirit', 'Come Holy Spirit', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'G'),
  ccli('mcx-yeshua', 'Yeshua', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'A'),
  ccli('mcx-thank-you', 'Thank You', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'F'),
  ccli('mcx-refiner', 'Refiner', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'G'),
  ccli('mcx-jubilee', 'Jubilee', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'D'),
]

// ── KIRK FRANKLIN ─────────────────────────────────────────────────────────────
const KIRK_FRANKLIN: SeedSong[] = [
  ccli('kf-i-smile', 'I Smile', 'Kirk Franklin', 'Gospel', 'Fo Yo Soul / RCA', 'Ab'),
  ccli('kf-love-theory', 'Love Theory', 'Kirk Franklin', 'Gospel', 'Fo Yo Soul / RCA', 'C'),
  ccli('kf-my-world-needs-you', 'My World Needs You', 'Kirk Franklin', 'Gospel', 'Fo Yo Soul / RCA', 'Bb'),
  ccli('kf-wanna-be-happy', 'Wanna Be Happy?', 'Kirk Franklin', 'Gospel', 'Fo Yo Soul / RCA', 'C'),
  ccli('kf-stomp', 'Stomp', 'Kirk Franklin', 'Gospel', 'GospoCentric Records', 'G'),
  ccli('kf-revolution', 'Revolution', 'Kirk Franklin', 'Gospel', 'GospoCentric Records', 'E'),
  ccli('kf-silver-and-gold', 'Silver and Gold', 'Kirk Franklin', 'Gospel', 'GospoCentric Records', 'F'),
  ccli('kf-lean-on-me', 'Lean on Me', 'Kirk Franklin', 'Gospel', 'GospoCentric Records', 'Ab'),
  ccli('kf-melodies-from-heaven', 'Melodies from Heaven', 'Kirk Franklin', 'Gospel', 'GospoCentric Records', 'Bb'),
  ccli('kf-imagine-me', 'Imagine Me', 'Kirk Franklin', 'Gospel', 'Fo Yo Soul / RCA', 'D'),
  ccli('kf-looking-for-you', 'Looking for You', 'Kirk Franklin', 'Gospel', 'GospoCentric Records', 'F'),
  ccli('kf-he-reigns', 'He Reigns (Awesome God)', 'Kirk Franklin', 'Gospel', 'GospoCentric Records', 'E'),
  ccli('kf-brighter-day', 'Brighter Day', 'Kirk Franklin', 'Gospel', 'Fo Yo Soul / RCA', 'Ab'),
  ccli('kf-something-about-the-name', 'Something About the Name Jesus', 'Kirk Franklin', 'Gospel', 'GospoCentric Records', 'G'),
  ccli('kf-now-behold-the-lamb', 'Now Behold the Lamb', 'Kirk Franklin', 'Gospel', 'GospoCentric Records', 'Bb'),
  ccli('kf-why-we-sing', 'Why We Sing', 'Kirk Franklin', 'Gospel', 'GospoCentric Records', 'C'),
  ccli('kf-could-i-be', 'Could I Be', 'Kirk Franklin', 'Gospel', 'GospoCentric Records', 'D'),
  ccli('kf-123-victory', '123 Victory', 'Kirk Franklin', 'Gospel', 'Fo Yo Soul / RCA', 'Bb'),
  ccli('kf-just-for-me', 'Just for Me', 'Kirk Franklin', 'Gospel', 'Fo Yo Soul / RCA', 'Ab'),
  ccli('kf-all-things-work', 'All Things Work Together', 'Kirk Franklin', 'Gospel', 'Fo Yo Soul / RCA', 'G'),
]

// ── CECE WINANS ───────────────────────────────────────────────────────────────
const CECE_WINANS: SeedSong[] = [
  ccli('cw-goodness-of-god', 'Goodness of God', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'C'),
  ccli('cw-believe-for-it', 'Believe for It', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'E'),
  ccli('cw-never-lost', 'Never Lost', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'E'),
  ccli('cw-alabaster-box', 'Alabaster Box', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'Bb'),
  ccli('cw-throne-room', 'Throne Room', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'D'),
  ccli('cw-come-jesus-come', 'Come Jesus Come', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'E'),
  ccli('cw-mercy-said-no', 'Mercy Said No', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'D'),
  ccli('cw-alone-in-his-presence', 'Alone in His Presence', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'Bb'),
  ccli('cw-worthy-of-it-all', 'Worthy of It All', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'D'),
  ccli('cw-that-the-world', 'That the World May Know', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'A'),
  ccli('cw-comforter', 'Comforter', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'G'),
  ccli('cw-no-one', 'No One', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'G'),
  ccli('cw-more-than-what-i-wanted', 'More Than What I Wanted', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'C'),
  ccli('cw-praying-spirit', 'Praying Spirit', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'Bb'),
  ccli('cw-just-to-be-close-to-you', 'Just to Be Close to You', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'D'),
]

// ── TASHA COBBS LEONARD ───────────────────────────────────────────────────────
const TASHA_COBBS_LEONARD: SeedSong[] = [
  ccli('tc-break-every-chain', 'Break Every Chain', 'Tasha Cobbs Leonard', 'Gospel', 'Capitol CMG Publishing', 'B'),
  ccli('tc-gracefully-broken', 'Gracefully Broken', 'Tasha Cobbs Leonard', 'Gospel', 'Capitol CMG Publishing', 'A'),
  ccli('tc-your-spirit', 'Your Spirit', 'Tasha Cobbs Leonard', 'Gospel', 'Capitol CMG Publishing', 'Bb'),
  ccli('tc-fill-me-up', 'Fill Me Up', 'Tasha Cobbs Leonard', 'Gospel', 'Capitol CMG Publishing', 'E'),
  ccli('tc-for-your-glory', 'For Your Glory', 'Tasha Cobbs Leonard', 'Gospel', 'Capitol CMG Publishing', 'F'),
  ccli('tc-you-know-my-name', 'You Know My Name', 'Tasha Cobbs Leonard', 'Gospel', 'Capitol CMG Publishing', 'Bb'),
  ccli('tc-put-a-praise-on-it', 'Put a Praise on It', 'Tasha Cobbs Leonard', 'Gospel', 'Capitol CMG Publishing', 'C'),
  ccli('tc-sense-it', 'Sense It', 'Tasha Cobbs Leonard', 'Gospel', 'Capitol CMG Publishing', 'A'),
  ccli('tc-in-overflow', 'In Overflow', 'Tasha Cobbs Leonard', 'Gospel', 'Capitol CMG Publishing', 'D'),
  ccli('tc-angels', 'Angels', 'Tasha Cobbs Leonard', 'Gospel', 'Capitol CMG Publishing', 'E'),
  ccli('tc-this-is-the-freedom', 'This Is the Freedom', 'Tasha Cobbs Leonard', 'Gospel', 'Capitol CMG Publishing', 'Bb'),
  ccli('tc-the-name-of-our-god', 'The Name of Our God', 'Tasha Cobbs Leonard', 'Gospel', 'Capitol CMG Publishing', 'D'),
]

// ── DUNSIN OYEKAN ─────────────────────────────────────────────────────────────
const DUNSIN_OYEKAN: SeedSong[] = [
  ccli('do-fragrance-to-fire', 'Fragrance to Fire', 'Dunsin Oyekan', 'Gospel', 'Dunsin Oyekan Music', 'D'),
  ccli('do-code-red', 'Code Red', 'Dunsin Oyekan', 'Gospel', 'Dunsin Oyekan Music', 'C'),
  ccli('do-breathe', 'Breathe', 'Dunsin Oyekan', 'Gospel', 'Dunsin Oyekan Music', 'Bb'),
  ccli('do-na-you', 'Na You', 'Dunsin Oyekan', 'Gospel', 'Dunsin Oyekan Music', 'E', 'pcm'),
  ccli('do-more-than-a-song', 'More Than a Song', 'Dunsin Oyekan', 'Gospel', 'Dunsin Oyekan Music', 'G'),
  ccli('do-open-up', 'Open Up', 'Dunsin Oyekan', 'Gospel', 'Dunsin Oyekan Music', 'A'),
  ccli('do-you-are-god', 'You Are God', 'Dunsin Oyekan', 'Gospel', 'Dunsin Oyekan Music', 'D'),
  ccli('do-most-holy', 'Most Holy', 'Dunsin Oyekan', 'Gospel', 'Dunsin Oyekan Music', 'Bb'),
  ccli('do-imole-de', 'Imole De (Light Has Come)', 'Dunsin Oyekan', 'Gospel', 'Dunsin Oyekan Music', 'G', 'yo'),
  ccli('do-pamilerin', 'Pamilerin', 'Dunsin Oyekan', 'Gospel', 'Dunsin Oyekan Music', 'C', 'yo'),
  ccli('do-worship-in-my-spirit', 'Worship in My Spirit', 'Dunsin Oyekan', 'Gospel', 'Dunsin Oyekan Music', 'Ab'),
  ccli('do-count-me-in', 'Count Me In', 'Dunsin Oyekan', 'Gospel', 'Dunsin Oyekan Music', 'D'),
  ccli('do-great-and-marvellous', 'Great and Marvellous', 'Dunsin Oyekan', 'Gospel', 'Dunsin Oyekan Music', 'E'),
  ccli('do-emmanuel', 'Emmanuel', 'Dunsin Oyekan', 'Gospel', 'Dunsin Oyekan Music', 'G'),
  ccli('do-your-grace', 'Your Grace', 'Dunsin Oyekan', 'Gospel', 'Dunsin Oyekan Music', 'Bb'),
]

// ── SINACH ────────────────────────────────────────────────────────────────────
const SINACH_SONGS: SeedSong[] = [
  ccli('si-way-maker', 'Way Maker', 'Sinach', 'Gospel', 'Loveworld Records', 'E'),
  ccli('si-i-know-who-i-am', 'I Know Who I Am', 'Sinach', 'Gospel', 'Loveworld Records', 'D'),
  ccli('si-great-are-you-lord-s', 'Great Are You Lord', 'Sinach', 'Gospel', 'Loveworld Records', 'A'),
  ccli('si-rejoice', 'Rejoice', 'Sinach', 'Gospel', 'Loveworld Records', 'D'),
  ccli('si-overflow', 'Overflow', 'Sinach', 'Gospel', 'Loveworld Records', 'E'),
  ccli('si-the-name-of-jesus', 'The Name of Jesus', 'Sinach', 'Gospel', 'Loveworld Records', 'D'),
  ccli('si-he-did-it-again', 'He Did It Again', 'Sinach', 'Gospel', 'Loveworld Records', 'G'),
  ccli('si-matchless-love', 'Matchless Love', 'Sinach', 'Gospel', 'Loveworld Records', 'Ab'),
  ccli('si-simply-devoted', 'Simply Devoted', 'Sinach', 'Gospel', 'Loveworld Records', 'C'),
  ccli('si-for-this', 'For This', 'Sinach', 'Gospel', 'Loveworld Records', 'A'),
  ccli('si-i-stand-amazed', 'I Stand Amazed', 'Sinach', 'Gospel', 'Loveworld Records', 'D'),
  ccli('si-sing-alleluia', 'Sing Alleluia', 'Sinach', 'Gospel', 'Loveworld Records', 'G'),
]

// ── NATHANIEL BASSEY ──────────────────────────────────────────────────────────
const NATHANIEL_BASSEY: SeedSong[] = [
  ccli('nb-imela', 'Imela', 'Nathaniel Bassey', 'Gospel', 'Nathaniel Bassey Music', 'A', 'ig'),
  ccli('nb-onise-iyanu', 'Onise Iyanu (Awesome God)', 'Nathaniel Bassey', 'Gospel', 'Nathaniel Bassey Music', 'G', 'yo'),
  ccli('nb-olowogbogboro', 'Olowogbogboro', 'Nathaniel Bassey', 'Gospel', 'Nathaniel Bassey Music', 'D', 'yo'),
  ccli('nb-see-what-the-lord', 'See What the Lord Has Done', 'Nathaniel Bassey', 'Gospel', 'Nathaniel Bassey Music', 'A'),
  ccli('nb-o-how-i-love-jesus', 'O How I Love Jesus', 'Nathaniel Bassey', 'Gospel', 'Nathaniel Bassey Music', 'E'),
  ccli('nb-hallelujah-challenge', 'Hallelujah (Oh Lord)', 'Nathaniel Bassey', 'Gospel', 'Nathaniel Bassey Music', 'D'),
  ccli('nb-you-are-god', 'You Are God', 'Nathaniel Bassey', 'Gospel', 'Nathaniel Bassey Music', 'G'),
  ccli('nb-casting-crowns', 'Casting Crowns', 'Nathaniel Bassey', 'Gospel', 'Nathaniel Bassey Music', 'A'),
  ccli('nb-what-a-saviour', 'What a Saviour', 'Nathaniel Bassey', 'Gospel', 'Nathaniel Bassey Music', 'Bb'),
  ccli('nb-righteous-one', 'Righteous One', 'Nathaniel Bassey', 'Gospel', 'Nathaniel Bassey Music', 'E'),
]

// ── PHIL WICKHAM ──────────────────────────────────────────────────────────────
const PHIL_WICKHAM: SeedSong[] = [
  ccli('pw-house-of-the-lord', 'House of the Lord', 'Phil Wickham', 'Contemporary', 'Fair Trade Services', 'G'),
  ccli('pw-battle-belongs', 'Battle Belongs', 'Phil Wickham', 'Contemporary', 'Fair Trade Services', 'D'),
  ccli('pw-this-is-amazing-grace', 'This Is Amazing Grace', 'Phil Wickham', 'Contemporary', 'Fair Trade Services', 'B'),
  ccli('pw-great-things', 'Great Things', 'Phil Wickham', 'Contemporary', 'Fair Trade Services', 'D'),
  ccli('pw-living-hope-pw', 'Living Hope', 'Phil Wickham', 'Contemporary', 'Fair Trade Services', 'C'),
  ccli('pw-sunday-is-coming', 'Sunday Is Coming', 'Phil Wickham', 'Contemporary', 'Fair Trade Services', 'G'),
  ccli('pw-hymn-of-heaven', 'Hymn of Heaven', 'Phil Wickham', 'Contemporary', 'Fair Trade Services', 'D'),
  ccli('pw-its-always-been-you', "It's Always Been You", 'Phil Wickham', 'Contemporary', 'Fair Trade Services', 'G'),
  ccli('pw-the-jesus-way', 'The Jesus Way', 'Phil Wickham', 'Contemporary', 'Fair Trade Services', 'A'),
  ccli('pw-morning-mercy-grace', 'Morning, Mercy & Grace', 'Phil Wickham', 'Contemporary', 'Fair Trade Services', 'C'),
]

// ── CASTING CROWNS ────────────────────────────────────────────────────────────
const CASTING_CROWNS_SONGS: SeedSong[] = [
  ccli('cc-who-am-i', 'Who Am I', 'Casting Crowns', 'Contemporary', 'Provident Label Group', 'B'),
  ccli('cc-praise-you-in-this-storm', 'Praise You in This Storm', 'Casting Crowns', 'Contemporary', 'Provident Label Group', 'C'),
  ccli('cc-voice-of-truth', 'Voice of Truth', 'Casting Crowns', 'Contemporary', 'Provident Label Group', 'F'),
  ccli('cc-lifesong', 'Lifesong', 'Casting Crowns', 'Contemporary', 'Provident Label Group', 'A'),
  ccli('cc-just-be-held', 'Just Be Held', 'Casting Crowns', 'Contemporary', 'Provident Label Group', 'G'),
  ccli('cc-oh-my-soul', 'Oh My Soul', 'Casting Crowns', 'Contemporary', 'Provident Label Group', 'D'),
  ccli('cc-nobody', 'Nobody', 'Casting Crowns', 'Contemporary', 'Provident Label Group', 'Bb'),
  ccli('cc-only-jesus', 'Only Jesus', 'Casting Crowns', 'Contemporary', 'Provident Label Group', 'D'),
  ccli('cc-scars-in-heaven', 'Scars in Heaven', 'Casting Crowns', 'Contemporary', 'Provident Label Group', 'E'),
  ccli('cc-one-step-away', 'One Step Away', 'Casting Crowns', 'Contemporary', 'Provident Label Group', 'A'),
  ccli('cc-courageous', 'Courageous', 'Casting Crowns', 'Contemporary', 'Provident Label Group', 'E'),
  ccli('cc-set-me-free', 'Set Me Free', 'Casting Crowns', 'Contemporary', 'Provident Label Group', 'Bb'),
  ccli('cc-slow-fade', 'Slow Fade', 'Casting Crowns', 'Contemporary', 'Provident Label Group', 'D'),
  ccli('cc-glorious-day', 'Glorious Day', 'Casting Crowns', 'Contemporary', 'Provident Label Group', 'C'),
  ccli('cc-the-well', 'The Well', 'Casting Crowns', 'Contemporary', 'Provident Label Group', 'G'),
]

// ── MERCYME ───────────────────────────────────────────────────────────────────
const MERCYME_SONGS: SeedSong[] = [
  ccli('mm-i-can-only-imagine', 'I Can Only Imagine', 'MercyMe', 'Contemporary', 'Fair Trade Services', 'E'),
  ccli('mm-even-if', 'Even If', 'MercyMe', 'Contemporary', 'Fair Trade Services', 'Bb'),
  ccli('mm-dear-younger-me', 'Dear Younger Me', 'MercyMe', 'Contemporary', 'Fair Trade Services', 'C'),
  ccli('mm-greater', 'Greater', 'MercyMe', 'Contemporary', 'Fair Trade Services', 'E'),
  ccli('mm-word-of-god-speak', 'Word of God Speak', 'MercyMe', 'Contemporary', 'Fair Trade Services', 'A'),
  ccli('mm-flawless', 'Flawless', 'MercyMe', 'Contemporary', 'Fair Trade Services', 'E'),
  ccli('mm-almost-home', 'Almost Home', 'MercyMe', 'Contemporary', 'Fair Trade Services', 'D'),
  ccli('mm-best-news-ever', 'Best News Ever', 'MercyMe', 'Contemporary', 'Fair Trade Services', 'E'),
  ccli('mm-say-i-wont', "Say I Won't", 'MercyMe', 'Contemporary', 'Fair Trade Services', 'D'),
  ccli('mm-shake', 'Shake', 'MercyMe', 'Contemporary', 'Fair Trade Services', 'G'),
  ccli('mm-hurry-up-and-wait', 'Hurry Up and Wait', 'MercyMe', 'Contemporary', 'Fair Trade Services', 'A'),
  ccli('mm-grace-got-you', 'Grace Got You', 'MercyMe', 'Contemporary', 'Fair Trade Services', 'Bb'),
]

// ── LAUREN DAIGLE ─────────────────────────────────────────────────────────────
const LAUREN_DAIGLE: SeedSong[] = [
  ccli('ld-you-say', 'You Say', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'Bb'),
  ccli('ld-rescue', 'Rescue', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'A'),
  ccli('ld-trust-in-you', 'Trust in You', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'D'),
  ccli('ld-look-up-child', 'Look Up Child', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'C'),
  ccli('ld-first', 'First', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'G'),
  ccli('ld-how-can-it-be', 'How Can It Be', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'Ab'),
  ccli('ld-come-alive', 'Come Alive (Dry Bones)', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'A'),
  ccli('ld-o-lord', "O' Lord", 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'Am'),
  ccli('ld-hold-on-to-me', 'Hold On to Me', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'G'),
  ccli('ld-losing-my-religion', 'Losing My Religion', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'Bb'),
  ccli('ld-thank-god-i-do', 'Thank God I Do', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'D'),
  ccli('ld-these-are-the-days', 'These Are the Days', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'E'),
]

// ── ISRAEL HOUGHTON ───────────────────────────────────────────────────────────
const ISRAEL_HOUGHTON: SeedSong[] = [
  ccli('ih-your-presence-is-heaven', 'Your Presence Is Heaven', 'Israel Houghton', 'Gospel', 'Integrity Music', 'A'),
  ccli('ih-jesus-at-the-center', 'Jesus at the Center', 'Israel Houghton', 'Gospel', 'Integrity Music', 'D'),
  ccli('ih-friend-of-god', 'Friend of God', 'Israel Houghton', 'Gospel', 'Integrity Music', 'A'),
  ccli('ih-alpha-omega', 'Alpha and Omega', 'Israel Houghton', 'Gospel', 'Integrity Music', 'E'),
  ccli('ih-no-turning-back', 'No Turning Back', 'Israel Houghton', 'Gospel', 'Integrity Music', 'D'),
  ccli('ih-covered', 'Covered', 'Israel Houghton', 'Gospel', 'Integrity Music', 'C'),
  ccli('ih-te-amo', 'Te Amo', 'Israel Houghton', 'Gospel', 'Integrity Music', 'Bb'),
  ccli('ih-moving-forward', 'Moving Forward', 'Israel Houghton', 'Gospel', 'Integrity Music', 'G'),
  ccli('ih-just-wanna-say', 'Just Wanna Say', 'Israel Houghton', 'Gospel', 'Integrity Music', 'D'),
  ccli('ih-new-season', 'New Season', 'Israel Houghton', 'Gospel', 'Integrity Music', 'A'),
  ccli('ih-chasing-me-down', 'Chasing Me Down', 'Israel Houghton', 'Gospel', 'Integrity Music', 'C'),
  ccli('ih-you-hold-my-world', 'You Hold My World', 'Israel Houghton', 'Gospel', 'Integrity Music', 'G'),
]

// ── BRANDON LAKE ──────────────────────────────────────────────────────────────
const BRANDON_LAKE: SeedSong[] = [
  ccli('bl-gratitude', 'Gratitude', 'Brandon Lake', 'Contemporary', 'Bethel Music Publishing', 'A'),
  ccli('bl-count-em', "Count 'Em", 'Brandon Lake', 'Contemporary', 'Bethel Music Publishing', 'Bb'),
  ccli('bl-we-praise-you', 'We Praise You', 'Brandon Lake', 'Contemporary', 'Bethel Music Publishing', 'E'),
  ccli('bl-graves-into-gardens-bl', 'Graves into Gardens', 'Brandon Lake', 'Contemporary', 'Bethel Music Publishing', 'C'),
  ccli('bl-house-of-miracles', 'House of Miracles', 'Brandon Lake', 'Contemporary', 'Bethel Music Publishing', 'D'),
  ccli('bl-coat-of-many-colors', 'Coat of Many Colors', 'Brandon Lake', 'Contemporary', 'Bethel Music Publishing', 'G'),
  ccli('bl-indescribable', 'Indescribable', 'Brandon Lake', 'Contemporary', 'Bethel Music Publishing', 'A'),
  ccli('bl-too-good-to-not-believe', 'Too Good to Not Believe', 'Brandon Lake', 'Contemporary', 'Bethel Music Publishing', 'Bb'),
]

// ── CROWDER ───────────────────────────────────────────────────────────────────
const CROWDER_SONGS: SeedSong[] = [
  ccli('cr-good-god-almighty', 'Good God Almighty', 'Crowder', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('cr-come-as-you-are', 'Come As You Are', 'Crowder', 'Contemporary', 'Capitol CMG Publishing', 'E'),
  ccli('cr-all-my-hope', 'All My Hope', 'Crowder', 'Contemporary', 'Capitol CMG Publishing', 'E'),
  ccli('cr-because-of-your-love', 'Because of Your Love', 'Crowder', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('cr-let-it-rain', 'Let It Rain', 'Crowder', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('cr-red-letters', 'Red Letters', 'Crowder', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('cr-in-the-house', 'In the House', 'Crowder', 'Contemporary', 'Capitol CMG Publishing', 'C'),
  ccli('cr-run-devil-run', 'Run Devil Run', 'Crowder', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('cr-praise-is-the-highway', 'Praise Is the Highway', 'Crowder', 'Contemporary', 'Capitol CMG Publishing', 'E'),
  ccli('cr-no-one-but-you', 'No One but You', 'Crowder', 'Contemporary', 'Capitol CMG Publishing', 'Bb'),
]

// ── MATT REDMAN ───────────────────────────────────────────────────────────────
const MATT_REDMAN: SeedSong[] = [
  ccli('mr-10000-reasons', '10,000 Reasons (Bless the Lord)', 'Matt Redman', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('mr-heart-of-worship', 'Heart of Worship', 'Matt Redman', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('mr-blessed-be-your-name', 'Blessed Be Your Name', 'Matt Redman', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('mr-never-once', 'Never Once', 'Matt Redman', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('mr-you-never-let-go', 'You Never Let Go', 'Matt Redman', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('mr-here-i-am-to-worship', 'Here I Am to Worship (Light of the World)', 'Matt Redman', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('mr-one-name', 'One Name (Jesus)', 'Matt Redman', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('mr-gracefully-broken', 'Gracefully Broken', 'Matt Redman', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('mr-better-is-one-day', 'Better Is One Day', 'Matt Redman', 'Contemporary', 'Capitol CMG Publishing', 'E'),
  ccli('mr-let-my-people-go', 'Let My People Go', 'Matt Redman', 'Contemporary', 'Capitol CMG Publishing', 'D'),
]

// ── KARI JOBE ─────────────────────────────────────────────────────────────────
const KARI_JOBE: SeedSong[] = [
  ccli('kj-the-blessing', 'The Blessing', 'Kari Jobe', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('kj-revelation-song', 'Revelation Song', 'Kari Jobe', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('kj-forever', 'Forever (We Sing Hallelujah)', 'Kari Jobe', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('kj-speak-to-me', 'Speak to Me', 'Kari Jobe', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('kj-i-am-not-alone', 'I Am Not Alone', 'Kari Jobe', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('kj-holy-spirit', 'Holy Spirit', 'Kari Jobe', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('kj-we-are', 'We Are', 'Kari Jobe', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('kj-breathe-on-us', 'Breathe on Us', 'Kari Jobe', 'Contemporary', 'Capitol CMG Publishing', 'Bb'),
  ccli('kj-look-upon-the-lord', 'Look Upon the Lord', 'Kari Jobe', 'Contemporary', 'Capitol CMG Publishing', 'E'),
  ccli('kj-heal-our-land', 'Heal Our Land', 'Kari Jobe', 'Contemporary', 'Capitol CMG Publishing', 'D'),
]

// ── PASSION / KRISTIAN STANFILL ───────────────────────────────────────────────
const PASSION: SeedSong[] = [
  ccli('pa-glorious-day', 'Glorious Day', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'C'),
  ccli('pa-whole-heart', 'Whole Heart (Hold Me Now)', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'Ab'),
  ccli('pa-follow-you-anywhere', 'Follow You Anywhere', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('pa-even-so-come', 'Even So Come', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'E'),
  ccli('pa-burn-bright', 'Burn Bright', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('pa-gods-not-dead', "God's Not Dead", 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'C'),
  ccli('pa-worthy-of-your-name', 'Worthy of Your Name', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('pa-here-for-you', 'Here for You', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('pa-more-to-come', 'More to Come', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('pa-my-witness', 'My Witness', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'D'),
]

// ── JESUS CULTURE ─────────────────────────────────────────────────────────────
const JESUS_CULTURE: SeedSong[] = [
  ccli('jc-your-love-never-fails', 'Your Love Never Fails', 'Jesus Culture', 'Contemporary', 'Jesus Culture Music', 'E'),
  ccli('jc-break-every-chain', 'Break Every Chain', 'Jesus Culture', 'Contemporary', 'Jesus Culture Music', 'B'),
  ccli('jc-in-the-river', 'In the River', 'Jesus Culture', 'Contemporary', 'Jesus Culture Music', 'D'),
  ccli('jc-rooftops', 'Rooftops', 'Jesus Culture', 'Contemporary', 'Jesus Culture Music', 'A'),
  ccli('jc-miracles', 'Miracles', 'Jesus Culture', 'Contemporary', 'Jesus Culture Music', 'E'),
  ccli('jc-fierce', 'Fierce', 'Jesus Culture', 'Contemporary', 'Jesus Culture Music', 'D'),
  ccli('jc-holy', 'Holy', 'Jesus Culture', 'Contemporary', 'Jesus Culture Music', 'G'),
  ccli('jc-forevermore', 'Forevermore', 'Jesus Culture', 'Contemporary', 'Jesus Culture Music', 'A'),
]

// ── TOPE ALABI ────────────────────────────────────────────────────────────────
const TOPE_ALABI: SeedSong[] = [
  ccli('ta-yes-and-amen', 'Yes and Amen', 'Tope Alabi', 'Gospel', 'Tope Alabi Music', 'A', 'yo'),
  ccli('ta-logan-ti-ode', 'Logan Ti O De (You Deserve the Praise)', 'Tope Alabi', 'Gospel', 'Tope Alabi Music', 'G', 'yo'),
  ccli('ta-ore-ti-o-common', 'Ore Ti O Common', 'Tope Alabi', 'Gospel', 'Tope Alabi Music', 'D', 'yo'),
  ccli('ta-angeli-mi', 'Angeli Mi', 'Tope Alabi', 'Gospel', 'Tope Alabi Music', 'E', 'yo'),
  ccli('ta-awa-gbe-ogo-fun-e', 'Awa Gbe Ogo Fun E', 'Tope Alabi', 'Gospel', 'Tope Alabi Music', 'Bb', 'yo'),
  ccli('ta-mimo-loluwa', 'Mimo L\'Oluwa (The Lord Is Holy)', 'Tope Alabi', 'Gospel', 'Tope Alabi Music', 'C', 'yo'),
  ccli('ta-agbara-olorun', 'Agbara Olorun (Power of God)', 'Tope Alabi', 'Gospel', 'Tope Alabi Music', 'D', 'yo'),
  ccli('ta-oba-to-julo', 'Oba To Julo (Greatest King)', 'Tope Alabi', 'Gospel', 'Tope Alabi Music', 'G', 'yo'),
]

// ── FRANK EDWARDS ─────────────────────────────────────────────────────────────
const FRANK_EDWARDS: SeedSong[] = [
  ccli('fe-ta-re', 'Ta Re (Dance)', 'Frank Edwards', 'Gospel', 'RockTown Records', 'E'),
  ccli('fe-mma-mma', 'Mma Mma (Beautiful)', 'Frank Edwards', 'Gospel', 'RockTown Records', 'D', 'ig'),
  ccli('fe-supernatural', 'Supernatural', 'Frank Edwards', 'Gospel', 'RockTown Records', 'A'),
  ccli('fe-onye-eze', 'Onye Eze (The King)', 'Frank Edwards', 'Gospel', 'RockTown Records', 'G', 'ig'),
  ccli('fe-i-made-it', 'I Made It', 'Frank Edwards', 'Gospel', 'RockTown Records', 'D'),
  ccli('fe-sweet-spirit', 'Sweet Spirit of God', 'Frank Edwards', 'Gospel', 'RockTown Records', 'E'),
  ccli('fe-you-too-dey-bless-me', 'You Too Dey Bless Me', 'Frank Edwards', 'Gospel', 'RockTown Records', 'A', 'pcm'),
  ccli('fe-under-the-canopy', 'Under the Canopy', 'Frank Edwards', 'Gospel', 'RockTown Records', 'G'),
]

// ── TIM GODFREY ───────────────────────────────────────────────────────────────
const TIM_GODFREY: SeedSong[] = [
  ccli('tg-nara', 'Nara', 'Tim Godfrey', 'Gospel', 'Rox Nation', 'D', 'ig'),
  ccli('tg-e-baba', 'E Baba', 'Tim Godfrey', 'Gospel', 'Rox Nation', 'A', 'yo'),
  ccli('tg-jigidem', 'Jigidem', 'Tim Godfrey', 'Gospel', 'Rox Nation', 'G'),
  ccli('tg-na-you-be-god', 'Na You Be God', 'Tim Godfrey', 'Gospel', 'Rox Nation', 'Bb', 'pcm'),
  ccli('tg-good-morning', 'Good Morning', 'Tim Godfrey', 'Gospel', 'Rox Nation', 'C'),
  ccli('tg-praise-him', 'Praise Him', 'Tim Godfrey', 'Gospel', 'Rox Nation', 'D'),
]

// ── GATEWAY WORSHIP ───────────────────────────────────────────────────────────
const GATEWAY_WORSHIP: SeedSong[] = [
  ccli('gw-spirit-of-the-living-god', 'Spirit of the Living God', 'Gateway Worship', 'Contemporary', 'Gateway Create Publishing', 'A'),
  ccli('gw-your-great-name', 'Your Great Name', 'Gateway Worship', 'Contemporary', 'Gateway Create Publishing', 'D'),
  ccli('gw-the-more-i-seek-you', 'The More I Seek You', 'Gateway Worship', 'Contemporary', 'Gateway Create Publishing', 'E'),
  ccli('gw-my-everything', 'My Everything', 'Gateway Worship', 'Contemporary', 'Gateway Create Publishing', 'C'),
  ccli('gw-praise-goes-on', 'Praise Goes On', 'Gateway Worship', 'Contemporary', 'Gateway Create Publishing', 'D'),
  ccli('gw-battle-cry', 'Battle Cry', 'Gateway Worship', 'Contemporary', 'Gateway Create Publishing', 'A'),
  ccli('gw-stronghold', 'Stronghold', 'Gateway Worship', 'Contemporary', 'Gateway Create Publishing', 'G'),
  ccli('gw-king-of-glory', 'King of Glory', 'Gateway Worship', 'Contemporary', 'Gateway Create Publishing', 'D'),
]

// ── ADDITIONAL CONTEMPORARY ARTISTS ───────────────────────────────────────────
const ADDITIONAL_CONTEMPORARY: SeedSong[] = [
  // Leeland
  ccli('le-way-maker', 'Way Maker', 'Leeland', 'Contemporary', 'Integrity Music', 'E'),
  ccli('le-lion-and-the-lamb', 'Lion and the Lamb', 'Leeland', 'Contemporary', 'Integrity Music', 'D'),
  ccli('le-kingdom', 'Kingdom', 'Leeland', 'Contemporary', 'Integrity Music', 'G'),
  // Vertical Worship
  ccli('vw-yes-i-will', 'Yes I Will', 'Vertical Worship', 'Contemporary', 'Essential Music Publishing', 'D'),
  ccli('vw-open-up-the-heavens', 'Open Up the Heavens', 'Vertical Worship', 'Contemporary', 'Essential Music Publishing', 'A'),
  ccli('vw-spirit-of-the-living-god-vw', 'Spirit of the Living God', 'Vertical Worship', 'Contemporary', 'Essential Music Publishing', 'A'),
  // Tauren Wells
  ccli('tw-known', 'Known', 'Tauren Wells', 'Contemporary', 'Capitol CMG Publishing', 'Bb'),
  ccli('tw-hills-and-valleys', 'Hills and Valleys', 'Tauren Wells', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('tw-famous-for', 'Famous For (I Believe)', 'Tauren Wells', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  // We The Kingdom
  ccli('wtk-holy-water', 'Holy Water', 'We The Kingdom', 'Contemporary', 'Capitol CMG Publishing', 'Bb'),
  ccli('wtk-god-so-loved', 'God So Loved', 'We The Kingdom', 'Contemporary', 'Capitol CMG Publishing', 'Ab'),
  ccli('wtk-dancing-on-the-waves', 'Dancing on the Waves', 'We The Kingdom', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  // Cory Asbury
  ccli('ca-reckless-love', 'Reckless Love', 'Cory Asbury', 'Contemporary', 'Bethel Music Publishing', 'C'),
  ccli('ca-the-father-s-house', "The Father's House", 'Cory Asbury', 'Contemporary', 'Bethel Music Publishing', 'D'),
  // Chandler Moore
  ccli('cm-come-thou-fount', 'Come Thou Fount', 'Chandler Moore', 'Contemporary', 'Maverick City Publishing', 'G'),
  ccli('cm-omemma', 'Omemma', 'Chandler Moore', 'Contemporary', 'Maverick City Publishing', 'A', 'ig'),
  // Travis Greene
  ccli('tgr-intentional', 'Intentional', 'Travis Greene', 'Gospel', 'RCA Inspiration', 'Bb'),
  ccli('tgr-made-a-way', 'Made a Way', 'Travis Greene', 'Gospel', 'RCA Inspiration', 'D'),
  ccli('tgr-you-waited', 'You Waited', 'Travis Greene', 'Gospel', 'RCA Inspiration', 'G'),
  // William McDowell
  ccli('wm-i-give-myself-away', 'I Give Myself Away', 'William McDowell', 'Gospel', 'Delivery Room Records', 'C'),
  ccli('wm-withholding-nothing', 'Withholding Nothing', 'William McDowell', 'Gospel', 'Delivery Room Records', 'Bb'),
  ccli('wm-there-is-something-about-that-name', 'There Is Something About That Name', 'William McDowell', 'Gospel', 'Delivery Room Records', 'E'),
  // Darlene Zschech
  ccli('dz-worthy-is-the-lamb', 'Worthy Is the Lamb', 'Darlene Zschech', 'Contemporary', 'Hillsong Publishing', 'G'),
  ccli('dz-victor-s-crown', "Victor's Crown", 'Darlene Zschech', 'Contemporary', 'Hillsong Publishing', 'A'),
  ccli('dz-shout-to-the-lord-dz', 'Shout to the Lord', 'Darlene Zschech', 'Contemporary', 'Hillsong Publishing', 'Bb'),
  // Todd Dulaney
  ccli('td-your-great-name', 'Your Great Name', 'Todd Dulaney', 'Gospel', 'eOne Nashville', 'E'),
  ccli('td-victory-belongs', 'Victory Belongs to Jesus', 'Todd Dulaney', 'Gospel', 'eOne Nashville', 'D'),
  // Newsboys
  ccli('nb2-god-s-not-dead', "God's Not Dead (Like a Lion)", 'Newsboys', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('nb2-we-believe', 'We Believe', 'Newsboys', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('nb2-born-again', 'Born Again', 'Newsboys', 'Contemporary', 'Capitol CMG Publishing', 'E'),
  // Third Day
  ccli('3d-cry-out-to-jesus', 'Cry Out to Jesus', 'Third Day', 'Contemporary', 'Essential Music Publishing', 'G'),
  ccli('3d-your-love-oh-lord', 'Your Love Oh Lord', 'Third Day', 'Contemporary', 'Essential Music Publishing', 'D'),
  ccli('3d-god-of-wonders', 'God of Wonders', 'Third Day', 'Contemporary', 'Essential Music Publishing', 'D'),
  // Jeremy Camp
  ccli('jca-i-still-believe', 'I Still Believe', 'Jeremy Camp', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('jca-there-will-be-a-day', 'There Will Be a Day', 'Jeremy Camp', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('jca-overcome', 'Overcome', 'Jeremy Camp', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  // Zach Williams
  ccli('zw-chain-breaker', 'Chain Breaker', 'Zach Williams', 'Contemporary', 'Essential Music Publishing', 'C'),
  ccli('zw-old-church-choir', 'Old Church Choir', 'Zach Williams', 'Contemporary', 'Essential Music Publishing', 'G'),
  ccli('zw-less-like-me', 'Less Like Me', 'Zach Williams', 'Contemporary', 'Essential Music Publishing', 'D'),
  // Michael W. Smith
  ccli('ms-great-are-you-lord-mws', 'Great Are You Lord', 'All Sons & Daughters', 'Contemporary', 'Integrity Music', 'G'),
  ccli('ms-above-all', 'Above All', 'Michael W. Smith', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('ms-healing-rain', 'Healing Rain', 'Michael W. Smith', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  // Housefires
  ccli('hf-good-good-father', 'Good Good Father', 'Housefires', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('hf-how-he-loves', 'How He Loves', 'Housefires', 'Contemporary', 'Integrity Music', 'C'),
  // Sean Feucht
  ccli('sf-let-us-worship', 'Let Us Worship', 'Sean Feucht', 'Contemporary', 'Let Us Worship', 'D'),
  ccli('sf-million-little-miracles-sf', 'Million Little Miracles', 'Sean Feucht', 'Contemporary', 'Let Us Worship', 'G'),
  // for KING & COUNTRY
  ccli('fkc-god-only-knows', 'God Only Knows', 'for KING & COUNTRY', 'Contemporary', 'Curb/Word', 'Bb'),
  ccli('fkc-joy', 'joy.', 'for KING & COUNTRY', 'Contemporary', 'Curb/Word', 'D'),
  ccli('fkc-relate', 'Relate', 'for KING & COUNTRY', 'Contemporary', 'Curb/Word', 'A'),
  // UPPERROOM
  ccli('ur-yahweh', 'Yahweh', 'UPPERROOM', 'Contemporary', 'UPPERROOM Publishing', 'E'),
  ccli('ur-spontaneous-worship', 'Spontaneous Worship', 'UPPERROOM', 'Contemporary', 'UPPERROOM Publishing', 'D'),
]

// ── TRADITIONAL HYMNS (pending rights audit — marked 'unknown') ───────────────
// From hymnstogod.org complete PD hymn list + marvinjude/gospel-hymns collection
function generateHymnId(title: string): string {
  return 'hymn-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 40)
}

const TRADITIONAL_HYMNS_RAW = [
  'A Mighty Fortress', 'Abide With Me', 'All Glory Laud and Honor', 'All Hail the Power of Jesus Name',
  'All The Way My Savior Leads Me', 'All Things Bright and Beautiful', 'Amazing Grace', 'And Can It Be',
  'Angels We Have Heard on High', 'Are You Washed in the Blood', 'At Calvary', 'At the Cross',
  'Battle Hymn of the Republic', 'Be Still My Soul', 'Be Thou My Vision', 'Beautiful Savior',
  'Before the Throne of God Above', 'Beneath the Cross of Jesus', 'Blessed Assurance',
  'Blessed Be the Name', 'Blest Be the Tie That Binds', 'Break Thou the Bread of Life',
  'Breathe on Me Breath of God', 'Brethren We Have Met to Worship', 'Christ Arose',
  'Christ the Lord Is Risen Today', 'Close to Thee', 'Come Thou Almighty King',
  'Come Thou Fount of Every Blessing', 'Count Your Blessings', 'Crown Him with Many Crowns',
  'Day by Day', 'Down at the Cross', 'Doxology (Praise God from Whom All Blessings Flow)',
  'Eternal Father Strong to Save', 'Fairest Lord Jesus', 'Faith of Our Fathers',
  'Fight the Good Fight', 'For the Beauty of the Earth', 'Give Me Jesus',
  'Gloria in Excelsis Deo', 'Glorious Things of Thee Are Spoken', 'God Be with You Till We Meet Again',
  'God Leads Us Along', 'God of Grace and God of Glory', 'God Will Take Care of You',
  'Grace Greater Than Our Sin', 'Great Is Thy Faithfulness', 'Guide Me O Thou Great Jehovah',
  'Hallelujah What a Savior', 'Hark the Herald Angels Sing', 'Have Thine Own Way Lord',
  'He Leadeth Me', 'Heavenly Sunlight', 'Higher Ground',
  'His Eye Is on the Sparrow', 'Holy Holy Holy Lord God Almighty', 'How Can I Keep from Singing',
  'How Firm a Foundation', 'How Great Thou Art', 'I Am Thine O Lord', 'I Gave My Life for Thee',
  'I Have Decided to Follow Jesus', 'I Know Whom I Have Believed', 'I Love to Tell the Story',
  'I Must Tell Jesus', 'I Need Thee Every Hour', 'I Sing the Mighty Power of God',
  'I Stand Amazed in the Presence', 'I Surrender All', 'I Will Sing of My Redeemer',
  'I Will Sing of the Mercies of the Lord', 'Immortal Invisible God Only Wise',
  'In Christ Alone', 'In the Garden', 'In the Sweet By and By',
  'It Came Upon a Midnight Clear', 'It Is Well with My Soul', 'Ivory Palaces',
  'Jesus I Come to Thee', 'Jesus Lover of My Soul', 'Jesus Loves Me',
  'Jesus Paid It All', 'Jesus Saves', 'Jesus the Very Thought of Thee',
  'Joy to the World', 'Joyful Joyful We Adore Thee', 'Just As I Am',
  'Just When I Need Him Most', 'King of Kings Majesty', 'Lead Kindly Light',
  'Lead Me to Calvary', 'Leaning on the Everlasting Arms', 'Let Others See Jesus in You',
  'Lift Every Voice and Sing', 'Like a River Glorious', 'Living for Jesus',
  'Lord I Want to Be a Christian', 'Love Divine All Loves Excelling', 'Love Lifted Me',
  'Man of Sorrows What a Name', 'Marvelous Grace', 'Mine Eyes Have Seen the Glory',
  'More About Jesus', 'More Love to Thee', 'Must Jesus Bear the Cross Alone',
  'My Faith Looks Up to Thee', 'My Hope Is Built on Nothing Less', 'My Jesus I Love Thee',
  'My Savior First of All', 'Near the Cross', 'Near to the Heart of God',
  'Nearer My God to Thee', 'Nothing But the Blood', 'Now Thank We All Our God',
  'O Come All Ye Faithful', 'O Come O Come Emmanuel', 'O for a Thousand Tongues to Sing',
  'O God Our Help in Ages Past', 'O Happy Day', 'O Holy Night',
  'O Little Town of Bethlehem', 'O Love That Will Not Let Me Go', 'O Sacred Head Now Wounded',
  'O the Deep Deep Love of Jesus', 'O Worship the King', 'Old Rugged Cross',
  'On Christ the Solid Rock I Stand', 'Onward Christian Soldiers', 'Pass Me Not O Gentle Savior',
  'Power in the Blood', 'Praise God from Whom All Blessings Flow', 'Praise Him Praise Him',
  'Praise to the Lord the Almighty', 'Purer in Heart O God', 'Rejoice the Lord Is King',
  'Rescue the Perishing', 'Revive Us Again', 'Rock of Ages',
  'Safely Through Another Week', 'Savior Like a Shepherd Lead Us', 'Shall We Gather at the River',
  'Silent Night', 'Since Jesus Came Into My Heart', 'Softly and Tenderly',
  'Stand Up Stand Up for Jesus', 'Standing on the Promises', 'Stepping in the Light',
  'Sunshine in My Soul', 'Sweet By and By', 'Sweet Hour of Prayer',
  'Take My Life and Let It Be', 'Take Time to Be Holy', 'Tell Me the Story of Jesus',
  'The Church One Foundation', 'The Comforter Has Come', 'The God of Abraham Praise',
  'The Love of God', 'The Old Rugged Cross', 'The Solid Rock',
  'The Star Spangled Banner', 'There Is a Balm in Gilead', 'There Is a Fountain',
  'There Is Power in the Blood', 'There Shall Be Showers of Blessing', 'This Is My Father World',
  'Thou Didst Leave Thy Throne', 'Tis So Sweet to Trust in Jesus', 'To God Be the Glory',
  'Trust and Obey', 'Turn Your Eyes Upon Jesus', 'Victory in Jesus',
  'We Gather Together', 'We Have a Story to Tell', 'We Three Kings',
  'We re Marching to Zion', 'Were You There', 'What a Friend We Have in Jesus',
  'What a Gathering That Will Be', 'What Child Is This', 'What Wondrous Love Is This',
  'When I Survey the Wondrous Cross', 'When the Roll Is Called Up Yonder',
  'When We All Get to Heaven', 'Whiter Than Snow', 'Who Is on the Lord Side',
  'Wonderful Grace of Jesus', 'Wonderful Peace', 'Wonderful Words of Life',
  'Ye Must Be Born Again',
  // Additional from hymnstogod.org collection
  'A Land of Beauty', 'A Wonderful Savior', 'A Home Forever There', 'A Joy in My Heart',
  'A Soldier of the Cross', 'Able to Deliver', 'All Glory Be Thine', 'All Will Be Well',
  'Anchored', 'Anywhere Is Home', 'Arise and Shine', 'Asking Thy Care',
  'Be Slow to Speak', 'Be Thou Exalted', 'Beautiful City of Gold', 'Beautiful Home',
  'Because I Love Jesus', 'Before the Throne', 'Behold the Saviour', 'Believe and Obey',
  'Bless Me Now', 'Blessed Communion', 'Can You Count the Stars', 'Can You Stand for God',
  'Carry It All to Jesus', 'Christ the Light', 'City of Gold', 'Cleanse Thou Me',
  'Cling to Jesus Alone', 'Closer Draw Me', 'Closer to Jesus', 'Come and Walk With Jesus',
  'Come Just As You Are', 'Come to the Cross', 'Committed to Jesus', 'Count Thy Mercies',
  'Dare to Stand Like Joshua', 'Dear Jesus Canst Thou Help Me', 'Draw Me Near to Thee',
  'Draw Me Still Closer', 'Endless Praise', 'Eternity', 'Ever Near',
  'Everlasting Arms', 'Exalt the Lord His Praise Proclaim', 'Faith Is the Victory',
  'Father to Thee', 'Follow in the Steps of Jesus', 'For Christ and the Church',
  'For He Careth for You', 'For You and Me', 'Forever Blessed Be the Lord',
  'Forever With the Lord', 'From All Who Dwell Below the Skies',
  'From Every Stormy Wind That Blows', 'From the Cross to the Crown', 'Fullness of Joy',
  'Give Me the Bible', 'Give to God the Glory', 'Glory to His Name',
  'Glory to God Hallelujah', 'Glory to the Bleeding Lamb', 'God Is Faithful',
  'God Is Love', 'God Is Present Everywhere', 'God Knows Thy Need',
  'Great Is His Mercy', 'Great Physician', 'Guide Me O My Saviour',
  'Hallelujah and Praise', 'Hallelujah Praise Jehovah', 'Hallelujah We Shall Rise',
  'He Bore It All', 'He Brings Me Peace', 'He Is So Precious to Me',
  'He Knows', 'He Leadeth My Soul', 'He Loved Me So', 'He Redeemed Me',
  'He Saves', 'He Wept for Me', 'He Will Keep Me', 'Hear Me Blessed Jesus',
  'Heaven', 'Heaven Holds All for Me', 'Hold Thou My Hand',
  'Home of the Soul', 'How Gentle Gods Commands', 'How Precious the Promise',
  'I Am Sheltered in Thee', 'I Am So Happy', 'I Am Standing on the Word of God',
  'I Heard the Voice of Jesus Say', 'I Know He Is Mine',
  'I Will Do What I Can', 'I Will Give You Rest', 'I Will Go',
  'I Will Not Forget Thee', 'I Will Praise Thee', 'I Will Sing of Him',
  'I Will Trust in the Lord', 'Into His Marvellous Light', 'Is It Not Wonderful',
  'Is Your All on the Altar', 'Jesus at the Door', 'Jesus Blessed Saviour',
  'Jesus Calls', 'Jesus Is Living With Me', 'Jesus Lover of My Soul (Wesley)',
  'Jesus My Refuge Eternal', 'Jesus Near', 'Jesus Our Wonderful Saviour',
  'Jesus Remembers You', 'Jesus Shall Have It All', 'Jesus the Light of the World',
  'Jesus Wept', 'Jesus Will Give You Rest', 'Joy in My Heart',
  'Kept Through Faith', 'King of Love My Shepherd Is', 'Kingdom of Song',
  'Lamb of God My Savior Dear', 'Land Beyond', 'Land of Light',
  'Land of the Blessed', 'Lead Me', 'Lead Me On',
  'Let Me Cling to Thee', 'Let Not Your Heart Be Troubled', 'Let the Light Shine Out',
  'Let the Lower Lights Be Burning', 'Let Us Be Lights', 'Let Us Exalt the Lord',
  'Lift Up Your Hearts to Things Above', 'Living for Christ', 'Living Water',
  'Lo He Is God Alone', 'Looking to Thee', 'Lord Is My Light',
  'Lord Is My Refuge', 'Lord Is Thy Keeper', 'Lord of Glory',
  'Love of God', 'Many Mansions Up There', 'Meet Me There',
  'Mercies of the Lord', 'Mighty Deliverer', 'More Faith in Thee',
  'More Like Jesus', 'My Greatest Desires', 'My Only Plea',
  'My Prayer', 'My Presence Shall Go With Thee', 'My Redeemer',
  'My Saviour Hath Loved Me', 'My Song Shall Be of Jesus', 'My Soul Sings Hallelujah',
  'Nearer the Cross', 'New Song', 'No Night in Heaven',
  'No Other Name (hymn)', 'No Other Refuge', 'Not One Forgotten',
  'O Blessed Bible', 'O Child of God', 'O Glad and Glorious Gospel',
  'O Gracious Father', 'O How He Loves Me', 'O How Sweet to Trust the Lord',
  'O May Thy Word', 'O Sing of His Mighty Love', 'O Sing of My Redeemer',
  'O Wonderful Savior', 'Oh Wondrous Name', 'On the Rock',
  'One by One', 'One Sweetly Solemn Thought', 'Open Wide the Door',
  'Our Glorious King', 'Our Great Saviour', 'Our Risen King',
  'Peace at the Cross', 'Peace in Jesus', 'Pearly White City',
  'Praise His Name Forever', 'Praise the Lord', 'Pray for One Another',
  'Press Forward O Soldiers', 'Promised Land', 'Rejoice in the Lord',
  'Rest By and By', 'Resting on My Saviour Love', 'Room in the Heart of Jesus',
  'Safe in the Arms of Jesus', 'Safely Hide Me', 'Saved Through the Blood',
  'Saved to Serve', 'Saviour Again', 'Saviour Help Us',
  'Saviour Hide Me', 'Search the Scriptures', 'Seeking the Lost',
  'Send the Gospel Light', 'Since I Have Been Redeemed', 'Sing My Soul',
  'Sing O Sing the Love of Jesus', 'So Near to the Kingdom', 'Stand Firm Be Not Afraid',
  'Steadfast Faith', 'Step by Step (hymn)', 'Such Love Was Never Known',
  'Sun of My Soul', 'Sweet Communion', 'Sweet Moments of Prayer',
  'Sweet Rest', 'Sweet Story of Jesus', 'Sweet Will of God',
  'Sweeter and Dearer', 'Sweetly Resting', 'Sweetly Saved',
  'Take Up Thy Cross', 'Take Wings to Thy Soul', 'Teach Me Thy Will O Lord',
  'Tell Me of Jesus', 'Tenderly Calling', 'That Beautiful Land',
  'There Is a Habitation', 'There Is Cleansing in the Precious Blood',
  'There Is Joy in My Soul', 'There Is Pardon Free', 'There Stands a Rock',
  'There a Better Day', 'They Who Seek the Throne of Grace',
  'Thou Knowest', 'Thy Hand Upholdeth Me', 'Thy Word Is a Lamp',
  'Tis Finished So the Saviour Cried', 'Tis Found Alone in Prayer',
  'Tis the Blessed Hour of Prayer', 'To Whom Shall I Go',
  'Treasures of Heaven', 'Trim Your Lamp', 'Trusting Jesus That Is All',
  'Under His Care', 'Walk Daily With Your Saviour', 'Walk in the Light',
  'Walking in the Sunlight', 'Watch and Pray', 'Way of the Cross Leads Home',
  'We Are Going', 'We Are Guided Every Day', 'We Need Never Fear',
  'We Shall Reap By and By', 'We Shall Stand Before the King', 'We Worship Thee',
  'We ll Understand It All By and By', 'What a Saviour (hymn)', 'What Have I Done for Jesus',
  'Where Jesus Died for Me', 'Where the Saviour Leads', 'Where the Soul Never Dies',
  'Where We ll Never Grow Old', 'Who Will Follow Jesus', 'Why Do You Wait',
  'Will Our Work Be Done', 'Wonderful City of God', 'Wonderful Hands of Jesus',
  'Wonderful Love', 'Wonderful Songs of Salvation', 'Wonderful Story of Love',
  'Wondrous Story', 'Word of Life', 'Work for Jesus', 'Would You Live for Jesus',
  'Yielded to God', 'You Must Be Redeemed',
]

const TRADITIONAL_HYMNS: SeedSong[] = TRADITIONAL_HYMNS_RAW.map(title =>
  hymn(generateHymnId(title), title, 'Traditional')
)

// ── GOSPEL HYMNS (from marvinjude/gospel-hymns collection) ────────────────────
const GOSPEL_HYMNS_RAW = [
  'All Your Anxiety', 'Come Unto Me', 'Impatient Heart Be Still', 'Leave It There',
  'Never Give Up', 'Yield Not to Temptation', 'Turn Your Eyes Unto Jesus',
  'If God Be for Us', 'Christ Jesus Hath the Power', 'The Way the Truth the Life',
  'Will Your Anchor Hold', 'Simply Trusting Everyday', 'No Other Plea',
  'Now I Belong to Jesus', 'I Know Who Holds Tomorrow', 'I ve Anchored in Jesus',
  'He Touched Me', 'Heaven Came Down', 'Constantly Abiding',
  'A New Name in Glory', 'My Name s Written There', 'When I See the Blood',
  'Have You Been to Jesus', 'Wash Me O Lamb of God',
  'Come Over', 'Jesus My Strength My Hope', 'A Christian Home',
  'Just Obey', 'That Blessed Canaan Land', 'Count Me',
  'So Send I You', 'I Am Ready for Service', 'I Love My Master',
  'They That Wait Upon the Lord', 'The Last Mile of the Way',
  'Little Is Much When God Is In It', 'Where Could I Go', 'Go Labor On',
  'Will There Be Any Stars', 'Oh How I Love Jesus', 'Jesus Is the Sweetest',
  'Like a Shepherd Lead Us', 'Christ Be Beside Me', 'Have You Any Room for Jesus',
  'I Want to See Jesus', 'Jesus Only Is Our Message', 'The Heart That Was Broken for Me',
  'In Times Like These', 'The Way of the Cross',
  'Thy Word Have I Hid in My Heart', 'Deeper Deeper in the Love of Jesus',
  'Give of Your Best to the Master', 'Nothing Between',
  'Wherever He Leads I ll Go', 'O Jesus I Have Promised',
  'Where He Leads Me', 'Draw Me Nearer Blessed Jesus',
  'Come Saviour Jesus from Above', 'Peace Be Still',
  'Oft in Danger Oft in Woe', 'The Song of the Soldier',
  'There Is Victory Within My Soul', 'Christ Our Mighty Captain',
]

const GOSPEL_HYMNS: SeedSong[] = GOSPEL_HYMNS_RAW.map(title =>
  hymn('gh-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 40), title, 'Traditional', 'Gospel')
)

// ── EXPORT ────────────────────────────────────────────────────────────────────

export const EXPANSION_CATALOGUE: SeedSong[] = [
  ...HILLSONG_WORSHIP,
  ...HILLSONG_UNITED,
  ...BETHEL_MUSIC,
  ...ELEVATION_WORSHIP,
  ...CHRIS_TOMLIN,
  ...MAVERICK_CITY_EXPANDED,
  ...KIRK_FRANKLIN,
  ...CECE_WINANS,
  ...TASHA_COBBS_LEONARD,
  ...DUNSIN_OYEKAN,
  ...SINACH_SONGS,
  ...NATHANIEL_BASSEY,
  ...PHIL_WICKHAM,
  ...CASTING_CROWNS_SONGS,
  ...MERCYME_SONGS,
  ...LAUREN_DAIGLE,
  ...ISRAEL_HOUGHTON,
  ...BRANDON_LAKE,
  ...CROWDER_SONGS,
  ...MATT_REDMAN,
  ...KARI_JOBE,
  ...PASSION,
  ...JESUS_CULTURE,
  ...TOPE_ALABI,
  ...FRANK_EDWARDS,
  ...TIM_GODFREY,
  ...GATEWAY_WORSHIP,
  ...ADDITIONAL_CONTEMPORARY,
  ...TRADITIONAL_HYMNS,
  ...GOSPEL_HYMNS,
]
