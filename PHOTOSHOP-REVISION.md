# Photoshop composition — approved publication

Supersedes the earlier local inlay-v2 preview. The user explicitly approved publishing this version, including the supplied background and exact tile artwork, to the public cshadwell/Rune-Match repository. Artwork uploads have been verified against local Git blob hashes. Deployment verification is recorded separately in DEPLOYMENT.md.

## Art and composition

- Original user Background.png retained unchanged in reference/photoshop/Background.png; Desktop originals untouched.
- Five decorative pentagonal jewels remain in the same relative positions and colors: purple upper-left, yellow upper-right; red lower-left, blue lower-center, green lower-right. The blue remains larger and the red smaller. New vector facets and tarnished-gold bezels integrate them with the stone frame.
- No clue, interaction, order, state, or puzzle stage is assigned to the jewels.
- Original Photoshop title is sampled from the original image. Real View cipher and sound controls occupy the rearranged left/right positions.
- Background cleanup used the built-in image_gen tool in two passes to remove flat marker/text/plaque layers so they can be rendered crisply and responsively. The generated master is assets/custom-background-clean-master.png. The app uses assets/custom-background-clean.jpg.
- The user-supplied tile is assets/custom-tile.png: a byte-for-byte copy of ChatGPT Image Oct 29, 2026, 10_54_12 PM.png. Its SHA-256, dimensions (1086×1448), and source basename are recorded in assets/custom-tile-manifest.json.
- The 3:4 tile aspect ratio is preserved. The face-down seal is a separate overlay; exposed rune shapes remain the exact approved SVG paths. Neither the PNG nor the rune geometry is redrawn or distorted.
- The completed cipher download remains available inside View cipher.

## Local review artifacts (not all are hosted)

- Photoshop-Background-Cleaned-With-Jewels.jpg: full 2048×1687 background export, including the faceted jewels and title/labels.
- photoshop-game-desktop.jpg: working desktop game preview.
- photoshop-game-phone.jpg: working phone preview.
- photoshop-background-preview.html: reproducible background-only export scene.
- assets/gem-purple.svg, gem-yellow.svg, gem-red.svg, gem-blue.svg, gem-green.svg: decorative jewel assets.

## Verification

26 regression tests pass. The new checks cover the exact supplied tile hash/dimensions and portrait layout with minimum 44px touch targets. Rendered local game: 52 rune paths compared to the supplied approved SVG, zero mismatches. Phone 390×844 fits all cards; shorter phones may scroll to preserve target size. Cipher modal/Escape and clean browser error/warning log checked. Existing saved progress was retained.

## Image prompts (built-in image_gen)

Pass 1, input user Background.png:
Precise production cleanup of this user-designed stone and gold game background. Preserve the entire rectangular frame composition, the large perfectly empty near-black playing area, all cracks, tarnished gold inlay, bevels, stone surfaces, corner ornaments, and the two top button plaques. Make ONLY these surgical removals: remove the five flat colored pentagon markers (purple upper-left, yellow upper-right, red lower-left, blue lower-center, green lower-right), filling their tiny footprints with the matching dark stone/metal setting underneath; remove the words 'View cipher' and 'Sound on' and the speaker icon from the two top plaques but preserve each plaque intact; remove the central 'RUNE MATCH' lettering, filling just its footprint with matching stone. These removed elements will be re-added as separate crisp, responsive UI layers with faceted gems in exactly the same colors and positions. Do NOT add any jewels, letters, symbols, cards, runes, objects, glow, or designs. Do NOT redesign, change palette, crop, shift the frame or alter the empty playing area. Output the same portrait-ish 2048:1687 aspect ratio, full background edge-to-edge.

Pass 2, input pass-1 result:
Make one surgical edit to this game background: remove the TWO small empty rectangular button plaques near the upper-left and upper-right of the top stone bar, filling only their footprints with matching continuous aged dark stone. They will be replaced with real interactive controls. Preserve every other detail exactly: the black empty playing area, full outer frame and gold inlay, upper ornament mounts, lower ornament mounts, cracks, palette, aspect ratio, and image bounds. No text, no symbols, no jewels, no new decoration. Do not redraw or move any frame geometry.

The five faceted jewels are SVG assets created in code; the original title, real labels, and jewels are layered over the cleaned background. Image-generation outputs are visually checked approximations of the background; exact preservation claims apply to the supplied tile PNG and approved rune paths, not every background pixel.
