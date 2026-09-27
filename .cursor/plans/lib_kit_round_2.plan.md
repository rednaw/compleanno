---
name: $lib kit round 2
overview: Extract WordleBoard, CodeOrderList, AudioMixGuess, HubDevBar, OrientationGate, PhasedPuzzle, ClipTitleQuiz into `$lib` and wire trails that already have copies.
todos:
  - id: extract
    content: Extract items 2–8 and wire copies
    status: completed
isProject: false
---

# $lib kit round 2

## Decided

| | |
|--|--|
| Scope | Items 2–8 from next-ten list (skip 1 json-storage, 9 hub-rewards, 10 HubShell) |
| Migrate | Wire every trail that already has a copy |
| Content stays trail-local | answers, media, keys, hub labels |

## Decide

None.

## Do

### 0. Extract 2–8 + wire

- [x] Agent: implemented
- [ ] Human: reviewed

**Agent will implement** — `$lib` modules + wire copies; eslint + build; kit table in `gift-trails.mdc`.

**Human must:** spot-check one wired trail (wordle / code order / audio mix / lrnz25 rotate).
