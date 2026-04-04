# GCM 26 — Game B: simultaneous songs (“cacophony”) — design notes

Status: **design** — V1 parameters locked below; not fully implemented yet.

## Concept

The player hears **multiple songs at once**. **V1:** exactly **6** songs in one mix; other sizes/levels can come later. They must guess **song title only** (no artist in v1). **When a title is guessed correctly, that layer is removed** from the mix (muted / stopped) so the remaining mashup becomes easier to parse.

## Audio implementation (browser)

- **Baseline:** one **`<audio>` element per track**, **`loop`** enabled. **No audio until** the player taps **Start** (label **“Start”**); that tap is the **user gesture** so all tracks can play together (mobile autoplay).
- **Removing a correct guess:** **pause** that element or set **`volume = 0`** / **mute** so it disappears from the cacophony without desyncing the others.
- **Optional later:** **Web Audio API** with a **GainNode per source** for crossfades or a master bus; more control, more complexity.
- **Sync:** start every clip at **t = 0** when the round begins; keep other tracks playing when one drops out.
- **V1 loop length:** **20 seconds** per track, **no fade in/out** (hard cuts in source processing are fine; playback is a straight loop).
- **Loudness:** **normalize** exports so one track does not dominate the mashup (e.g. **ffmpeg `loudnorm`** per clip, or a shared target **integrated LUFS** / **peak**; decide in extract script). Short loops, predictable hosting size.

## Difficulty and track count

- **V1:** **6** layers — still hard; **curate** for variety (register, tempo, density, hook).
- **Later:** other levels (e.g. 8–12 tracks) or separate mixes — out of scope until v1 ships.

## Guessing UX (V1)

- **UI language:** **English** (labels, buttons, placeholders for now).
- After **Start**, the UI shows **one text field** (e.g. placeholder **Song title**) and **Submit**.
- **Matching: exact** — no fuzzy / typo tolerance (unlike game A). **Implementation note:** compare **canonical title** from the manifest to the player input after **trim** and **case-insensitive** equality (same approach as **lrnz25/music**: normalized strings, but **no** edit distance). No extra aliases in v1 unless the manifest spells the single accepted title.
- **Submit:** compare against **unsolved** tracks only. If **exactly one** remaining song matches, **mute** that layer and **clear** the field. If **none** match, **wrong** feedback (TBD: inline message / shake) and **clear** the input. Collisions (two songs same title) should be avoided in curation.
- Optional later: Italian copy, fuzzy matching, per-slot fields.

## Source: downloaded MP3s (not runtime YouTube)

- **Static layout:** game **A** (films) → **`static/gcm26/a/`** (e.g. `.mp4`); game **B** (cacophony) → **`static/gcm26/b/`** (`.mp3`).
- **Pipeline:** pick tracks on YouTube → download / trim locally (e.g. **yt-dlp** + **ffmpeg**, same family as `scripts/gcm26/extract.py` for game A) → game A clips land in **`static/gcm26/a/`**; game B loops in **`static/gcm26/b/`**.
- **Birthday app, private use:** runtime plays **only local files**; predictable at the venue, no iframe stack or sync drift.
- Prefer **short loops** for **repo size** and **mobile** load time.

## Prior art in this repo: `lrnz25/music`

The **lrnz25 music** puzzle (`src/routes/lrnz25/music/+page.svelte` + `src/routes/lrnz25/songs.js`) already:

- Serves files from **`static/lrnz25/`** via paths like `` `${base}/lrnz25/song${number}_${level}.mp3` ``.
- Uses **one `<audio>` per song**, `bind:this` for playback control.
- Stores per-item state in **localStorage** and a hub completion flag.

**Game B differs:** tracks play **at the same time** (not one-at-a-time fragments); wrong guesses don’t switch files — each track is ideally **one loop file**; solved tracks are **muted/removed** from the mix while the rest keep playing in sync.

## UX / flow

- **Round start (locked):** initial screen shows only **Start**; press it → **all** active tracks play **in sync** and **loop** (**20 s** files loop seamlessly if edited that way).
- **Replay:** **Restart** all audible tracks from **t = 0** (e.g. secondary control after game started — detail TBD).
- **Progress:** persist solved layers (e.g. **localStorage**), aligned with **gcm26 hub** and **clear progress** (new keys alongside game A).
- **Accessibility:** e.g. **remaining count** / solved count so the screen is not audio-only.

## Integration sketch (gcm26)

- **Route:** e.g. `gcm26/b` (replace placeholder if present).
- **Data:** **manifest** for **6** tracks (slug, **title** = exact answer for guessing, YouTube trim window for tooling); audio files **`static/gcm26/b/<slug>.mp3`**, **20 s** loops, **normalized**.
- **Hub:** wire tile completion and **clear progress** keys like game A.

## V1 decisions (locked)

| Topic | Choice |
|--------|--------|
| Track count | **6** songs, one mashup |
| Loop length | **20 s** |
| Fades | **None** (no fade in/out on loops) |
| Loudness | **Normalize** all clips so no single song dominates |
| First screen | **Start** button — no music until pressed |
| After Start | All **6** tracks play together, **looping** |
| Guess UI | **One** text field + **Submit** |
| Guess target | **Song title only** |
| UI language | **English** (v1) |
| Matching | **Exact** — trim + **case-insensitive** compare to manifest title; **no** fuzzy typos |

## Open questions before implementation

1. **File naming / manifest:** slug per track under `static/gcm26/b/` + **`manifest.json`** colocated with `gcm26/b` route.
2. **Extract script:** extend `scripts/gcm26/` pipeline — yt-dlp → trim **20 s** → **loudnorm** (or equivalent) → `static/gcm26/b/<slug>.mp3`.
3. **Wrong guess UX:** e.g. clear field + short message; **Enter** key submits (likely yes).

---

_Draft from a planning discussion; adjust as you lock the spec._
