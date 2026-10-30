# Rune Match

A 26-pair memory game that reveals the adventure's established rune-to-letter cipher. The mapping and progressive unlock rules are preserved.

## Playability update

- Turn processing is independent of audio. Rapid taps, missing audio support, rejected audio promises, and suspended audio cannot block or overlap turns.
- Each card has a stable, unique ID. Saved order is retained; responsive layout adapts the number of columns to the screen.
- Board order, moves, matched letters, completion, and sound preference save automatically in the same browser/origin. A reload closes unresolved exposed cards but retains the counted move and any earned match.
- Storage errors allow continued play with a visible warning. Invalid saves are backed up to `rune-match:save:v1:recovery` when possible, then replaced with a fresh valid game.
- Cross-tab changes are adopted instead of silently overwritten. Web Locks serialize changes where available; older browsers use synchronous read-before-write checks and storage events. Use one tab on browsers without Web Locks for strict conflict avoidance.
- View cipher opens a modal containing only earned letters, alphabetized. Completion retains the entire reference and unlocks Download cipher, which downloads the approved, outlined A–Z SVG.
- Cards are keyboard buttons with state labels. A native modal dialog handles focus containment, Escape, and focus restoration. Feedback does not require sound. Reduced-motion preferences disable flip transitions.
- The board uses the available screen below a compact Rune Match toolbar. Moves, matches, restart, inline key, and standing instructions have been removed. Responsive sizing keeps targets at least 44 CSS pixels, allowing scrolling only when necessary.
- A three-step first-visit tutorial supports Next, Back, Skip tutorial, and Escape. Dismissal is remembered in this browser; How to play inside View cipher reopens it.
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

Tests cover state validation, all 26 matches, rapid input, audio failures, reload during turns, completion reopening, damaged/blocked storage, mute, tutorial navigation/dismissal, completion-only download controls, responsive layout, tab conflicts, accessible labels, and exact approved SVG path coverage. Browser glue uses a DOM/storage harness; this is separate from real-browser checks.

Earlier real-browser reliability checks completed on the local build: Enter/Space matching; earned match retained after reload; all 26 pairs and automatic completion; completed key reopened after reload; Escape focus return; no horizontal overflow at a 320px viewport; no console errors during the playthrough. These are not physical iPhone/iPad or physical engraving tests.

The supplied outlined alphabet key is the visual authority. Future artwork changes must preserve these paths and letter assignments. Unicode runes remain only in accessible descriptions and announcements.

## Board-first interface verification

24 automated regression tests pass. Real-browser checks covered tutorial Next/Back/Skip/Start playing, remembered dismissal after reload, replay/Escape, keyboard matching, saved partial key access, and completed-game download. The downloaded SVG was byte-for-byte identical to the approved reference. Board fit checked at 1280×720, 768×1024, 390×844, and 320×568; all 52 cards fit without page overflow at these sizes. No browser errors or warnings were reported. Physical device testing remains separate.

## Ancient tablet appearance

Stone-textured tiles with decorative bronze seals and rims, ivory outlined runes, subdued amber match illumination, and a non-interactive bronze perimeter. Phone framing is narrower to retain board space. Exposed-rune surfaces are darkened for clarity. Exact rune paths, saved game format, tutorial question mark, and approved downloadable SVG are preserved. Small screens may scroll to maintain 44px card targets. Asset provenance and the generation prompt are in assets/TABLET-THEME.md.

## Approved Photoshop composition

The current interface uses the user-designed stone frame with the original centered title, View cipher on the left, sound on the right, and five decorative faceted jewels. Purple/yellow remain above, red/blue/green below; no gameplay behavior is assigned to them. The supplied custom-tile.png is preserved byte for byte and rendered at its original 3:4 aspect ratio. All 26 rune paths remain exact approved outlines. Download cipher is available inside View cipher after completion. Short screens may scroll to preserve 44px targets.

26 regression tests pass, including PNG hash/dimension verification and portrait-layout coverage. See PHOTOSHOP-REVISION.md for asset provenance and cleanup details.
