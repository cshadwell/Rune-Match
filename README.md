# Rune Match

A 26-pair memory game that reveals the adventure's established rune-to-letter cipher. The mapping and progressive unlock rules are preserved.

## Playability update

- Turn processing is independent of audio. Rapid taps, missing audio support, rejected audio promises, and suspended audio cannot block or overlap turns.
- Each physical card has a stable, unique ID. Cards stay in the same locations until an explicitly confirmed new game.
- Board order, moves, matched letters, completion, and sound preference save automatically in the same browser/origin. A reload closes unresolved exposed cards but retains the counted move and any earned match.
- Storage errors allow continued play with a visible warning. Invalid saves are backed up to `rune-match:save:v1:recovery` when possible, then replaced with a fresh valid game.
- Cross-tab changes are adopted instead of silently overwritten. Web Locks serialize changes where available; older browsers use synchronous read-before-write checks and storage events. Use one tab on browsers without Web Locks for strict conflict avoidance.
- View cipher is always available and shows only earned letters, alphabetized. Completion unlocks the entire persistent reference.
- Cards are keyboard buttons with state labels. A native modal dialog handles focus containment, Escape, and focus restoration. Feedback does not require sound. Reduced-motion preferences disable flip transitions.
- Sticky navigation links make the board and inline key reachable on narrow phones.
- All visible runes use the exact outlined paths supplied in `reference/Rune_Match_Alphabet_Key.svg`. Cards, inline key, and cipher dialog share `rune-art.js`. No rune fonts are loaded or used. Path coordinates are preserved unchanged; square viewBoxes center them without rotation or distortion.

Browser storage is not an account or cross-device sync. Clearing website data or using another browser/device will not carry progress over. A previously open version of the original game had no save to migrate.

## Run and test

Serve this directory over HTTP, for example:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Open http://127.0.0.1:8766/. Automated tests require Node.js and no installed packages:

```sh
node --test tests/playability.test.cjs
```

Tests cover state validation, all 26 matches, rapid input, audio failures, reload during turns, completion reopening, damaged/blocked storage, mute/reset, tab conflicts, accessible labels, and exact approved SVG path coverage. Browser glue uses a DOM/storage harness; this is separate from real-browser checks.

Real-browser checks completed on the local build: Enter/Space matching; earned match retained after reload; all 26 pairs and automatic completion; completed key reopened after reload; Escape focus return; no horizontal overflow at a 320px viewport; no console errors during the playthrough. These are not physical iPhone/iPad or physical engraving tests.

The supplied outlined alphabet key is the visual authority. Future artwork changes must preserve these paths and letter assignments. Unicode runes remain only in accessible descriptions and announcements.
