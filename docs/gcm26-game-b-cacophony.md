# GCM 26 — Game B: simultaneous songs (“cacophony”) — design notes

Status: **design only** — not implemented yet.

## Concept

The player hears **multiple songs at once** (target: at least **5**, possibly **8–12**, up to **10–20** in harder modes). For each song they must **guess the title** (and/or artist, TBD). **When a song is guessed correctly, that layer is removed** from the mix (muted / stopped) so the remaining mashup becomes easier to parse.

## Audio implementation (browser)

- **Baseline:** one **`<audio>` element per track**, all started together after a **user gesture** (e.g. “Play mix”) to satisfy mobile autoplay rules.
- **Removing a correct guess:** **pause** that element or set **`volume = 0`** / **mute** so it disappears from the cacophony without desyncing the others.
- **Optional later:** **Web Audio API** with a **GainNode per source** for crossfades or a master bus; more control, more complexity.
- **Sync:** start every clip at **t = 0** when the round begins; keep other tracks playing when one drops out.
- **Short looped clips** (e.g. **10–20 s**): smaller files, stable “same moment” comparisons, easier hosting than full songs.

## Difficulty and track count

- **5–8 layers** is often already **very hard** unless clips are clearly distinct (register, tempo, density, hook).
- **10+** leans on strong recognition and tolerance for a “muddy” mix; consider **tiers** (e.g. easy 5 / medium 8 / hard 12) or unlocking harder counts.
- **Curate the mix:** vary bass vs high, sparse vs busy sections, so layers are somewhat separable by ear.

## Guessing UX

- **Free text + fuzzy matching** (similar to game A’s film titles) if each track has a **canonical answer** in data.
- Decide whether acceptance is **title only**, **artist only**, or **either**.
- **One global input** vs **one field per remaining song** — per-slot UI makes “what’s left” obvious.

## Source: downloaded MP3s (not runtime YouTube)

- **Pipeline:** pick tracks on YouTube → download / trim locally (e.g. **yt-dlp** + **ffmpeg**, same family as `scripts/gcm26/extract.py` for game A) → commit **short loops** as **`.mp3`** (or `.m4a`) under **`static/gcm26/…`**.
- **Birthday app, private use:** runtime plays **only local files**; predictable at the venue, no iframe stack or sync drift.
- Prefer **short loops** for **repo size** and **mobile** load time.

## Prior art in this repo: `lrnz25/music`

The **lrnz25 music** puzzle (`src/routes/lrnz25/music/+page.svelte` + `src/routes/lrnz25/songs.js`) already:

- Serves files from **`static/lrnz25/`** via paths like `` `${base}/lrnz25/song${number}_${level}.mp3` ``.
- Uses **one `<audio>` per song**, `bind:this` for playback control.
- Stores per-item state in **localStorage** and a hub completion flag.

**Game B differs:** tracks play **at the same time** (not one-at-a-time fragments); wrong guesses don’t switch files — each track is ideally **one loop file**; solved tracks are **muted/removed** from the mix while the rest keep playing in sync.

## UX / flow (decisions to make)

- **Round start:** explicit control so autoplay and expectations are clear.
- **Replay:** restart mix from the beginning vs resume — **restart** is simpler and usually fairer.
- **Progress:** persist solved layers (e.g. **localStorage**), aligned with **gcm26 hub** and **clear progress** (new keys alongside game A).
- **Accessibility:** not purely audio-only — e.g. count of **remaining** tracks or placeholders.

## Integration sketch (gcm26)

- **Route:** e.g. `gcm26/b` (replace placeholder if present).
- **Data:** small **manifest** (file paths under `static/gcm26/…`, display titles, optional loop metadata).
- **Hub:** wire tile completion and **clear progress** keys like game A.

## Open questions before implementation

1. **How many songs in v1?** (recommend starting with **5** or **6**.)
2. **Loop length** per clip (and whether one shared script generates `static/gcm26/b/*.mp3` from a manifest).
3. **Answer rules:** title vs artist vs both; language of UI copy (IT/EN).
4. **File naming:** mirror lrnz25 (`song1_loop.mp3`) vs slug from manifest (`track-id.mp3`, like game A film clips).

---

_Draft from a planning discussion; adjust as you lock the spec._
