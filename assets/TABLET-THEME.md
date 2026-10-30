# Ancient tablet theme assets

Implemented with CSS and decorative SVGs. Rune-art.js and the approved outlined alphabet reference are unchanged. SVG seals, corner fittings, and crests are decorative only and have no cipher assignments. Runes retain their original geometry and have no distortion, filters, or weathering applied.

- tablet-stone.jpg: optimized 768px stone texture, approximately 205KB, shared by all tiles; generated with the built-in image_gen tool.
- tablet-stone.png: full-resolution generated master retained locally, not deployed.
- tablet-seal.svg: shared face-down tile seal.
- tablet-corner.svg and tablet-crest.svg: non-interactive perimeter ornaments.
- ../tablet.css: theme, restrained amber match illumination, and reduced-motion support.

Image-generation prompt:

Create a single seamless tileable dark stone material texture for the surface of an ancient fantasy rune tablet web game. Square flat orthographic closeup texture only, edge-to-edge stone, no perspective, no objects, no frame, no symbols, no writing, no runes, no ornaments, no glowing lines. Warm charcoal basalt or slate with extremely subtle brown mineral speckles, finely grained weathered surface, shallow wear and a few delicate hairline fissures, not a wall of blocks. Predominantly dark warm gray with restrained low contrast, suitable as a quiet background beneath large pale ivory symbols. Soft even ambient lighting without directional cast shadows, highlights or vignette. Photorealistic tactile stone. No blue tones, no metallic veins, no distracting white cracks.

The texture is darkened behind exposed runes. Perimeter decoration has pointer-events:none. On very small viewports the board can scroll to preserve 44px touch targets; the layout chooses the greatest feasible number of columns in this case.
