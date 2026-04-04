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
- **Loudness:** **normalize** exports so one track does not dominate the mashup (e.g. **ffmpeg `loudnorm`** per clip in **game B’s** extract script). Short loops, predictable hosting size.

## Difficulty and track count

- **V1:** **6** layers — still hard; **curate** for variety (register, tempo, density, hook).
- **Later:** other levels (e.g. 8–12 tracks) or separate mixes — out of scope until v1 ships.

## Guessing UX (V1)

- **UI language:** **English** (labels, buttons, placeholders for now).
- After **Start**, the UI shows **one text field** (e.g. placeholder **Song title**) and **Submit**.
- **Matching: exact** — no fuzzy / typo tolerance (unlike game A). **Implementation note:** compare **canonical title** from the manifest to the player input after **trim** and **case-insensitive** equality (same approach as **lrnz25/music**: normalized strings, but **no** edit distance). No extra aliases in v1 unless the manifest spells the single accepted title.
- **Submit:** compare against **unsolved** tracks only. If **exactly one** remaining song matches, **mute** that layer and **clear** the field. If **none** match, use the **same wrong-guess UX as game A** (see below). Collisions (two songs same title) should be avoided in curation.
- **Wrong guess (locked — mirror game A):** set **`status` / `feedback` to `'wrong'`** on the guess row, **clear** the text field, and style the control row with the **same `.clip-row.wrong` rules** as `src/routes/gcm26/a/+page.svelte` (red-tint background, red border, dark red text). No separate toast or shake — the row *is* the feedback. Row stays in **`wrong`** until the next **correct** submit (same as A). **Enter** in the field submits the same as the **Submit** button (same as A’s per-film inputs).
- Optional later: Italian copy, fuzzy matching, per-slot fields.

## Source: downloaded MP3s (not runtime YouTube)

- **Static layout:** game **A** (films) → **`static/gcm26/a/`** (e.g. `.mp4`); game **B** (cacophony) → **`static/gcm26/b/`** (`.mp3`).
- **Pipeline:** YouTube → **yt-dlp** + **ffmpeg** locally. **Game A:** **`scripts/gcm26/extract_a.py`** → **`static/gcm26/a/`** (`.mp4`). **Game B:** **`scripts/gcm26/extract_b.py`** → **`static/gcm26/b/`** (`.mp3`).
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
- **Progress:** persist solved layers (e.g. **localStorage**). **Hub “clear progress”** removes every key with prefix **`gcm26_`** so games stay **uncoupled** in code — each game only defines its own keys under that prefix (no hub imports of `./a/films.js` or other game modules).
- **Accessibility:** e.g. **remaining count** / solved count so the screen is not audio-only.

## Integration sketch (gcm26)

- **Route:** e.g. `gcm26/b` (replace placeholder if present).
- **Data:** see **Manifest (V1 default)** below; audio **`static/gcm26/b/<id>.mp3`** per track.
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
| Wrong guess UX | **Same as game A** — `.clip-row.wrong`, clear input, `status: 'wrong'` until next correct guess; **Enter** submits |
| Manifest location | **`src/routes/gcm26/b/manifest.json`** (colocated with route, same idea as game A) |
| Audio files | **`static/gcm26/b/<id>.mp3`** — **`id`** is **kebab-case** slug, one rule, no separate `file` field |
| Extract tooling | **`scripts/gcm26/extract_a.py`** (game A), **`scripts/gcm26/extract_b.py`** (game B) |

## Manifest (V1 default)

- Path: **`src/routes/gcm26/b/manifest.json`**.
- Shape: JSON object with a **`tracks`** array of exactly **6** objects for v1.
- Each track (for app + extract tooling):

| Field | Role |
|--------|------|
| **`id`** | Slug; basename of **`static/gcm26/b/<id>.mp3`** |
| **`title`** | Canonical **song title** (exact-guess answer after trim + case fold) |
| **`url`** | YouTube URL (extract script only) |
| **`start`** | Segment start (e.g. `M:SS` — extract script only) |
| **`end`** | Segment end (`start` + **20 s** wall-clock window, or explicit end time — script decides) |

Example (placeholders):

```json
{
	"tracks": [
		{
			"id": "example-slug",
			"title": "Exact Title As Players Must Type",
			"url": "https://www.youtube.com/watch?v=…",
			"start": "0:45",
			"end": "1:05"
		}
	]
}
```

v1 requires **6** objects in **`tracks`**.

## Tooling (game B)

- **Script:** **`scripts/gcm26/extract_b.py`** — reads **`src/routes/gcm26/b/manifest.json`**, for each track: download source, cut **[start, end)** (or **20 s** from `start`), **loudnorm** (or equivalent), write **`static/gcm26/b/<id>.mp3`**.
- Defaults can mirror A’s CLI polish (`--manifest`, `--out-dir`, `--cache-dir`) without sharing one big codepath.

---

_Draft from a planning discussion; adjust as you lock the spec._
