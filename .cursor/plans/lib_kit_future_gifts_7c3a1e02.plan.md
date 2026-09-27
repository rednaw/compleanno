---
name: $lib kit for future gifts
overview: Graduate the ten practice pieces future gifts will need into `$lib`, so the next trail copies less and does not sibling-import. Wire every trail that already has a copy in this pass.
todos:
  - id: confirm-list
    content: Confirm the ranked top 10
    status: completed
  - id: migrate-scope
    content: Pick migrate scope (Decide 1)
    status: completed
  - id: extract
    content: Extract each approved item into $lib and wire all trails with copies
    status: completed
isProject: false
---

# $lib kit for future gifts

Private gift content stays in the trail. These ten are **practice** — every next hub trail is likely to need them. Extract to `$lib`; do not import from another gift.

## Decided

| | |
|--|--|
| Goal | Next gift starts thinner; no new sibling imports |
| Migrate scope | Wire **every** trail that already has a copy in this pass |
| Content stays trail-local | prizes, storage key strings, manifests, media, group/painter/song answers, hub tile labels |
| Already in `$lib` | `puzzle-utils`, `words-it`, BackButton, ClearProgressButton, RotateMessage |
| Ranking | HubShell dropped (too trail-styled). Painting grid promoted into the ten |
| Top 10 (extract order) | 1 normalize · 2 ResultOverlay · 3 PhotoGuessGrid · 4 storage-keys helper · 5 CodeKeypad · 6 Wordle Game · 7 Connections + seeded shuffle · 8 quiz-form / GuessRow · 9 AudioMix · 10 entropy helpers (`seededRandom` + no `Math.random` at init) |
| Deferred | Hub shell, DEV_MODE bar, per-trail hub images |
| lrnz25 code | Left local (trail-specific finale transition); keypad practice lives in `$lib` CodeKeypad for new gifts |

## Decide

None.

## Do

### 0. Extract kit + wire all copies

- [x] Agent: implemented
- [ ] Human: reviewed

**Agent will implement** — extract #1→#10 into `$lib`; point every trail that already has a copy at `$lib`; delete unused trail copies; kill lrnz26→gcm26 sibling import; short kit table in `gift-trails.mdc` if useful; eslint + build.

**Human must:** play through one migrated trail (grt26 or equivalent) after the wire-up.
