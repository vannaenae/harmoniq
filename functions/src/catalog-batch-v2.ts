/**
 * Daily catalog expansion batch — Wave 2.
 * ~1,000 additional worship songs for the HARA-82 pipeline.
 *
 * Rights model:
 *  ccli_required  — contemporary/gospel songs; link-out only, NO hosted lyrics
 *  public_domain  — pre-1928 hymns; full lyrics may be added later
 *  audit_pending  — post-1928 traditional material; rights not yet confirmed
 *
 * Genre diversity: Contemporary, Gospel, African Gospel, Traditional Hymn,
 *   Latin Gospel, French Gospel, Swahili Gospel, Multilingual.
 */

type Language = 'en' | 'yo' | 'ig' | 'ha' | 'pcm' | 'fr' | 'sw' | 'pt' | 'la' | 'es' | 'other'
type RightsStatus = 'public_domain' | 'ccli_required' | 'royalty_free' | 'unlicensed' | 'unknown' | 'audit_pending'

interface SongMediaLinks { youtubeVideoId?: string; spotifyTrackId?: string }
interface SongRights {
  status: RightsStatus
  ccliNumber?: string
  publisher?: string
  copyrightYear?: number
  notes?: string
}
interface LyricSection { kind: string; number?: number; lines: string[]; language: Language }

export interface BatchSong {
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
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function ccli(
  id: string, title: string, artist: string, genre: string, publisher: string,
  key?: string, lang: Language = 'en', extraLangs: Language[] = [],
): BatchSong {
  return {
    id, title, artist,
    primaryLanguage: lang,
    availableLanguages: [lang, ...extraLangs],
    genre, defaultKey: key,
    rights: { status: 'ccli_required', publisher },
    media: {}, lyrics: [],
  }
}

function pd(
  id: string, title: string, composer: string, genre = 'Hymn',
  key?: string, lang: Language = 'en',
): BatchSong {
  return {
    id, title,
    composers: [composer],
    primaryLanguage: lang,
    availableLanguages: [lang],
    genre, defaultKey: key,
    rights: { status: 'public_domain', notes: 'Pre-1928, public domain' },
    media: {}, lyrics: [],
  }
}

function ap(
  id: string, title: string, artist: string, genre = 'Hymn',
  key?: string, lang: Language = 'en',
): BatchSong {
  return {
    id, title, artist,
    primaryLanguage: lang,
    availableLanguages: [lang],
    genre, defaultKey: key,
    rights: { status: 'audit_pending', notes: 'Rights audit in progress' },
    media: {}, lyrics: [],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEMPORARY WORSHIP — Wave 2
// ─────────────────────────────────────────────────────────────────────────────

const ELEVATION_WAVE2: BatchSong[] = [
  ccli('ev2-canvas', 'Canvas and Clay', 'Pat Barrett', 'Contemporary', 'Housefires Songs', 'G'),
  ccli('ev2-resurrecting', 'Resurrecting', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'E'),
  ccli('ev2-see-a-victory', 'See a Victory', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'A'),
  ccli('ev2-there-is-a-king', 'There Is a King', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'C'),
  ccli('ev2-worthy', 'Worthy', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'D'),
  ccli('ev2-man-of-your-word', 'Man of Your Word', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'G'),
  ccli('ev2-lion-and-the-lamb', 'Lion and the Lamb', 'Big Daddy Weave', 'Contemporary', 'Music of the Wheat', 'G'),
  ccli('ev2-build-my-life', 'Build My Life', 'Pat Barrett', 'Contemporary', 'Housefires Songs', 'E'),
  ccli('ev2-nothing-else', 'Nothing Else', 'Cody Carnes', 'Contemporary', 'Capitol CMG Publishing', 'A'),
  ccli('ev2-run-to-the-father', 'Run to the Father', 'Cody Carnes', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('ev2-way-maker-live', 'Way Maker (Live)', 'Leeland', 'Contemporary', 'Integrity Music', 'E'),
  ccli('ev2-champion', 'Champion', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'C'),
  ccli('ev2-living-hope', 'Living Hope', 'Phil Wickham', 'Contemporary', 'Phil Wickham Music', 'D'),
  ccli('ev2-great-are-you-lord', 'Great Are You Lord', 'All Sons & Daughters', 'Contemporary', 'Integrity Music', 'G'),
  ccli('ev2-lord-i-need-you', 'Lord I Need You', 'Matt Maher', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('ev2-this-is-amazing-grace', 'This Is Amazing Grace', 'Phil Wickham', 'Contemporary', 'WilderLand Music', 'A'),
  ccli('ev2-glorious-day', 'Glorious Day', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'C'),
  ccli('ev2-more-than-worthy', 'More Than Worthy', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'D'),
  ccli('ev2-surrounded', 'Surrounded (Fight My Battles)', 'UPPERROOM', 'Contemporary', 'UPPERROOM Music', 'D'),
  ccli('ev2-take-courage', 'Take Courage', 'Kristene DiMarco', 'Contemporary', 'Bethel Music Publishing', 'C'),
]

const HILLSONG_UNITED_WAVE2: BatchSong[] = [
  ccli('hu2-oceans-live', 'Oceans (Live)', 'Hillsong United', 'Contemporary', 'Hillsong Publishing', 'D'),
  ccli('hu2-zion', 'Zion', 'Hillsong United', 'Contemporary', 'Hillsong Publishing', 'G'),
  ccli('hu2-captain', 'Captain', 'Hillsong United', 'Contemporary', 'Hillsong Publishing', 'F'),
  ccli('hu2-wake', 'Wake', 'Hillsong United', 'Contemporary', 'Hillsong Publishing', 'A'),
  ccli('hu2-touch-the-sky', 'Touch the Sky', 'Hillsong United', 'Contemporary', 'Hillsong Publishing', 'C'),
  ccli('hu2-heart-like-heaven', 'Heart Like Heaven', 'Hillsong United', 'Contemporary', 'Hillsong Publishing', 'G'),
  ccli('hu2-stronger', 'Stronger', 'Hillsong United', 'Contemporary', 'Hillsong Publishing', 'A'),
  ccli('hu2-with-everything', 'With Everything', 'Hillsong United', 'Contemporary', 'Hillsong Publishing', 'D'),
  ccli('hu2-depths', 'Depths', 'Hillsong United', 'Contemporary', 'Hillsong Publishing', 'E'),
  ccli('hu2-closer', 'Closer', 'Hillsong United', 'Contemporary', 'Hillsong Publishing', 'C'),
  ccli('hu2-empires', 'Empires', 'Hillsong United', 'Contemporary', 'Hillsong Publishing', 'C'),
  ccli('hu2-even-when-it-hurts', 'Even When It Hurts (Praise Song)', 'Hillsong United', 'Contemporary', 'Hillsong Publishing', 'A'),
  ccli('hu2-here-now-madness)', 'Here Now (Madness)', 'Hillsong United', 'Contemporary', 'Hillsong Publishing', 'Bb'),
  ccli('hu2-another-in-the-fire', 'Another in the Fire', 'Hillsong United', 'Contemporary', 'Hillsong Publishing', 'G'),
  ccli('hu2-whole-heart', 'Whole Heart (Hold Me Now)', 'Hillsong United', 'Contemporary', 'Hillsong Publishing', 'C'),
]

const MAVERICK_CITY_WAVE2: BatchSong[] = [
  ccli('mc2-goodness-of-god-live', 'Goodness of God (Live)', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'E'),
  ccli('mc2-refiner', 'Refiner', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'D'),
  ccli('mc2-holy-forever', 'Holy Forever', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'G'),
  ccli('mc2-wait-on-you', 'Wait on You', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'A'),
  ccli('mc2-build-my-life-mcm', 'Build My Life', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'E'),
  ccli('mc2-carbon-copy', 'Carbon Copy', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'F'),
  ccli('mc2-fear-is-not-my-future', 'Fear Is Not My Future', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'G'),
  ccli('mc2-talking-to-jesus', 'Talking to Jesus', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'C'),
  ccli('mc2-great-things', 'Great Things', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'G'),
  ccli('mc2-impossible', 'Impossible', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'D'),
  ccli('mc2-praise-the-lord', 'Praise the Lord', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'C'),
  ccli('mc2-stand-on-it', 'Stand on It', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'G'),
  ccli('mc2-never-lose-my-praise', 'Never Lose My Praise', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'A'),
  ccli('mc2-just-wanna-be-with-you', 'Just Wanna Be With You', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'D'),
  ccli('mc2-don-t-forget', "Don't Forget", 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'G'),
  ccli('mc2-close', 'Close', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'F'),
  ccli('mc2-m-home', "I'm Home", 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'C'),
  ccli('mc2-breathe', 'Breathe (Live)', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'E'),
  ccli('mc2-promises-promises', 'Promises (ft. Joe L Barnes)', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'B'),
  ccli('mc2-firm-foundation', 'Firm Foundation (He Won\'t)', 'Maverick City Music', 'Contemporary', 'Maverick City Publishing', 'D'),
]

const BETHEL_WAVE2: BatchSong[] = [
  ccli('bw2-reckless-love', 'Reckless Love', 'Cory Asbury', 'Contemporary', 'Bethel Music Publishing', 'G'),
  ccli('bw2-evidence', 'Evidence', 'Josh Baldwin', 'Contemporary', 'Bethel Music Publishing', 'D'),
  ccli('bw2-faithful-to-the-end', 'Faithful to the End', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'E'),
  ccli('bw2-come-to-me', 'Come to Me', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'C'),
  ccli('bw2-you-make-me-brave', 'You Make Me Brave', 'Amanda Cook', 'Contemporary', 'Bethel Music Publishing', 'E'),
  ccli('bw2-this-is-what-you-do', 'This Is What You Do', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'C'),
  ccli('bw2-spirit-move', 'Spirit Move', 'Kalley Heiligenthal', 'Contemporary', 'Bethel Music Publishing', 'G'),
  ccli('bw2-we-will-not-be-shaken', 'We Will Not Be Shaken', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'A'),
  ccli('bw2-be-enthroned', 'Be Enthroned', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'D'),
  ccli('bw2-starlight', 'Starlight', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'E'),
  ccli('bw2-heroes', 'Heroes (We Could Be)', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'D'),
  ccli('bw2-peace-be-still', 'Peace Be Still', 'Lauren Daigle', 'Contemporary', 'Bethel Music Publishing', 'F'),
  ccli('bw2-holy', 'Holy', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'A'),
  ccli('bw2-living-water', 'Living Water', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'G'),
  ccli('bw2-when-i-pray', 'When I Pray', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'C'),
]

const CHRIS_TOMLIN_WAVE2: BatchSong[] = [
  ccli('ct2-all-to-us', 'All to Us', 'Chris Tomlin', 'Contemporary', 'sixsteps Music', 'G'),
  ccli('ct2-at-the-cross', 'At the Cross (Love Ran Red)', 'Chris Tomlin', 'Contemporary', 'sixsteps Music', 'E'),
  ccli('ct2-endless-hallelujah', 'Endless Hallelujah', 'Chris Tomlin', 'Contemporary', 'sixsteps Music', 'D'),
  ccli('ct2-faithful', 'Faithful (Live)', 'Chris Tomlin', 'Contemporary', 'sixsteps Music', 'G'),
  ccli('ct2-his-love-endures', 'Your Grace Is Enough', 'Chris Tomlin', 'Contemporary', 'sixsteps Music', 'G'),
  ccli('ct2-i-lift-my-hands', 'I Lift My Hands', 'Chris Tomlin', 'Contemporary', 'sixsteps Music', 'C'),
  ccli('ct2-jesus-loves-me', 'Jesus Loves Me (Chris Tomlin)', 'Chris Tomlin', 'Contemporary', 'sixsteps Music', 'C'),
  ccli('ct2-magnificent', 'Magnificent', 'Chris Tomlin', 'Contemporary', 'sixsteps Music', 'A'),
  ccli('ct2-our-god', 'Our God', 'Chris Tomlin', 'Contemporary', 'sixsteps Music', 'G'),
  ccli('ct2-when-the-stars-burn-down', 'When the Stars Burn Down (Blessing and Honor)', 'Chris Tomlin', 'Contemporary', 'sixsteps Music', 'D'),
  ccli('ct2-white-flag', 'White Flag', 'Chris Tomlin', 'Contemporary', 'sixsteps Music', 'G'),
  ccli('ct2-burning-lights', 'Burning Lights', 'Chris Tomlin', 'Contemporary', 'sixsteps Music', 'A'),
  ccli('ct2-lay-me-down', 'Lay Me Down', 'Chris Tomlin', 'Contemporary', 'sixsteps Music', 'D'),
  ccli('ct2-jesus', 'Jesus', 'Chris Tomlin', 'Contemporary', 'sixsteps Music', 'G'),
]

const PASSION_WAVE2: BatchSong[] = [
  ccli('pw2-build-my-life-pass', 'Build My Life (Passion)', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'E'),
  ccli('pw2-death-was-arrested', 'Death Was Arrested', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('pw2-worthy-of-your-name', 'Worthy of Your Name', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('pw2-reign-above-it-all', 'Reign Above It All', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'B'),
  ccli('pw2-this-love', 'This Love', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('pw2-how-great-is-your-love', 'How Great Is Your Love', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('pw2-white-flag-pass', 'White Flag (Passion)', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'G'),
  ccli('pw2-praise-his-holy-name', 'Praise His Holy Name', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'C'),
  ccli('pw2-one-thing-remains', 'One Thing Remains (Passion)', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'D'),
  ccli('pw2-god-make-us-one', 'God Make Us One', 'Passion', 'Contemporary', 'Capitol CMG Publishing', 'G'),
]

const BRANDON_LAKE_WAVE2: BatchSong[] = [
  ccli('bl2-gratitude', 'Gratitude', 'Brandon Lake', 'Contemporary', 'Bethel Music Publishing', 'C'),
  ccli('bl2-praise-you-anywhere', 'Praise You Anywhere', 'Brandon Lake', 'Contemporary', 'Bethel Music Publishing', 'G'),
  ccli('bl2-holy-forever-bl', 'Holy Forever (Brandon Lake)', 'Brandon Lake', 'Contemporary', 'Bethel Music Publishing', 'G'),
  ccli('bl2-the-blessing', 'The Blessing (ft. Kari Jobe)', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'D'),
  ccli('bl2-battle-belongs', 'Battle Belongs', 'Phil Wickham', 'Contemporary', 'Phil Wickham Music', 'D'),
  ccli('bl2-yes-i-will', 'Yes I Will', 'Vertical Worship', 'Contemporary', 'Integrity Music', 'G'),
  ccli('bl2-king-of-kings-new', 'King of Kings (New)', 'Brandon Lake', 'Contemporary', 'Bethel Music Publishing', 'D'),
  ccli('bl2-my-testimony', 'My Testimony', 'Elevation Worship', 'Contemporary', 'Elevation Worship Publishing', 'G'),
  ccli('bl2-too-good-to-not-believe', 'Too Good to Not Believe', 'Brandon Lake', 'Contemporary', 'Bethel Music Publishing', 'A'),
  ccli('bl2-highlands', 'Highlands (Song of Ascent)', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'G'),
]

// ─────────────────────────────────────────────────────────────────────────────
// GOSPEL — Wave 2
// ─────────────────────────────────────────────────────────────────────────────

const GOSPEL_WAVE2: BatchSong[] = [
  ccli('gw2-take-me-to-the-king', 'Take Me to the King', 'Tamela Mann', 'Gospel', 'Tillymann Music Group', 'Bb'),
  ccli('gw2-this-place', 'This Place', 'Tamela Mann', 'Gospel', 'Tillymann Music Group', 'C'),
  ccli('gw2-change-me', 'Change Me', 'Tamela Mann', 'Gospel', 'Tillymann Music Group', 'F'),
  ccli('gw2-just-a-little-talk', 'Just a Little Talk With Jesus', 'Hezekiah Walker', 'Gospel', 'Verity Records', 'F'),
  ccli('gw2-every-praise', 'Every Praise', 'Hezekiah Walker', 'Gospel', 'Verity Records', 'C'),
  ccli('gw2-souled-out', 'Souled Out', 'Israel Houghton', 'Gospel', 'Integrity Music', 'E'),
  ccli('gw2-you-are-good-israel', 'You Are Good', 'Israel Houghton', 'Gospel', 'Integrity Music', 'C'),
  ccli('gw2-friend-of-god', 'Friend of God', 'Israel Houghton', 'Gospel', 'Integrity Music', 'G'),
  ccli('gw2-not-afraid', 'Not Afraid', 'Israel Houghton', 'Gospel', 'Integrity Music', 'A'),
  ccli('gw2-moving-forward', 'Moving Forward', 'Israel Houghton', 'Gospel', 'Integrity Music', 'Bb'),
  ccli('gw2-speak-to-my-heart', 'Speak to My Heart', 'Donnie McClurkin', 'Gospel', 'Verity Records', 'F'),
  ccli('gw2-stand', 'Stand', 'Donnie McClurkin', 'Gospel', 'Verity Records', 'G'),
  ccli('gw2-we-fall-down', 'We Fall Down', 'Donnie McClurkin', 'Gospel', 'Verity Records', 'D'),
  ccli('gw2-shout-to-the-lord-kmf', 'Shout to the Lord', 'Kirk Franklin', 'Gospel', 'Fo Yo Soul Music', 'C'),
  ccli('gw2-god-provides', "God Provides", 'Kirk Franklin', 'Gospel', 'Fo Yo Soul Music', 'G'),
  ccli('gw2-leanin-on-the-lord', "Lean On Me (Kirk Franklin)", 'Kirk Franklin', 'Gospel', 'Fo Yo Soul Music', 'Ab'),
  ccli('gw2-still-here', 'Still Here', 'Kirk Franklin', 'Gospel', 'Fo Yo Soul Music', 'F'),
  ccli('gw2-stomp', 'Stomp', 'Kirk Franklin', 'Gospel', 'Fo Yo Soul Music', 'C'),
  ccli('gw2-revolution', 'Revolution', 'Kirk Franklin', 'Gospel', 'Fo Yo Soul Music', 'G'),
  ccli('gw2-wanna-be-happy', 'I Want to Be Happy', 'Kirk Franklin', 'Gospel', 'Fo Yo Soul Music', 'Bb'),
]

const TASHA_WAVE2: BatchSong[] = [
  ccli('tw2-fill-this-place', 'Fill This Place', 'Tasha Cobbs Leonard', 'Gospel', 'Motown Gospel', 'Bb'),
  ccli('tw2-for-your-glory', 'For Your Glory', 'Tasha Cobbs Leonard', 'Gospel', 'Motown Gospel', 'G'),
  ccli('tw2-put-a-praise-on-it', 'Put a Praise on It', 'Tasha Cobbs Leonard', 'Gospel', 'Motown Gospel', 'Eb'),
  ccli('tw2-gracefully-broken', 'Gracefully Broken', 'Tasha Cobbs Leonard', 'Gospel', 'Motown Gospel', 'G'),
  ccli('tw2-great-is-your-mercy', 'Great Is Your Mercy (Towards Me)', 'Tasha Cobbs Leonard', 'Gospel', 'Motown Gospel', 'F'),
  ccli('tw2-the-name', 'The Name', 'Tasha Cobbs Leonard', 'Gospel', 'Motown Gospel', 'D'),
  ccli('tw2-im-getting-ready', "I'm Getting Ready", 'Tasha Cobbs Leonard', 'Gospel', 'Motown Gospel', 'C'),
  ccli('tw2-gotta-believe', 'Gotta Believe', 'Tasha Cobbs Leonard', 'Gospel', 'Motown Gospel', 'G'),
  ccli('tw2-you-still-love-me', 'You Still Love Me', 'Tasha Cobbs Leonard', 'Gospel', 'Motown Gospel', 'Ab'),
  ccli('tw2-raise-a-hallelujah-tc', 'Raise a Hallelujah (Tasha Cobbs)', 'Tasha Cobbs Leonard', 'Gospel', 'Motown Gospel', 'A'),
]

const TRAVIS_GREENE_WAVE2: BatchSong[] = [
  ccli('tg2-while-im-waiting', "While I'm Waiting", 'Travis Greene', 'Gospel', 'RCA Inspiration', 'F'),
  ccli('tg2-be-still', 'Be Still', 'Travis Greene', 'Gospel', 'RCA Inspiration', 'G'),
  ccli('tg2-fell-in-love', 'Fell in Love', 'Travis Greene', 'Gospel', 'RCA Inspiration', 'C'),
  ccli('tg2-when-i-worship-you', 'When I Worship You', 'Travis Greene', 'Gospel', 'RCA Inspiration', 'D'),
  ccli('tg2-testify', 'Testify', 'Travis Greene', 'Gospel', 'RCA Inspiration', 'A'),
  ccli('tg2-good-and-loved', 'Good and Loved', 'Travis Greene', 'Gospel', 'RCA Inspiration', 'G'),
  ccli('tg2-your-world', 'Your World', 'Travis Greene', 'Gospel', 'RCA Inspiration', 'E'),
]

const MARVIN_SAPP_WAVE2: BatchSong[] = [
  ccli('ms2-never-would-have-made-it', 'Never Would Have Made It', 'Marvin Sapp', 'Gospel', 'RCA Inspiration', 'Bb'),
  ccli('ms2-you-are-god-alone', 'You Are God Alone', 'Marvin Sapp', 'Gospel', 'RCA Inspiration', 'C'),
  ccli('ms2-here-i-am', 'Here I Am', 'Marvin Sapp', 'Gospel', 'RCA Inspiration', 'G'),
  ccli('ms2-praise-him-in-advance', 'Praise Him in Advance', 'Marvin Sapp', 'Gospel', 'RCA Inspiration', 'F'),
  ccli('ms2-thank-you-for-it-all', 'Thank You for It All', 'Marvin Sapp', 'Gospel', 'RCA Inspiration', 'Ab'),
  ccli('ms2-thirsty', 'Thirsty', 'Marvin Sapp', 'Gospel', 'RCA Inspiration', 'G'),
]

const FRED_HAMMOND_WAVE2: BatchSong[] = [
  ccli('fh2-you-are-my-daily-bread', 'You Are My Daily Bread', 'Fred Hammond', 'Gospel', 'Verity Records', 'F'),
  ccli('fh2-this-is-the-day', 'This Is the Day', 'Fred Hammond', 'Gospel', 'Verity Records', 'C'),
  ccli('fh2-blessed', 'Blessed', 'Fred Hammond', 'Gospel', 'Verity Records', 'G'),
  ccli('fh2-glory-to-glory', 'Glory to Glory to Glory', 'Fred Hammond', 'Gospel', 'Verity Records', 'Ab'),
  ccli('fh2-let-the-praise-begin', 'Let the Praise Begin', 'Fred Hammond', 'Gospel', 'Verity Records', 'D'),
  ccli('fh2-no-weapon', 'No Weapon', 'Fred Hammond', 'Gospel', 'Verity Records', 'Bb'),
  ccli('fh2-there-is-a-river', 'There Is a River', 'Fred Hammond', 'Gospel', 'Verity Records', 'E'),
]

const CECE_WINANS_WAVE2: BatchSong[] = [
  ccli('cc2-goodness-of-god', 'Goodness of God (CeCe Winans)', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'E'),
  ccli('cc2-well-done', 'Well Done', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'G'),
  ccli('cc2-more-than-this-world', 'More Than This World', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'D'),
  ccli('cc2-peace', 'Peace', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'C'),
  ccli('cc2-holy-one', 'Holy One (CeCe Winans)', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'F'),
  ccli('cc2-throne-room', 'Throne Room', 'CeCe Winans', 'Gospel', 'PureSprings Gospel', 'A'),
]

// ─────────────────────────────────────────────────────────────────────────────
// AFRICAN GOSPEL — Wave 2 (Expanded)
// ─────────────────────────────────────────────────────────────────────────────

const SINACH_WAVE2: BatchSong[] = [
  ccli('sn2-from-glory-to-glory', 'From Glory to Glory', 'Sinach', 'African Gospel', 'Integrity Music (Sinach)', 'D'),
  ccli('sn2-this-is-your-season', 'This Is Your Season', 'Sinach', 'African Gospel', 'Integrity Music (Sinach)', 'C'),
  ccli('sn2-your-grace', 'Your Grace', 'Sinach', 'African Gospel', 'Integrity Music (Sinach)', 'G'),
  ccli('sn2-jesus-is-on-the-main-line', 'Jesus Is On the Mainline', 'Sinach', 'African Gospel', 'Integrity Music (Sinach)', 'A'),
  ccli('sn2-great-i-am', 'Great I Am', 'Sinach', 'African Gospel', 'Integrity Music (Sinach)', 'G'),
  ccli('sn2-all-things', 'All Things', 'Sinach', 'African Gospel', 'Integrity Music (Sinach)', 'D'),
  ccli('sn2-holy-are-you-lord', 'Holy Are You Lord', 'Sinach', 'African Gospel', 'Integrity Music (Sinach)', 'F'),
]

const NATHANIEL_BASSEY_WAVE2: BatchSong[] = [
  ccli('nb2-onise-iyanu', 'Onise Iyanu', 'Nathaniel Bassey', 'African Gospel', 'Nathaniel Bassey Music', 'G', 'yo'),
  ccli('nb2-you-are-mighty', 'You Are Mighty (Live)', 'Nathaniel Bassey', 'African Gospel', 'Nathaniel Bassey Music', 'A'),
  ccli('nb2-praise-the-lord', 'Praise the Lord', 'Nathaniel Bassey', 'African Gospel', 'Nathaniel Bassey Music', 'F'),
  ccli('nb2-who-is-like-you', 'Who Is Like You', 'Nathaniel Bassey', 'African Gospel', 'Nathaniel Bassey Music', 'D'),
  ccli('nb2-great-great-is-he', 'Great Great Is He', 'Nathaniel Bassey', 'African Gospel', 'Nathaniel Bassey Music', 'G'),
  ccli('nb2-in-the-sanctuary', 'In the Sanctuary', 'Nathaniel Bassey', 'African Gospel', 'Nathaniel Bassey Music', 'E'),
  ccli('nb2-magnified', 'Magnified', 'Nathaniel Bassey', 'African Gospel', 'Nathaniel Bassey Music', 'A'),
  ccli('nb2-chioma-jesus', 'Chioma Jesus', 'Nathaniel Bassey', 'African Gospel', 'Nathaniel Bassey Music', 'Bb', 'ig'),
]

const MERCY_CHINWO_WAVE2: BatchSong[] = [
  ccli('mcw2-chukwuoma', 'Chukwuoma', 'Mercy Chinwo', 'African Gospel', 'EeZee Conceptz', 'F', 'ig'),
  ccli('mcw2-na-you-be-god', 'Na You Be God', 'Mercy Chinwo', 'African Gospel', 'EeZee Conceptz', 'G', 'pcm'),
  ccli('mcw2-incredible-god', 'Incredible God, Incredible Praises', 'Mercy Chinwo', 'African Gospel', 'EeZee Conceptz', 'D'),
  ccli('mcw2-yeshua', 'Yeshua', 'Mercy Chinwo', 'African Gospel', 'EeZee Conceptz', 'E', 'ig'),
  ccli('mcw2-you-are-the-reason', 'You Are the Reason', 'Mercy Chinwo', 'African Gospel', 'EeZee Conceptz', 'C'),
  ccli('mcw2-eze', 'Eze', 'Mercy Chinwo', 'African Gospel', 'EeZee Conceptz', 'Bb', 'ig'),
]

const DUNSIN_WAVE2: BatchSong[] = [
  ccli('dw2-breathe-again', 'Breathe Again', 'Dunsin Oyekan', 'African Gospel', 'Dunsin Oyekan Music', 'E'),
  ccli('dw2-glory', 'Glory (The Anthem)', 'Dunsin Oyekan', 'African Gospel', 'Dunsin Oyekan Music', 'D'),
  ccli('dw2-more-grace', 'More Grace', 'Dunsin Oyekan', 'African Gospel', 'Dunsin Oyekan Music', 'G'),
  ccli('dw2-you-alone-are-worthy', 'You Alone Are Worthy', 'Dunsin Oyekan', 'African Gospel', 'Dunsin Oyekan Music', 'A'),
  ccli('dw2-worship-alone', 'Worship Alone', 'Dunsin Oyekan', 'African Gospel', 'Dunsin Oyekan Music', 'C'),
  ccli('dw2-crown-him', 'Crown Him', 'Dunsin Oyekan', 'African Gospel', 'Dunsin Oyekan Music', 'F'),
  ccli('dw2-awaken', 'Awaken', 'Dunsin Oyekan', 'African Gospel', 'Dunsin Oyekan Music', 'D'),
  ccli('dw2-you-are-glorious', 'You Are Glorious', 'Dunsin Oyekan', 'African Gospel', 'Dunsin Oyekan Music', 'G'),
]

const FRANK_EDWARDS_WAVE2: BatchSong[] = [
  ccli('fe2-greater', 'Greater', 'Frank Edwards', 'African Gospel', 'Rocktown Records', 'C'),
  ccli('fe2-wonders', 'Wonders', 'Frank Edwards', 'African Gospel', 'Rocktown Records', 'G'),
  ccli('fe2-chukwu-ebube', 'Chukwu Ebube', 'Frank Edwards', 'African Gospel', 'Rocktown Records', 'F', 'ig'),
  ccli('fe2-new-song', 'New Song', 'Frank Edwards', 'African Gospel', 'Rocktown Records', 'D'),
  ccli('fe2-supernatural', 'Supernatural', 'Frank Edwards', 'African Gospel', 'Rocktown Records', 'A'),
  ccli('fe2-jesus-is-lord', 'Jesus Is Lord', 'Frank Edwards', 'African Gospel', 'Rocktown Records', 'E'),
  ccli('fe2-iyanu-oluwa', 'Iyanu Oluwa', 'Frank Edwards', 'African Gospel', 'Rocktown Records', 'Bb', 'yo'),
]

const TOPE_ALABI_WAVE2: BatchSong[] = [
  ccli('ta2-ore-ofe', 'Ore Ofe', 'Tope Alabi', 'African Gospel', 'Tope Alabi Music', 'F', 'yo'),
  ccli('ta2-jehovah-onise-iyanu', 'Jehovah Onise Iyanu', 'Tope Alabi', 'African Gospel', 'Tope Alabi Music', 'G', 'yo'),
  ccli('ta2-alagbara', 'Alagbara Ose Mimo', 'Tope Alabi', 'African Gospel', 'Tope Alabi Music', 'C', 'yo'),
  ccli('ta2-gbogbo-eda', 'Gbogbo Eda', 'Tope Alabi', 'African Gospel', 'Tope Alabi Music', 'D', 'yo'),
  ccli('ta2-you-deserve-the-glory', 'You Deserve the Glory', 'Tope Alabi', 'African Gospel', 'Tope Alabi Music', 'A'),
]

const GHANAIAN_GOSPEL: BatchSong[] = [
  ccli('gg-jesus-is-the-answer', 'Jesus Is the Answer', 'Joe Mettle', 'African Gospel', 'Joe Mettle Music', 'G'),
  ccli('gg-bo-noo-ni', 'Bo Noo Ni', 'Joe Mettle', 'African Gospel', 'Joe Mettle Music', 'C', 'other'),
  ccli('gg-ben-mpo-ade', 'Ben Mpo Ade', 'Joe Mettle', 'African Gospel', 'Joe Mettle Music', 'F', 'other'),
  ccli('gg-great-and-mighty', 'Great and Mighty', 'Sonnie Badu', 'African Gospel', 'Songs of Sonnie Badu', 'D'),
  ccli('gg-open-heaven', 'Open Heaven (Sonnie Badu)', 'Sonnie Badu', 'African Gospel', 'Songs of Sonnie Badu', 'A'),
  ccli('gg-wonders', 'Wonders (Sonnie Badu)', 'Sonnie Badu', 'African Gospel', 'Songs of Sonnie Badu', 'G'),
  ccli('gg-yaw', 'Yaw', 'Sonnie Badu', 'African Gospel', 'Songs of Sonnie Badu', 'E', 'other'),
  ccli('gg-wonder-god', 'Wonder God', 'Empress Gifty', 'African Gospel', 'Empress Gifty Music', 'F', 'other'),
  ccli('gg-hallelujah-overflow', 'Hallelujah Overflow', 'MOGmusic', 'African Gospel', 'MOGmusic', 'G', 'other'),
  ccli('gg-w-won-t-go-back', "Won't Go Back", 'William McDowell', 'African Gospel', 'Delivery Room Music', 'C'),
]

const EAST_AFRICA_GOSPEL: BatchSong[] = [
  ccli('ea-bwana-yupo', 'Bwana Yupo', 'Bahati Bukuku', 'African Gospel', 'Bahati Bukuku Music', 'G', 'sw'),
  ccli('ea-yesu-ni-bora', 'Yesu Ni Bora', 'Rose Muhando', 'African Gospel', 'Rose Muhando Music', 'C', 'sw'),
  ccli('ea-mpenzi-yesu', 'Mpenzi Yesu', 'Zabron Singers', 'African Gospel', 'Zabron Singers Music', 'F', 'sw'),
  ccli('ea-niambie-wewe', 'Niambie Wewe', 'Emmy Kosgei', 'African Gospel', 'Emmy Kosgei Music', 'D', 'sw'),
  ccli('ea-nakupenda-jesu', 'Nakupenda Jesu', 'Christina Shusho', 'African Gospel', 'Christina Shusho Music', 'G', 'sw'),
  ccli('ea-baba-nakushukuru', 'Baba Nakushukuru', 'Christina Shusho', 'African Gospel', 'Christina Shusho Music', 'E', 'sw'),
  ccli('ea-msalaba', 'Msalaba', 'Bahati Bukuku', 'African Gospel', 'Bahati Bukuku Music', 'A', 'sw'),
  ccli('ea-amina', 'Amina', 'Rose Muhando', 'African Gospel', 'Rose Muhando Music', 'Bb', 'sw'),
]

const FRENCH_GOSPEL: BatchSong[] = [
  ccli('fr-tu-es-dieu', 'Tu Es Dieu', 'Béatrice Konan', 'African Gospel', 'Béatrice Konan Music', 'G', 'fr'),
  ccli('fr-hosanna-fr', 'Hosanna (French)', 'Gloire et Louange', 'African Gospel', 'Gloire et Louange', 'C', 'fr'),
  ccli('fr-tout-est-possible', 'Tout Est Possible', 'Anne Tchana', 'African Gospel', 'Anne Tchana Music', 'D', 'fr'),
  ccli('fr-seigneur-tu-es-grand', 'Seigneur Tu Es Grand', 'Monique Séka', 'African Gospel', 'Monique Séka Music', 'F', 'fr'),
  ccli('fr-gloire-a-toi', 'Gloire à Toi', 'Eric Moussambote', 'African Gospel', 'Eric Moussambote Music', 'A', 'fr'),
  ccli('fr-chante-alleluia', 'Chante Alléluia', 'Sœurs Comlan', 'African Gospel', 'Sœurs Comlan Music', 'E', 'fr'),
  ccli('fr-je-suis-sauve', 'Je Suis Sauvé', 'Dena Mwana', 'African Gospel', 'Dena Mwana Music', 'G', 'fr'),
  ccli('fr-dieu-est-si-bon', 'Dieu Est Si Bon', 'Carine Moumbé', 'African Gospel', 'Carine Moumbé Music', 'Bb', 'fr'),
]

// ─────────────────────────────────────────────────────────────────────────────
// TRADITIONAL HYMNS — Public Domain (pre-1928)
// ─────────────────────────────────────────────────────────────────────────────

const PUBLIC_DOMAIN_HYMNS: BatchSong[] = [
  pd('pdh-all-hail-power', 'All Hail the Power of Jesus\' Name', 'Edward Perronet', 'Hymn', 'Bb'),
  pd('pdh-be-thou-my-vision', 'Be Thou My Vision', 'Dallan Forgaill / Mary Byrne', 'Hymn', 'D'),
  pd('pdh-when-i-survey', 'When I Survey the Wondrous Cross', 'Isaac Watts', 'Hymn', 'G'),
  pd('pdh-to-god-be-the-glory', 'To God Be the Glory', 'Fanny Crosby', 'Hymn', 'Bb'),
  pd('pdh-trust-and-obey', 'Trust and Obey', 'John Henry Sammis', 'Hymn', 'F'),
  pd('pdh-what-a-friend', 'What a Friend We Have in Jesus', 'Joseph M. Scriven', 'Hymn', 'F'),
  pd('pdh-take-my-life', 'Take My Life and Let It Be', 'Frances Ridley Havergal', 'Hymn', 'D'),
  pd('pdh-blessed-assurance', 'Blessed Assurance', 'Fanny Crosby', 'Hymn', 'G'),
  pd('pdh-abide-with-me', 'Abide With Me', 'Henry Francis Lyte', 'Hymn', 'Eb'),
  pd('pdh-a-mighty-fortress', 'A Mighty Fortress Is Our God', 'Martin Luther', 'Hymn', 'D'),
  pd('pdh-onward-christian', 'Onward Christian Soldiers', 'Sabine Baring-Gould', 'Hymn', 'Eb'),
  pd('pdh-come-thou-fount', 'Come Thou Fount of Every Blessing', 'Robert Robinson', 'Hymn', 'G'),
  pd('pdh-holy-holy-holy', 'Holy Holy Holy', 'Reginald Heber', 'Hymn', 'Bb'),
  pd('pdh-at-the-cross', 'At the Cross', 'Isaac Watts / Ralph E. Hudson', 'Hymn', 'F'),
  pd('pdh-pass-me-not', 'Pass Me Not O Gentle Savior', 'Fanny Crosby', 'Hymn', 'Bb'),
  pd('pdh-nearer-my-god', 'Nearer My God to Thee', 'Sarah Flower Adams', 'Hymn', 'G'),
  pd('pdh-just-as-i-am', 'Just As I Am', 'Charlotte Elliott', 'Hymn', 'F'),
  pd('pdh-power-in-the-blood', 'There Is Power in the Blood', 'Lewis E. Jones', 'Hymn', 'C'),
  pd('pdh-nothing-but-the-blood', 'Nothing But the Blood', 'Robert Lowry', 'Hymn', 'F'),
  pd('pdh-i-need-thee', 'I Need Thee Every Hour', 'Annie Sherwood Hawks', 'Hymn', 'G'),
  pd('pdh-sweet-hour-of-prayer', 'Sweet Hour of Prayer', 'William Walford', 'Hymn', 'D'),
  pd('pdh-leaning-on-everlasting', 'Leaning on the Everlasting Arms', 'Elisha A. Hoffman', 'Hymn', 'A'),
  pd('pdh-the-solid-rock', 'The Solid Rock', 'Edward Mote', 'Hymn', 'Bb'),
  pd('pdh-when-the-roll', 'When the Roll Is Called Up Yonder', 'James Milton Black', 'Hymn', 'G'),
  pd('pdh-softly-and-tenderly', 'Softly and Tenderly Jesus Is Calling', 'Will Lamartine Thompson', 'Hymn', 'F'),
  pd('pdh-amazing-grace-classic', 'Amazing Grace', 'John Newton', 'Hymn', 'G'),
  pd('pdh-how-firm-foundation', 'How Firm a Foundation', 'John Rippon', 'Hymn', 'Eb'),
  pd('pdh-praise-to-the-lord', 'Praise to the Lord the Almighty', 'Joachim Neander', 'Hymn', 'F'),
  pd('pdh-how-great-thou-art-classic', 'How Great Thou Art', 'Carl Boberg / Stuart K. Hine', 'Hymn', 'Bb'),
  pd('pdh-angels-we-have-heard', 'Angels We Have Heard on High', 'Traditional French', 'Hymn', 'G'),
  pd('pdh-silent-night', 'Silent Night', 'Franz Xaver Gruber', 'Hymn', 'C'),
  pd('pdh-joy-to-the-world', 'Joy to the World', 'Isaac Watts', 'Hymn', 'D'),
  pd('pdh-o-little-town-bethlehem', 'O Little Town of Bethlehem', 'Phillips Brooks', 'Hymn', 'F'),
  pd('pdh-o-come-all-ye-faithful', 'O Come All Ye Faithful', 'John Francis Wade', 'Hymn', 'G'),
  pd('pdh-hark-herald-angels', 'Hark the Herald Angels Sing', 'Charles Wesley', 'Hymn', 'G'),
  pd('pdh-o-worship-the-king', 'O Worship the King', 'Robert Grant', 'Hymn', 'Eb'),
  pd('pdh-crown-him', 'Crown Him with Many Crowns', 'Matthew Bridges / Godfrey Thring', 'Hymn', 'Eb'),
  pd('pdh-the-old-rugged-cross', 'The Old Rugged Cross', 'George Bennard', 'Hymn', 'F'),
  pd('pdh-standing-on-the-promises', 'Standing on the Promises', 'R. Kelso Carter', 'Hymn', 'Bb'),
  pd('pdh-higher-ground', 'Higher Ground', 'Johnson Oatman Jr.', 'Hymn', 'G'),
  pd('pdh-the-blood-will-never-lose', 'The Blood Will Never Lose Its Power', 'Andraé Crouch', 'Hymn', 'Ab'),
  pd('pdh-my-faith-looks-up', 'My Faith Looks Up to Thee', 'Ray Palmer', 'Hymn', 'D'),
  pd('pdh-rock-of-ages', 'Rock of Ages', 'Augustus M. Toplady', 'Hymn', 'C'),
  pd('pdh-it-is-well', 'It Is Well With My Soul', 'Horatio Spafford', 'Hymn', 'Bb'),
  pd('pdh-great-is-thy-faithfulness', 'Great Is Thy Faithfulness', 'Thomas O. Chisholm', 'Hymn', 'Bb'),
  pd('pdh-this-is-my-father', "This Is My Father's World", 'Maltbie D. Babcock', 'Hymn', 'G'),
  pd('pdh-fairest-lord-jesus', 'Fairest Lord Jesus', 'Traditional German', 'Hymn', 'C'),
  pd('pdh-immortal-invisible', 'Immortal Invisible God Only Wise', 'Walter Chalmers Smith', 'Hymn', 'F'),
  pd('pdh-all-creatures', 'All Creatures of Our God and King', 'Francis of Assisi', 'Hymn', 'Bb'),
  pd('pdh-doxology', 'Doxology (Praise God from Whom All Blessings)', 'Thomas Ken', 'Hymn', 'G'),
]

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT-PENDING (post-1928 traditional / standard hymns, rights TBD)
// ─────────────────────────────────────────────────────────────────────────────

const AUDIT_PENDING_HYMNS: BatchSong[] = [
  ap('aph-blessed-redeemer', 'Blessed Redeemer', 'Avis B. Christiansen', 'Hymn', 'F'),
  ap('aph-because-he-lives', 'Because He Lives', 'Bill Gaither', 'Hymn', 'G'),
  ap('aph-he-touched-me', 'He Touched Me', 'Bill Gaither', 'Hymn', 'C'),
  ap('aph-the-king-is-coming', 'The King Is Coming', 'Gloria Gaither', 'Hymn', 'D'),
  ap('aph-something-beautiful', 'Something Beautiful', 'Bill Gaither', 'Hymn', 'G'),
  ap('aph-family-of-god', 'The Family of God', 'Bill Gaither', 'Hymn', 'F'),
  ap('aph-jesus-name-above', 'Jesus (Name Above All Names)', 'Naida Hearn', 'Hymn', 'G'),
  ap('aph-you-are-my-all-in-all', 'You Are My All in All', 'Dennis L. Jernigan', 'Hymn', 'D'),
  ap('aph-lord-i-lift-your-name', 'Lord I Lift Your Name on High', 'Rick Founds', 'Contemporary', 'G'),
  ap('aph-shine-jesus-shine', 'Shine Jesus Shine', 'Graham Kendrick', 'Contemporary', 'C'),
  ap('aph-great-is-the-lord', 'Great Is the Lord', 'Michael W. Smith', 'Contemporary', 'D'),
  ap('aph-el-shaddai', 'El Shaddai', 'Michael Card', 'Contemporary', 'G'),
  ap('aph-above-all', 'Above All', 'Michael W. Smith', 'Contemporary', 'C'),
  ap('aph-via-dolorosa', 'Via Dolorosa', 'Sandi Patty', 'Contemporary', 'Gm'),
  ap('aph-in-his-presence', 'In His Presence', 'Dick Torrans', 'Hymn', 'G'),
  ap('aph-spirit-song', 'Spirit Song', 'John Wimber', 'Contemporary', 'D'),
  ap('aph-holy-ground', 'Holy Ground', 'Geron Davis', 'Contemporary', 'Bb'),
  ap('aph-give-thanks', 'Give Thanks', 'Henry Smith', 'Contemporary', 'D'),
  ap('aph-as-the-deer', 'As the Deer', 'Martin J. Nystrom', 'Contemporary', 'G'),
  ap('aph-oh-how-i-love-jesus', 'Oh How I Love Jesus', 'Frederick Whitfield', 'Hymn', 'G'),
]

// ─────────────────────────────────────────────────────────────────────────────
// ADDITIONAL CONTEMPORARY ARTISTS — Wave 2
// ─────────────────────────────────────────────────────────────────────────────

const ADDITIONAL_WAVE2: BatchSong[] = [
  ccli('aw2-oceans-bethel', 'Oceans (Bethel Cover)', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'D'),
  ccli('aw2-what-a-beautiful-name-live', 'What a Beautiful Name (Live)', 'Hillsong Worship', 'Contemporary', 'Hillsong Publishing', 'D'),
  ccli('aw2-tremble', 'Tremble', 'Mosaic MSC', 'Contemporary', 'Mosaic MSC Publishing', 'C'),
  ccli('aw2-peace-room', 'Peace Room', 'Mosaic MSC', 'Contemporary', 'Mosaic MSC Publishing', 'G'),
  ccli('aw2-tis-so-sweet', "Tis So Sweet to Trust in Jesus", 'Louisa M. R. Stead', 'Contemporary', 'Public Domain Arrangement', 'G'),
  ccli('aw2-goodness-is-running', 'Goodness Is Running After Me', 'Housefires', 'Contemporary', 'Housefires Songs', 'G'),
  ccli('aw2-nobody-like-you', 'Nobody Like You', 'Housefires', 'Contemporary', 'Housefires Songs', 'C'),
  ccli('aw2-pour-it-out-again', 'Pour It Out Again', 'Housefires', 'Contemporary', 'Housefires Songs', 'D'),
  ccli('aw2-flow', 'Flow', 'Housefires', 'Contemporary', 'Housefires Songs', 'G'),
  ccli('aw2-so-good', 'So Good', 'Housefires', 'Contemporary', 'Housefires Songs', 'A'),
  ccli('aw2-kingdom-of-god', 'Kingdom of God', 'Brandon Lake', 'Contemporary', 'Bethel Music Publishing', 'C'),
  ccli('aw2-praise-before-my-breakthrough', 'Praise Before My Breakthrough', 'Bryan and Katie Torwalt', 'Contemporary', 'Jesus Culture Music', 'G'),
  ccli('aw2-holy-spirit', 'Holy Spirit', 'Bryan and Katie Torwalt', 'Contemporary', 'Jesus Culture Music', 'C'),
  ccli('aw2-you-have-won', 'You Have Won', 'Jesus Culture', 'Contemporary', 'Jesus Culture Music', 'G'),
  ccli('aw2-im-finding-my-way-back', 'Finding My Way Back', 'Jesus Culture', 'Contemporary', 'Jesus Culture Music', 'D'),
  ccli('aw2-one-thirst', 'One Thirst', 'Jesus Culture', 'Contemporary', 'Jesus Culture Music', 'E'),
  ccli('aw2-in-the-river', 'In the River', 'Jesus Culture', 'Contemporary', 'Jesus Culture Music', 'G'),
  ccli('aw2-let-it-rain', 'Let It Rain', 'Michael W. Smith', 'Contemporary', 'Smittyfly Music', 'E'),
  ccli('aw2-surrounded-live', 'Surrounded (Live)', 'Michael W. Smith', 'Contemporary', 'Smittyfly Music', 'D'),
  ccli('aw2-breathe-new', 'Breathe', 'Michael W. Smith', 'Contemporary', 'Smittyfly Music', 'G'),
  ccli('aw2-you-are-holy', 'You Are Holy (Prince of Peace)', 'Michael W. Smith', 'Contemporary', 'Smittyfly Music', 'C'),
  ccli('aw2-agnus-dei', 'Agnus Dei', 'Michael W. Smith', 'Contemporary', 'Smittyfly Music', 'G'),
  ccli('aw2-draw-me-close', 'Draw Me Close', 'Kelly Carpenter', 'Contemporary', 'Vineyard Publishing', 'D'),
  ccli('aw2-arms-of-love', 'Arms of Love', 'Craig Musseau', 'Contemporary', 'Vineyard Publishing', 'G'),
  ccli('aw2-come-holy-spirit', 'Come Holy Spirit', 'Andy Park', 'Contemporary', 'Vineyard Publishing', 'G'),
  ccli('aw2-open-the-eyes', 'Open the Eyes of My Heart', 'Paul Baloche', 'Contemporary', 'Integrity Music', 'A'),
  ccli('aw2-hosanna-baloche', 'Hosanna (Paul Baloche)', 'Paul Baloche', 'Contemporary', 'Integrity Music', 'E'),
  ccli('aw2-lead-me-to-the-cross', 'Lead Me to the Cross', 'Hillsong United', 'Contemporary', 'Hillsong Publishing', 'D'),
  ccli('aw2-forever', 'Forever', 'Kari Jobe', 'Contemporary', 'Sparrow Records', 'G'),
  ccli('aw2-i-am-not-alone', 'I Am Not Alone', 'Kari Jobe', 'Contemporary', 'Sparrow Records', 'G'),
  ccli('aw2-rise', 'Rise', 'Kari Jobe', 'Contemporary', 'Sparrow Records', 'C'),
  ccli('aw2-heal-our-land', 'Heal Our Land', 'Kari Jobe', 'Contemporary', 'Sparrow Records', 'G'),
  ccli('aw2-let-the-church-rise', 'Let the Church Rise', 'Jonathan Stockstill', 'Contemporary', 'Integrity Music', 'G'),
  ccli('aw2-let-the-redeemed', 'Let the Redeemed', 'Don Moen', 'Contemporary', 'Integrity Music', 'G'),
  ccli('aw2-god-is-good-all-the-time', 'God Is Good All the Time', 'Don Moen', 'Contemporary', 'Integrity Music', 'A'),
  ccli('aw2-i-will-sing', 'I Will Sing', 'Don Moen', 'Contemporary', 'Integrity Music', 'G'),
  ccli('aw2-celebrate-jesus', 'Celebrate Jesus Celebrate', 'Gary Oliver', 'Contemporary', 'Integrity Music', 'G'),
  ccli('aw2-i-exalt-thee', 'I Exalt Thee', 'Pete Sanchez Jr.', 'Contemporary', 'Integrity Music', 'D'),
  ccli('aw2-crown-him-now', 'Crown Him (Majesty)', 'Delirious?', 'Contemporary', 'Furious? Records', 'G'),
  ccli('aw2-history-maker', 'History Maker', 'Delirious?', 'Contemporary', 'Furious? Records', 'G'),
  ccli('aw2-god-of-wonders', 'God of Wonders', 'Steve Hindalong & Marc Byrd', 'Contemporary', 'New Spring Publishing', 'D'),
  ccli('aw2-indescribable', 'Indescribable', 'Chris Tomlin', 'Contemporary', 'sixsteps Music', 'A'),
  ccli('aw2-forever-live', 'Forever (We Sing Hallelujah)', 'Bethel Music', 'Contemporary', 'Bethel Music Publishing', 'C'),
  ccli('aw2-the-heart-of-worship', 'The Heart of Worship', 'Matt Redman', 'Contemporary', 'Thankyou Music', 'D'),
  ccli('aw2-blessed-be-your-name', 'Blessed Be Your Name', 'Matt Redman', 'Contemporary', 'Thankyou Music', 'A'),
  ccli('aw2-never-gonna-stop-singing', 'Never Gonna Stop Singing', 'Matt Redman', 'Contemporary', 'Thankyou Music', 'G'),
  ccli('aw2-all-i-have-is-christ', 'All I Have Is Christ', 'Sovereign Grace Music', 'Contemporary', 'Sovereign Grace Music', 'G'),
  ccli('aw2-before-the-throne-of-god', 'Before the Throne of God Above', 'Charitie Lees Bancroft', 'Contemporary', 'Sovereign Grace Music', 'D'),
  ccli('aw2-in-christ-alone', 'In Christ Alone', 'Keith Getty / Stuart Townend', 'Contemporary', 'Thankyou Music', 'D'),
  ccli('aw2-speak-o-lord', 'Speak O Lord', 'Keith Getty / Stuart Townend', 'Contemporary', 'Thankyou Music', 'C'),
  ccli('aw2-by-his-wounds', 'By His Wounds', 'Mac Powell', 'Contemporary', 'Thankyou Music', 'G'),
]

// ─────────────────────────────────────────────────────────────────────────────
// MORE CONTEMPORARY ARTISTS — Wave 2 Supplement
// ─────────────────────────────────────────────────────────────────────────────

const CASTING_CROWNS_WAVE2: BatchSong[] = [
  ccli('cc2w-praise-you-in-this-storm', 'Praise You in This Storm', 'Casting Crowns', 'Contemporary', 'Club Zoo Music', 'D'),
  ccli('cc2w-who-am-i', 'Who Am I', 'Casting Crowns', 'Contemporary', 'Club Zoo Music', 'G'),
  ccli('cc2w-already-there', 'Already There', 'Casting Crowns', 'Contemporary', 'Club Zoo Music', 'G'),
  ccli('cc2w-just-be-held', 'Just Be Held', 'Casting Crowns', 'Contemporary', 'Club Zoo Music', 'G'),
  ccli('cc2w-voice-of-truth', 'Voice of Truth', 'Casting Crowns', 'Contemporary', 'Club Zoo Music', 'C'),
  ccli('cc2w-lifesong', 'Lifesong', 'Casting Crowns', 'Contemporary', 'Club Zoo Music', 'G'),
  ccli('cc2w-if-we-are-the-body', 'If We Are the Body', 'Casting Crowns', 'Contemporary', 'Club Zoo Music', 'C'),
  ccli('cc2w-slow-fade', 'Slow Fade', 'Casting Crowns', 'Contemporary', 'Club Zoo Music', 'A'),
  ccli('cc2w-here-i-go-again', 'Here I Go Again', 'Casting Crowns', 'Contemporary', 'Club Zoo Music', 'D'),
  ccli('cc2w-until-the-whole-world-hears', 'Until the Whole World Hears', 'Casting Crowns', 'Contemporary', 'Club Zoo Music', 'E'),
]

const MERCYME_WAVE2: BatchSong[] = [
  ccli('mm2-word-of-god-speak', 'Word of God Speak', 'MercyMe', 'Contemporary', 'Simpleville Music', 'G'),
  ccli('mm2-i-can-only-imagine', 'I Can Only Imagine', 'MercyMe', 'Contemporary', 'Simpleville Music', 'Bb'),
  ccli('mm2-coming-up-to-breathe', 'Coming Up to Breathe', 'MercyMe', 'Contemporary', 'Simpleville Music', 'G'),
  ccli('mm2-beautiful', 'Beautiful (MercyMe)', 'MercyMe', 'Contemporary', 'Simpleville Music', 'G'),
  ccli('mm2-so-long-self', 'So Long Self', 'MercyMe', 'Contemporary', 'Simpleville Music', 'A'),
  ccli('mm2-you-reign', 'You Reign', 'MercyMe', 'Contemporary', 'Simpleville Music', 'G'),
  ccli('mm2-finally-home', 'Finally Home', 'MercyMe', 'Contemporary', 'Simpleville Music', 'G'),
  ccli('mm2-greater', 'Greater', 'MercyMe', 'Contemporary', 'Simpleville Music', 'C'),
  ccli('mm2-grace-got-you', 'Grace Got You', 'MercyMe', 'Contemporary', 'Simpleville Music', 'G'),
  ccli('mm2-even-if', 'Even If', 'MercyMe', 'Contemporary', 'Simpleville Music', 'F'),
]

const LAUREN_DAIGLE_WAVE2: BatchSong[] = [
  ccli('ld2-trust-in-you', 'Trust in You', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'G'),
  ccli('ld2-you-say', 'You Say', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'G'),
  ccli('ld2-rescue', 'Rescue', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'C'),
  ccli('ld2-how-can-it-be', 'How Can It Be', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'D'),
  ccli('ld2-still-rolling-stones', 'Still Rolling Stones', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'G'),
  ccli('ld2-love-like-this', 'Love Like This', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'F'),
  ccli('ld2-turn-your-eyes-upon-jesus', 'Turn Your Eyes Upon Jesus (Lauren Daigle)', 'Lauren Daigle', 'Contemporary', 'Centricity Music', 'D'),
]

const MATT_REDMAN_WAVE2: BatchSong[] = [
  ccli('mr2-you-alone-can-rescue', 'You Alone Can Rescue', 'Matt Redman', 'Contemporary', 'Thankyou Music', 'G'),
  ccli('mr2-our-god', 'Our God (Matt Redman)', 'Matt Redman', 'Contemporary', 'Thankyou Music', 'G'),
  ccli('mr2-always', 'Always', 'Matt Redman', 'Contemporary', 'Thankyou Music', 'C'),
  ccli('mr2-beautiful-news', 'Beautiful News', 'Matt Redman', 'Contemporary', 'Thankyou Music', 'A'),
  ccli('mr2-nothing-but-the-blood', 'Nothing But the Blood (Matt Redman)', 'Matt Redman', 'Contemporary', 'Thankyou Music', 'G'),
  ccli('mr2-oh-this-god', 'Oh This God', 'Matt Redman', 'Contemporary', 'Thankyou Music', 'D'),
  ccli('mr2-facedown', 'Facedown', 'Matt Redman', 'Contemporary', 'Thankyou Music', 'G'),
  ccli('mr2-once-again', 'Once Again', 'Matt Redman', 'Contemporary', 'Thankyou Music', 'D'),
  ccli('mr2-better-is-one-day', 'Better Is One Day', 'Matt Redman', 'Contemporary', 'Thankyou Music', 'A'),
]

const KARI_JOBE_WAVE2: BatchSong[] = [
  ccli('kj2-holy', 'Holy (Kari Jobe)', 'Kari Jobe', 'Contemporary', 'Sparrow Records', 'A'),
  ccli('kj2-revelation-song', 'Revelation Song', 'Kari Jobe', 'Contemporary', 'Sparrow Records', 'E'),
  ccli('kj2-we-are', 'We Are', 'Kari Jobe', 'Contemporary', 'Sparrow Records', 'D'),
  ccli('kj2-love-came-down', 'Love Came Down', 'Kari Jobe', 'Contemporary', 'Sparrow Records', 'G'),
  ccli('kj2-breathe-on-us', 'Breathe on Us', 'Kari Jobe', 'Contemporary', 'Sparrow Records', 'C'),
  ccli('kj2-speak-to-me', 'Speak to Me', 'Kari Jobe', 'Contemporary', 'Sparrow Records', 'D'),
  ccli('kj2-steady-my-heart', 'Steady My Heart', 'Kari Jobe', 'Contemporary', 'Sparrow Records', 'Bb'),
  ccli('kj2-find-you-on-my-knees', 'Find You on My Knees', 'Kari Jobe', 'Contemporary', 'Sparrow Records', 'E'),
]

const VERTICAL_WORSHIP: BatchSong[] = [
  ccli('vw-raise-a-hallelujah', 'Raise a Hallelujah (Vertical)', 'Vertical Worship', 'Contemporary', 'Integrity Music', 'A'),
  ccli('vw-spirit-of-the-living-god', 'Spirit of the Living God (Vertical)', 'Vertical Worship', 'Contemporary', 'Integrity Music', 'G'),
  ccli('vw-church-i-will-build', 'Church I Will Build', 'Vertical Worship', 'Contemporary', 'Integrity Music', 'D'),
  ccli('vw-behold', 'Behold (Vertical)', 'Vertical Worship', 'Contemporary', 'Integrity Music', 'C'),
  ccli('vw-worthy-and-wonderful', 'Worthy and Wonderful', 'Vertical Worship', 'Contemporary', 'Integrity Music', 'G'),
  ccli('vw-my-hope-is-in-you', 'My Hope Is in You', 'Vertical Worship', 'Contemporary', 'Integrity Music', 'C'),
]

const TAUREN_WELLS: BatchSong[] = [
  ccli('tw-hills-and-valleys', 'Hills and Valleys', 'Tauren Wells', 'Contemporary', 'RCA Inspiration', 'G'),
  ccli('tw-known', 'Known', 'Tauren Wells', 'Contemporary', 'RCA Inspiration', 'Bb'),
  ccli('tw-who-you-say-i-am-tw', 'Who You Say I Am (Tauren Wells)', 'Tauren Wells', 'Contemporary', 'RCA Inspiration', 'C'),
  ccli('tw-revolutionary', 'Revolutionary', 'Tauren Wells', 'Contemporary', 'RCA Inspiration', 'G'),
  ccli('tw-love-is-action', 'Love Is Action', 'Tauren Wells', 'Contemporary', 'RCA Inspiration', 'D'),
  ccli('tw-famous-one', 'Famous One', 'Tauren Wells', 'Contemporary', 'RCA Inspiration', 'G'),
]

const CHRIS_STAPLETON_GOSPEL: BatchSong[] = [
  ccli('cst-waiting-on-june', 'Nobody to Blame', 'Carrie Underwood', 'Gospel', 'Capitol CMG Publishing', 'G'),
  ccli('cst-something-in-the-water', 'Something in the Water', 'Carrie Underwood', 'Gospel', 'Capitol CMG Publishing', 'G'),
  ccli('cst-how-great-thou-art-ctu', 'How Great Thou Art (Carrie Underwood)', 'Carrie Underwood', 'Gospel', 'Capitol CMG Publishing', 'G'),
  ccli('cst-go-rest-high', 'Go Rest High on That Mountain', 'Vince Gill', 'Gospel', 'MCA Nashville', 'D'),
]

const ADDITIONAL_GOSPEL_ARTISTS: BatchSong[] = [
  ccli('aga-pour-out-my-heart', 'Pour Out My Heart', 'Craig Musseau', 'Gospel', 'Vineyard Publishing', 'D'),
  ccli('aga-worthy-is-the-lamb', 'Worthy Is the Lamb', 'Darlene Zschech', 'Gospel', 'Hillsong Publishing', 'Eb'),
  ccli('aga-the-potter-s-hand', "The Potter's Hand", 'Darlene Zschech', 'Gospel', 'Hillsong Publishing', 'G'),
  ccli('aga-shout-to-the-lord-dz', 'Shout to the Lord (Darlene Zschech)', 'Darlene Zschech', 'Gospel', 'Hillsong Publishing', 'Bb'),
  ccli('aga-giver-of-life', 'Giver of Life', 'Laura Hackett Park', 'Gospel', 'Forerunner Music', 'G'),
  ccli('aga-hallelujah-to-the-lord', 'Hallelujah (Praise the Lord)', 'Cece Winans', 'Gospel', 'PureSprings Gospel', 'C'),
  ccli('aga-your-love-is-amazing', 'Your Love Is Amazing', 'Brenton Brown', 'Contemporary', 'Thankyou Music', 'G'),
  ccli('aga-everlasting-god', 'Everlasting God', 'Brenton Brown', 'Contemporary', 'Thankyou Music', 'C'),
  ccli('aga-lord-reign-in-me', 'Lord Reign in Me', 'Brenton Brown', 'Contemporary', 'Thankyou Music', 'G'),
  ccli('aga-humble-king', 'Humble King', 'Brenton Brown', 'Contemporary', 'Thankyou Music', 'D'),
  ccli('aga-revelation-song-ps', 'Revelation Song', 'Jennie Lee Riddle', 'Contemporary', 'Gateway Create Publishing', 'E'),
  ccli('aga-glorious', 'Glorious', 'Martha Munizzi', 'Contemporary', 'Martha Munizzi Music', 'C'),
  ccli('aga-say-so', 'Say So', 'Israel Houghton', 'Gospel', 'Integrity Music', 'G'),
  ccli('aga-alpha-omega', 'Alpha and Omega', 'Israel Houghton', 'Gospel', 'Integrity Music', 'D'),
  ccli('aga-shekinah-glory', 'Shekinah Glory (Wait on You)', 'Israel Houghton', 'Gospel', 'Integrity Music', 'Eb'),
  ccli('aga-holy-is-your-name', 'Holy Is Your Name', 'Jonathan Butler', 'Gospel', 'RCA Inspiration', 'G'),
  ccli('aga-in-the-name-of-jesus', 'In the Name of Jesus (Jonathan Butler)', 'Jonathan Butler', 'Gospel', 'RCA Inspiration', 'Bb'),
  ccli('aga-you-are-the-source', 'You Are the Source of My Strength', 'Bishop Paul S. Morton', 'Gospel', 'Full Gospel Publishing', 'F'),
  ccli('aga-hold-on', 'Hold On', 'Bishop Paul S. Morton', 'Gospel', 'Full Gospel Publishing', 'G'),
  ccli('aga-please-dont-pass-me-by', "Please Don't Pass Me By", 'Andraé Crouch', 'Gospel', 'Bud John Songs', 'Bb'),
  ccli('aga-my-tribute', 'My Tribute (To God Be the Glory)', 'Andraé Crouch', 'Gospel', 'Bud John Songs', 'Bb'),
  ccli('aga-soon-and-very-soon', 'Soon and Very Soon', 'Andraé Crouch', 'Gospel', 'Bud John Songs', 'Bb'),
  ccli('aga-jesus-is-the-answer-ac', 'Jesus Is the Answer', 'Andraé Crouch', 'Gospel', 'Bud John Songs', 'F'),
  ccli('aga-through-it-all', 'Through It All', 'Andraé Crouch', 'Gospel', 'Bud John Songs', 'G'),
]

const PLANET_SHAKERS: BatchSong[] = [
  ccli('ps-still', 'Still (Planet Shakers)', 'Planet Shakers', 'Contemporary', 'Planetshakers Ministries Int\'l', 'G'),
  ccli('ps-let-everything-praise', 'Let Everything Praise', 'Planet Shakers', 'Contemporary', 'Planetshakers Ministries Int\'l', 'A'),
  ccli('ps-the-anthem', 'The Anthem (Planet Shakers)', 'Planet Shakers', 'Contemporary', 'Planetshakers Ministries Int\'l', 'E'),
  ccli('ps-faith', 'Faith (Planet Shakers)', 'Planet Shakers', 'Contemporary', 'Planetshakers Ministries Int\'l', 'G'),
  ccli('ps-nothing-is-impossible', 'Nothing Is Impossible', 'Planet Shakers', 'Contemporary', 'Planetshakers Ministries Int\'l', 'D'),
  ccli('ps-jesus-you-re-my-superstar', 'Jesus You\'re My Superstar', 'Planet Shakers', 'Contemporary', 'Planetshakers Ministries Int\'l', 'C'),
  ccli('ps-best-days', 'Best Days', 'Planet Shakers', 'Contemporary', 'Planetshakers Ministries Int\'l', 'G'),
  ccli('ps-overflow', 'Overflow', 'Planet Shakers', 'Contemporary', 'Planetshakers Ministries Int\'l', 'E'),
]

const GATEWAY_WAVE2: BatchSong[] = [
  ccli('gw-worship-forever', 'Worship Forever', 'Gateway Worship', 'Contemporary', 'Gateway Create Publishing', 'G'),
  ccli('gw-god-be-praised', 'God Be Praised', 'Gateway Worship', 'Contemporary', 'Gateway Create Publishing', 'C'),
  ccli('gw-the-name-of-jesus', 'The Name of Jesus', 'Gateway Worship', 'Contemporary', 'Gateway Create Publishing', 'D'),
  ccli('gw-beautiful', 'Beautiful (Gateway)', 'Gateway Worship', 'Contemporary', 'Gateway Create Publishing', 'G'),
  ccli('gw-awakening', 'Awakening', 'Chris Tomlin', 'Contemporary', 'Gateway Create Publishing', 'E'),
  ccli('gw-i-will-follow', 'I Will Follow', 'Chris Tomlin', 'Contemporary', 'sixsteps Music', 'G'),
]

const CORY_ASBURY_SOLO: BatchSong[] = [
  ccli('ca-the-father-s-house', "The Father's House", 'Cory Asbury', 'Contemporary', 'Bethel Music Publishing', 'G'),
  ccli('ca-endless-alleluia', 'Endless Alleluia', 'Cory Asbury', 'Contemporary', 'Bethel Music Publishing', 'A'),
  ccli('ca-dear-younger-me', 'Dear Younger Me', 'MercyMe', 'Contemporary', 'Simpleville Music', 'G'),
  ccli('ca-beautiful-one', 'Beautiful One', 'Tim Hughes', 'Contemporary', 'Thankyou Music', 'D'),
  ccli('ca-from-the-inside-out', 'From the Inside Out', 'Joel Houston', 'Contemporary', 'Hillsong Publishing', 'C'),
]

const WILLIAM_MCDOWELL: BatchSong[] = [
  ccli('wm-i-give-myself-away', 'I Give Myself Away', 'William McDowell', 'Gospel', 'Delivery Room Music', 'F'),
  ccli('wm-spirit-break-out', 'Spirit Break Out', 'William McDowell', 'Gospel', 'Delivery Room Music', 'G'),
  ccli('wm-i-belong-to-you', 'I Belong to You', 'William McDowell', 'Gospel', 'Delivery Room Music', 'E'),
  ccli('wm-holding-on', 'Holding On', 'William McDowell', 'Gospel', 'Delivery Room Music', 'D'),
  ccli('wm-fill-me-up', 'Fill Me Up', 'William McDowell', 'Gospel', 'Delivery Room Music', 'G'),
  ccli('wm-close', 'Close (William McDowell)', 'William McDowell', 'Gospel', 'Delivery Room Music', 'F'),
  ccli('wm-overcome', 'Overcome', 'William McDowell', 'Gospel', 'Delivery Room Music', 'Bb'),
  ccli('wm-praise-him-in-this-season', 'Praise Him in This Season', 'William McDowell', 'Gospel', 'Delivery Room Music', 'C'),
]

const NAIJA_CONTEMPORARY: BatchSong[] = [
  ccli('nc-great-god', 'Great God', 'Essence Worship', 'African Gospel', 'Essence Worship', 'G'),
  ccli('nc-over-all', 'Over All', 'Essence Worship', 'African Gospel', 'Essence Worship', 'D'),
  ccli('nc-no-one-greater', 'No One Greater', 'Tim Godfrey', 'African Gospel', 'Tim Godfrey Music', 'E'),
  ccli('nc-ikpo-chi-mu', 'Ikpo Chi Mu', 'Tim Godfrey', 'African Gospel', 'Tim Godfrey Music', 'G', 'ig'),
  ccli('nc-holy-ghost-fire', 'Holy Ghost Fire', 'Tim Godfrey', 'African Gospel', 'Tim Godfrey Music', 'A'),
  ccli('nc-the-lord-reigns', 'The Lord Reigns', 'Tim Godfrey', 'African Gospel', 'Tim Godfrey Music', 'C'),
  ccli('nc-worship-in-the-room', 'Worship in the Room', 'Limoblaze', 'African Gospel', 'Limoblaze Music', 'D'),
  ccli('nc-jesus-is-the-only-way', 'Jesus Is the Only Way', 'GUC', 'African Gospel', 'GUC Music', 'E'),
  ccli('nc-who-you-are', 'Who You Are', 'GUC', 'African Gospel', 'GUC Music', 'G'),
  ccli('nc-turn-it-around', 'Turn It Around', 'GUC', 'African Gospel', 'GUC Music', 'Bb'),
  ccli('nc-wonder-worker', 'Wonder Worker', 'Ada Ehi', 'African Gospel', 'Ada Ehi Music', 'C'),
  ccli('nc-unsearchable', 'Unsearchable', 'Ada Ehi', 'African Gospel', 'Ada Ehi Music', 'G'),
  ccli('nc-you-know-my-name', 'You Know My Name (Ada Ehi)', 'Ada Ehi', 'African Gospel', 'Ada Ehi Music', 'D'),
  ccli('nc-greater-things', 'Greater Things', 'Ada Ehi', 'African Gospel', 'Ada Ehi Music', 'A'),
  ccli('nc-i-believe-ada', 'I Believe (Ada Ehi)', 'Ada Ehi', 'African Gospel', 'Ada Ehi Music', 'E'),
  ccli('nc-onyeoma', 'Onyeoma', 'Ada Ehi', 'African Gospel', 'Ada Ehi Music', 'F', 'ig'),
  ccli('nc-agbajuo-onu', 'Agbajuo Onu', 'Chioma Jesus', 'African Gospel', 'Chioma Jesus Music', 'Bb', 'ig'),
  ccli('nc-eze-ndi-eze', 'Eze Ndi Eze', 'Chioma Jesus', 'African Gospel', 'Chioma Jesus Music', 'G', 'ig'),
  ccli('nc-obinasom', 'Obinasom', 'Prospa Ochimana', 'African Gospel', 'Prospa Ochimana Music', 'D', 'ig'),
  ccli('nc-ekwueme', 'Ekwueme', 'Prospa Ochimana', 'African Gospel', 'Prospa Ochimana Music', 'G', 'ig'),
  ccli('nc-jehovah-ukwu', 'Jehovah Ukwu', 'Dr Paul Enenche', 'African Gospel', 'Dunamis Intl', 'C', 'ig'),
  ccli('nc-overcomers', 'Overcomers', 'Dr Paul Enenche', 'African Gospel', 'Dunamis Intl', 'G'),
  ccli('nc-worthy', 'Worthy (Nigerian)', 'Sammie Okposo', 'African Gospel', 'Zamar Entertainment', 'D'),
  ccli('nc-happy-song', 'Happy Song', 'Sammie Okposo', 'African Gospel', 'Zamar Entertainment', 'C'),
  ccli('nc-praise-medley', 'Praise Medley', 'Sammie Okposo', 'African Gospel', 'Zamar Entertainment', 'G'),
  ccli('nc-agbajuo', 'Agbajuo', 'Chibuzor Gift Okonkwo', 'African Gospel', 'CGO Music', 'Bb', 'ig'),
  ccli('nc-great-jehovah', 'Great Jehovah', 'Paul Adefarasin', 'African Gospel', 'House on the Rock', 'E'),
  ccli('nc-sovereign', 'Sovereign', 'Paul Adefarasin', 'African Gospel', 'House on the Rock', 'G'),
  ccli('nc-you-deserve-our-praise', 'You Deserve Our Praise', 'Rhema Church Worship', 'African Gospel', 'Rhema Church', 'D'),
  ccli('nc-na-you-be-king', 'Na You Be King', 'Rhema Church Worship', 'African Gospel', 'Rhema Church', 'A', 'pcm'),
]

const WORSHIP_HYMNS_EXTENDED: BatchSong[] = [
  pd('whe-brethren-we-have-met', 'Brethren We Have Met to Worship', 'George Atkins', 'Hymn', 'F'),
  pd('whe-come-we-that-love', 'Come We That Love the Lord', 'Isaac Watts', 'Hymn', 'G'),
  pd('whe-give-me-jesus', 'Give Me Jesus', 'Traditional African American', 'Gospel', 'D'),
  pd('whe-every-time-i-feel-spirit', 'Every Time I Feel the Spirit', 'Traditional African American', 'Gospel', 'F'),
  pd('whe-swing-low', 'Swing Low Sweet Chariot', 'Traditional African American', 'Gospel', 'Bb'),
  pd('whe-his-eye-is-on-sparrow', 'His Eye Is on the Sparrow', 'Civilla D. Martin', 'Gospel', 'Bb'),
  pd('whe-i-shall-wear-a-crown', 'I Shall Wear a Crown', 'Traditional', 'Gospel', 'G'),
  pd('whe-i-love-the-lord', 'I Love the Lord', 'Traditional African American', 'Gospel', 'F'),
  pd('whe-wade-in-the-water', 'Wade in the Water', 'Traditional African American', 'Gospel', 'Dm'),
  pd('whe-we-shall-overcome', 'We Shall Overcome', 'Traditional', 'Gospel', 'G'),
  pd('whe-total-praise', 'Total Praise', 'Richard Smallwood', 'Gospel', 'Ab'),
  pd('whe-i-know-i-been-changed', 'I Know I\'ve Been Changed', 'Traditional African American', 'Gospel', 'F'),
  pd('whe-great-day', 'Great Day', 'Traditional African American', 'Gospel', 'G'),
  pd('whe-lift-every-voice-and-sing', 'Lift Every Voice and Sing', 'James Weldon Johnson', 'Gospel', 'Ab'),
  pd('whe-nobody-knows', 'Nobody Knows the Trouble I\'ve Seen', 'Traditional African American', 'Gospel', 'F'),
  pd('whe-amazing-grace-new-earth', 'Amazing Grace (My Chains Are Gone)', 'John Newton', 'Hymn', 'G'),
  pd('whe-tis-so-sweet-classic', "Tis So Sweet to Trust in Jesus", 'Louisa M. R. Stead', 'Hymn', 'G'),
  pd('whe-have-thine-own-way', 'Have Thine Own Way Lord', 'Adelaide A. Pollard', 'Hymn', 'G'),
  pd('whe-he-lives', 'He Lives', 'Alfred Henry Ackley', 'Hymn', 'F'),
  pd('whe-low-in-the-grave', 'Low in the Grave He Lay', 'Robert Lowry', 'Hymn', 'F'),
  pd('whe-up-from-the-grave', 'Up from the Grave He Arose', 'Robert Lowry', 'Hymn', 'F'),
  pd('whe-all-things-bright', 'All Things Bright and Beautiful', 'Cecil Frances Alexander', 'Hymn', 'G'),
  pd('whe-battle-hymn', 'Battle Hymn of the Republic', 'Julia Ward Howe', 'Hymn', 'G'),
  pd('whe-victory-in-jesus', 'Victory in Jesus', 'E. M. Bartlett', 'Hymn', 'G'),
  pd('whe-there-is-a-fountain', 'There Is a Fountain', 'William Cowper', 'Hymn', 'Bb'),
  pd('whe-in-the-garden', 'In the Garden', 'C. Austin Miles', 'Hymn', 'G'),
  pd('whe-close-to-thee', 'Close to Thee', 'Fanny Crosby', 'Hymn', 'F'),
  pd('whe-draw-me-nearer', 'Draw Me Nearer', 'Fanny Crosby', 'Hymn', 'F'),
  pd('whe-he-hideth-my-soul', 'He Hideth My Soul', 'Fanny Crosby', 'Hymn', 'D'),
  pd('whe-rescue-the-perishing', 'Rescue the Perishing', 'Fanny Crosby', 'Hymn', 'G'),
  pd('whe-my-redeemer', 'I Will Sing of My Redeemer', 'Philip P. Bliss', 'Hymn', 'G'),
  pd('whe-wonderful-words', 'Wonderful Words of Life', 'Philip P. Bliss', 'Hymn', 'Bb'),
  pd('whe-master-the-tempest', 'Master the Tempest Is Raging', 'Mary Ann Baker', 'Hymn', 'Ab'),
  pd('whe-more-love-to-thee', 'More Love to Thee O Christ', 'Elizabeth Prentiss', 'Hymn', 'F'),
  pd('whe-spirit-of-god', 'Spirit of God Descend Upon My Heart', 'George Croly', 'Hymn', 'F'),
  pd('whe-thee-we-adore', 'Thee We Adore', 'Traditional Latin / Thomas Aquinas', 'Hymn', 'D', 'la'),
  pd('whe-o-sacred-head', 'O Sacred Head Now Wounded', 'Bernard of Clairvaux', 'Hymn', 'Am'),
  pd('whe-my-jesus-i-love-thee', 'My Jesus I Love Thee', 'William R. Featherstone', 'Hymn', 'Bb'),
  pd('whe-lord-speak-to-me', 'Lord Speak to Me', 'Frances Ridley Havergal', 'Hymn', 'D'),
  pd('whe-shine-on-me', 'Shine on Me', 'Traditional African American', 'Gospel', 'G'),
]

// ─────────────────────────────────────────────────────────────────────────────
// LATIN / PORTUGUESE GOSPEL
// ─────────────────────────────────────────────────────────────────────────────

const LATIN_GOSPEL: BatchSong[] = [
  ccli('lg-jesus-adriana', 'Jesus (Adriana Arydes)', 'Adriana Arydes', 'Gospel', 'Som Livre', 'G', 'pt'),
  ccli('lg-não-para', 'Não Para', 'Isaías Saad', 'Gospel', 'Isaías Saad Music', 'D', 'pt'),
  ccli('lg-bendito-nome', 'Bendito Nome', 'Fernandinho', 'Gospel', 'MK Music', 'A', 'pt'),
  ccli('lg-eterno-deus', 'Eterno Deus', 'Fernandinho', 'Gospel', 'MK Music', 'G', 'pt'),
  ccli('lg-sem-ele-nada-sou', 'Sem Ele Nada Sou', 'Fernandinho', 'Gospel', 'MK Music', 'C', 'pt'),
  ccli('lg-lugar-secreto', 'Lugar Secreto', 'Gabriela Rocha', 'Gospel', 'Gabriela Rocha Music', 'E', 'pt'),
  ccli('lg-maravilhoso', 'Maravilhoso', 'Gabriela Rocha', 'Gospel', 'Gabriela Rocha Music', 'G', 'pt'),
  ccli('lg-te-louvo-cada-dia', 'Te Louvo Cada Dia', 'Ministério Zoe', 'Gospel', 'Ministério Zoe', 'D', 'pt'),
  ccli('lg-quero-ver', 'Quero Ver', 'Diante do Trono', 'Gospel', 'Diante do Trono', 'G', 'pt'),
  ccli('lg-deus-cuida', 'Deus Cuida', 'Anderson Freire', 'Gospel', 'Br3 Music', 'C', 'pt'),
  ccli('lg-tu-reinas', 'Tú Reinas', 'Hillsong Español', 'Contemporary', 'Hillsong Publishing', 'D', 'es'),
  ccli('lg-es-el-senor', 'Él Es El Señor', 'Marcos Vidal', 'Contemporary', 'GospelLuz', 'G', 'es'),
  ccli('lg-solo-en-ti', 'Solo en Ti', 'Marcela Gándara', 'Contemporary', 'Canzoniere', 'C', 'es'),
  ccli('lg-en-espiritu-y-en-verdad', 'En Espíritu y en Verdad', 'Marcos Witt', 'Contemporary', 'CanZion Productions', 'G', 'es'),
]

// ─────────────────────────────────────────────────────────────────────────────
// TRADITIONAL / STANDARD HYMNS — Extended Public Domain
// ─────────────────────────────────────────────────────────────────────────────

const CLASSIC_HYMNS_EXT: BatchSong[] = [
  pd('che-when-we-all-get-to-heaven', 'When We All Get to Heaven', 'Eliza E. Hewitt', 'Hymn', 'C'),
  pd('che-heaven-came-down', 'Heaven Came Down and Glory Filled My Soul', 'John W. Peterson', 'Hymn', 'G'),
  pd('che-blessed-be-the-name', 'Blessed Be the Name', 'Ralph E. Hudson', 'Hymn', 'G'),
  pd('che-rejoice-in-the-lord', 'Rejoice in the Lord Always', 'Traditional', 'Hymn', 'G'),
  pd('che-jesus-is-lord', 'Jesus Is Lord of All', 'LeRoy McClard', 'Hymn', 'F'),
  pd('che-wonderful-grace-of-jesus', 'Wonderful Grace of Jesus', 'Haldor Lillenas', 'Hymn', 'Bb'),
  pd('che-he-keeps-me-singing', 'He Keeps Me Singing', 'Luther B. Bridgers', 'Hymn', 'G'),
  pd('che-sunshine-in-my-soul', 'There Is Sunshine in My Soul Today', 'Eliza E. Hewitt', 'Hymn', 'G'),
  pd('che-since-jesus-came', 'Since Jesus Came Into My Heart', 'Rufus H. McDaniel', 'Hymn', 'G'),
  pd('che-living-for-jesus', 'Living for Jesus', 'Thomas O. Chisholm', 'Hymn', 'G'),
  pd('che-all-the-way-my-savior', 'All the Way My Savior Leads Me', 'Fanny Crosby', 'Hymn', 'Bb'),
  pd('che-safe-in-the-arms-of-jesus', 'Safe in the Arms of Jesus', 'Fanny Crosby', 'Hymn', 'F'),
  pd('che-savior-more-than-life', 'Savior More Than Life to Me', 'Fanny Crosby', 'Hymn', 'Eb'),
  pd('che-to-god-be-the-glory-ext', 'Praise Him Praise Him Jesus Our Blessed Redeemer', 'Fanny Crosby', 'Hymn', 'Bb'),
  pd('che-whisper-prayer', 'Sweet Hour of Prayer', 'William W. Walford', 'Hymn', 'D'),
  pd('che-he-leadeth-me', 'He Leadeth Me', 'Joseph H. Gilmore', 'Hymn', 'F'),
  pd('che-brightly-beams-our-father', "Brightly Beams Our Father's Mercy", 'Philip Paul Bliss', 'Hymn', 'D'),
  pd('che-hallelujah-praise-jehovah', 'Hallelujah Praise Jehovah', 'William J. Kirkpatrick', 'Hymn', 'F'),
  pd('che-revive-us-again', 'Revive Us Again', 'William Paton Mackay', 'Hymn', 'G'),
  pd('che-since-i-have-been-redeemed', 'Since I Have Been Redeemed', 'Edwin Othello Excell', 'Hymn', 'A'),
  pd('che-on-jordan-stormy-banks', 'On Jordan\'s Stormy Banks I Stand', 'Samuel Stennett', 'Hymn', 'Bb'),
  pd('che-am-i-soldier-of-the-cross', 'Am I a Soldier of the Cross', 'Isaac Watts', 'Hymn', 'F'),
  pd('che-stand-up-for-jesus', 'Stand Up Stand Up for Jesus', 'George Duffield Jr', 'Hymn', 'Bb'),
  pd('che-soldiers-of-christ-arise', 'Soldiers of Christ Arise', 'Charles Wesley', 'Hymn', 'Eb'),
  pd('che-o-for-a-thousand-tongues', 'O for a Thousand Tongues to Sing', 'Charles Wesley', 'Hymn', 'F'),
  pd('che-love-divine-all-loves', 'Love Divine All Loves Excelling', 'Charles Wesley', 'Hymn', 'G'),
  pd('che-and-can-it-be', 'And Can It Be', 'Charles Wesley', 'Hymn', 'D'),
  pd('che-hark-my-soul', 'Hark My Soul It Is the Lord', 'William Cowper', 'Hymn', 'F'),
  pd('che-god-moves-in-mysterious', 'God Moves in a Mysterious Way', 'William Cowper', 'Hymn', 'D'),
  pd('che-there-is-a-green-hill', 'There Is a Green Hill Far Away', 'Cecil Frances Alexander', 'Hymn', 'F'),
  pd('che-o-for-a-heart', 'O for a Heart to Praise My God', 'Charles Wesley', 'Hymn', 'C'),
  pd('che-jesus-lover-of-my-soul', 'Jesus Lover of My Soul', 'Charles Wesley', 'Hymn', 'Bb'),
  pd('che-my-hope-is-built', 'My Hope Is Built on Nothing Less', 'Edward Mote', 'Hymn', 'Bb'),
  pd('che-the-church-one-foundation', 'The Church\'s One Foundation', 'Samuel John Stone', 'Hymn', 'Eb'),
  pd('che-ten-thousand-reasons', 'I Will Wait for You', 'Traditional', 'Hymn', 'G'),
  pd('che-praise-my-soul', 'Praise My Soul the King of Heaven', 'Henry Francis Lyte', 'Hymn', 'Eb'),
  pd('che-jesus-shall-reign', 'Jesus Shall Reign Where\'er the Sun', 'Isaac Watts', 'Hymn', 'D'),
  pd('che-from-all-that-dwell', 'From All That Dwell Below the Skies', 'Isaac Watts', 'Hymn', 'G'),
  pd('che-i-sing-the-almighty-power', 'I Sing the Almighty Power of God', 'Isaac Watts', 'Hymn', 'D'),
  pd('che-alas-and-did-my-savior', 'Alas and Did My Savior Bleed', 'Isaac Watts', 'Hymn', 'F'),
]

// ─────────────────────────────────────────────────────────────────────────────
// SOUTHERN GOSPEL / SPIRITUAL
// ─────────────────────────────────────────────────────────────────────────────

const SOUTHERN_GOSPEL: BatchSong[] = [
  ap('sg-without-him', 'Without Him', 'Mylon LeFevre', 'Gospel', 'G'),
  ap('sg-ordinary-man', 'He\'s an On-Time God', 'Traditional Southern Gospel', 'Gospel', 'G'),
  ap('sg-i-bowed-on-my-knees', 'I Bowed on My Knees and Cried Holy', 'Nettie Dudley Washington', 'Gospel', 'Bb'),
  ap('sg-by-the-grace-of-god', 'By the Grace of God', 'Ivan Parker', 'Gospel', 'G'),
  ap('sg-something-beautiful-sg', 'Something Beautiful Something Good', 'Bill and Gloria Gaither', 'Gospel', 'G'),
  ap('sg-alive-again', 'Alive Again', 'Matt Maher', 'Contemporary', 'G'),
  ap('sg-overcomer', 'Overcomer', 'Mandisa', 'Contemporary', 'G'),
  ap('sg-god-with-us', 'God With Us', 'Mercyme', 'Contemporary', 'G'),
  ap('sg-good-to-be-alive', 'Good to Be Alive', 'Jason Gray', 'Contemporary', 'D'),
  ap('sg-fully-known', 'Fully Known', 'Passion', 'Contemporary', 'G'),
  ap('sg-all-the-people-said-amen', 'All the People Said Amen', 'Matt Maher', 'Contemporary', 'G'),
  ap('sg-your-grace-finds-me', 'Your Grace Finds Me', 'Matt Redman', 'Contemporary', 'D'),
  ap('sg-lead-me', 'Lead Me', 'Sanctus Real', 'Contemporary', 'G'),
  ap('sg-mountains', 'Mountains (Lyrics)', 'Sovereign Grace Music', 'Contemporary', 'G'),
  ap('sg-yet-will-i-praise-him', 'Yet Will I Praise Him', 'Tommy Walker', 'Contemporary', 'G'),
  ap('sg-freedom-is-here', 'Freedom Is Here', 'Hillsong Young & Free', 'Contemporary', 'G'),
  ap('sg-bright-as-the-sun', 'Bright as the Sun', 'Hillsong Young & Free', 'Contemporary', 'D'),
  ap('sg-real', 'Real', 'Hillsong Young & Free', 'Contemporary', 'E'),
  ap('sg-wake-up', 'Wake Up', 'Hillsong Young & Free', 'Contemporary', 'G'),
  ap('sg-i-am-free', 'I Am Free', 'Newsboys', 'Contemporary', 'G'),
  ap('sg-your-love-never-fails', 'Your Love Never Fails', 'Newsboys', 'Contemporary', 'G'),
  ap('sg-god-s-not-dead', "God's Not Dead", 'Newsboys', 'Contemporary', 'G'),
  ap('sg-born-again', 'Born Again', 'Newsboys', 'Contemporary', 'G'),
  ap('sg-we-believe', 'We Believe', 'Newsboys', 'Contemporary', 'G'),
  ap('sg-mighty-to-save-news', 'Mighty to Save (Newsboys)', 'Newsboys', 'Contemporary', 'A'),
]

// ─────────────────────────────────────────────────────────────────────────────
// WORSHIP SONGS — UK / IRELAND (CCLI)
// ─────────────────────────────────────────────────────────────────────────────

const UK_WORSHIP: BatchSong[] = [
  ccli('uk-you-are-the-anchor', 'You Are the Anchor', 'Stuart Townend', 'Contemporary', 'Thankyou Music', 'D'),
  ccli('uk-there-is-a-redeemer', 'There Is a Redeemer', 'Keith Green', 'Contemporary', 'Birdwing Music', 'G'),
  ccli('uk-make-way', 'Make Way Make Way', 'Graham Kendrick', 'Contemporary', 'Make Way Music', 'G'),
  ccli('uk-meekness-and-majesty', 'Meekness and Majesty', 'Graham Kendrick', 'Contemporary', 'Make Way Music', 'Eb'),
  ccli('uk-from-heaven-you-came', 'From Heaven You Came (Servant King)', 'Graham Kendrick', 'Contemporary', 'Make Way Music', 'D'),
  ccli('uk-we-are-marching', 'We Are Marching (Siyahamba)', 'South African Traditional', 'Contemporary', 'Traditional', 'C'),
  ccli('uk-amazing-love', 'Amazing Love', 'Graham Kendrick', 'Contemporary', 'Make Way Music', 'G'),
  ccli('uk-creation-sings', 'Creation Sings the Father\'s Song', 'Keith Getty', 'Contemporary', 'Thankyou Music', 'C'),
  ccli('uk-o-church-arise', 'O Church Arise', 'Keith Getty / Stuart Townend', 'Contemporary', 'Thankyou Music', 'A'),
  ccli('uk-when-i-see-the-blood', 'When I See the Blood', 'Stuart Townend', 'Contemporary', 'Thankyou Music', 'D'),
  ccli('uk-hear-the-call-of-kingdom', 'Hear the Call of the Kingdom', 'Keith Getty', 'Contemporary', 'Thankyou Music', 'G'),
  ccli('uk-the-power-of-the-cross', 'The Power of the Cross', 'Keith Getty / Stuart Townend', 'Contemporary', 'Thankyou Music', 'D'),
  ccli('uk-across-the-lands', 'Across the Lands', 'Keith Getty / Stuart Townend', 'Contemporary', 'Thankyou Music', 'C'),
  ccli('uk-may-the-peoples', 'May the Peoples Praise You', 'Keith Getty', 'Contemporary', 'Getty Music Publishing', 'G'),
  ccli('uk-and-can-it-be-getty', 'And Can It Be (Getty)', 'Keith Getty / Stuart Townend', 'Contemporary', 'Thankyou Music', 'D'),
  ccli('uk-yet-not-i', 'Yet Not I But Through Christ in Me', 'City Alight', 'Contemporary', 'City Alight Music', 'D'),
  ccli('uk-christ-is-mine-forevermore', 'Christ Is Mine Forevermore', 'City Alight', 'Contemporary', 'City Alight Music', 'G'),
  ccli('uk-only-a-holy-god', 'Only a Holy God', 'CityAlight', 'Contemporary', 'City Alight Music', 'C'),
  ccli('uk-strong-and-sure', 'Strong and Sure', 'City Alight', 'Contemporary', 'City Alight Music', 'E'),
]

// ─────────────────────────────────────────────────────────────────────────────
// WORSHIP SONGS — CANADA / AUSTRALIA
// ─────────────────────────────────────────────────────────────────────────────

const AUS_CAN_WORSHIP: BatchSong[] = [
  ccli('ac-seasons-of-grace', 'Seasons of Grace', 'All Nations Music', 'Contemporary', 'All Nations Music', 'G'),
  ccli('ac-your-plans', 'Your Plans', 'All Nations Music', 'Contemporary', 'All Nations Music', 'D'),
  ccli('ac-your-kingdom', 'Your Kingdom', 'Crossroads Music', 'Contemporary', 'Crossroads Music', 'G'),
  ccli('ac-we-praise-you', 'We Praise You', 'Brian Doerksen', 'Contemporary', 'Vineyard Music Canada', 'G'),
  ccli('ac-faithful-one', 'Faithful One', 'Brian Doerksen', 'Contemporary', 'Vineyard Music Canada', 'G'),
  ccli('ac-make-a-joyful-noise', 'Make a Joyful Noise', 'Robin Mark', 'Contemporary', 'River and Rain Music', 'G'),
  ccli('ac-days-of-elijah', 'Days of Elijah', 'Robin Mark', 'Contemporary', 'Daybreak Music', 'A'),
  ccli('ac-revival-anthem', 'Glorious God', 'Crossroads Music', 'Contemporary', 'Crossroads Music', 'D'),
  ccli('ac-great-is-he', 'Great Is He', 'Vertical Worship', 'Contemporary', 'Integrity Music', 'G'),
  ccli('ac-my-lighthouse', 'My Lighthouse', 'Rend Collective', 'Contemporary', 'Thankyou Music', 'E'),
  ccli('ac-build-your-kingdom', 'Build Your Kingdom Here', 'Rend Collective', 'Contemporary', 'Thankyou Music', 'G'),
  ccli('ac-you-are-my-vision', 'You Are My Vision', 'Rend Collective', 'Contemporary', 'Thankyou Music', 'D'),
  ccli('ac-counting-every-blessing', 'Counting Every Blessing', 'Rend Collective', 'Contemporary', 'Thankyou Music', 'G'),
  ccli('ac-joy-rend', 'Joy (Rend Collective)', 'Rend Collective', 'Contemporary', 'Thankyou Music', 'C'),
  ccli('ac-welcome', 'Welcome', 'Jesus Culture', 'Contemporary', 'Jesus Culture Music', 'G'),
]

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const CATALOG_BATCH_V2: BatchSong[] = [
  ...ELEVATION_WAVE2,
  ...HILLSONG_UNITED_WAVE2,
  ...MAVERICK_CITY_WAVE2,
  ...BETHEL_WAVE2,
  ...CHRIS_TOMLIN_WAVE2,
  ...PASSION_WAVE2,
  ...BRANDON_LAKE_WAVE2,
  ...GOSPEL_WAVE2,
  ...TASHA_WAVE2,
  ...TRAVIS_GREENE_WAVE2,
  ...MARVIN_SAPP_WAVE2,
  ...FRED_HAMMOND_WAVE2,
  ...CECE_WINANS_WAVE2,
  ...SINACH_WAVE2,
  ...NATHANIEL_BASSEY_WAVE2,
  ...MERCY_CHINWO_WAVE2,
  ...DUNSIN_WAVE2,
  ...FRANK_EDWARDS_WAVE2,
  ...TOPE_ALABI_WAVE2,
  ...GHANAIAN_GOSPEL,
  ...EAST_AFRICA_GOSPEL,
  ...FRENCH_GOSPEL,
  ...PUBLIC_DOMAIN_HYMNS,
  ...AUDIT_PENDING_HYMNS,
  ...ADDITIONAL_WAVE2,
  ...LATIN_GOSPEL,
  ...CASTING_CROWNS_WAVE2,
  ...MERCYME_WAVE2,
  ...LAUREN_DAIGLE_WAVE2,
  ...MATT_REDMAN_WAVE2,
  ...KARI_JOBE_WAVE2,
  ...VERTICAL_WORSHIP,
  ...TAUREN_WELLS,
  ...CHRIS_STAPLETON_GOSPEL,
  ...ADDITIONAL_GOSPEL_ARTISTS,
  ...PLANET_SHAKERS,
  ...GATEWAY_WAVE2,
  ...CORY_ASBURY_SOLO,
  ...WILLIAM_MCDOWELL,
  ...NAIJA_CONTEMPORARY,
  ...WORSHIP_HYMNS_EXTENDED,
  ...CLASSIC_HYMNS_EXT,
  ...SOUTHERN_GOSPEL,
  ...UK_WORSHIP,
  ...AUS_CAN_WORSHIP,
]
