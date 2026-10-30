# Rune Match playability milestone — October 29, 2026

P03 retains the 26-pair game, progressive key reveals, and all established mappings. No new puzzle gate or stage was added.

Implemented: deterministic card IDs; synchronous turn state; optional failure-safe audio/mute; versioned local saving; input validation and damaged-save recovery; cross-tab coordination; persistent cipher access; confirmed reset; alphabetized key; keyboard controls and live feedback; native modal focus behavior; reduced-motion support; narrow-screen navigation; embedded licensed rune font.

Verification: 19 Node regression tests; local browser completion of all 26 pairs; save/reload and completion reopening; Enter/Space controls; Escape/focus restoration; 320px viewport without horizontal overflow; clean browser error log. Automated browser-logic tests use a DOM/storage harness; real-browser checks are separately identified in README.md.

Remaining external checks: physical iPhone/iPad Safari; independent fresh-player difficulty/pacing; comparison to fabrication artwork. The original memory-game difficulty and partial-decoding behavior are intentionally retained.

Project continuity: this note records the P03 software milestone. The master blueprint and synced sources were not edited. Its software implementation/status paragraph should be updated after the deployment status is verified.

## Approved outlined artwork correction

Replaced visible font glyphs with the exact 26 paths from the supplied Rune_Match_Alphabet_Key.svg. The original reference is preserved in reference/. Only SVG viewBoxes and color are adapted for display; path coordinates and assignments remain unchanged. All 20 regression tests pass, including exact path comparison and all three rendering locations. No save format, board order, or matching rule changed.

## Board-first interface

Implemented the requested compact title/toolbar, screen-filling board, first-visit skippable tutorial, modal cipher, and completion-only approved SVG download. Removed visible moves/matches, restart, standing directions, and inline key. Existing save data and exact rune paths are preserved. Tutorial dismissal is saved separately from game progress. All 24 regression tests pass; real-browser tutorial, download, reload, and four screen-size checks passed.
