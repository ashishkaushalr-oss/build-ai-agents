# "A Mark" — App Icon Spec
App: Build Your Own AI Agents (iOS)

## Concept
A bold letter A drawn as a single peak; the crossbar is replaced by one white dot (the "agent"). One glyph, two shapes, legible at 29 px.

## Geometry (1024 × 1024 master, square — do NOT round corners; iOS masks it)
| Element | Value |
|---|---|
| Canvas | 1024 × 1024, background `#09090B` |
| Peak path | `M 262 781 L 512 243 L 762 781` |
| Stroke | 115 px, `stroke-linecap: round`, `stroke-linejoin: round`, no fill |
| Stroke color | linear gradient 45° (top-left → bottom-right): `#FF6B4A` → `#7C3AED` |
| Dot | circle center (512, 640), radius 58, fill `#FFFFFF` |
| Safe area | glyph bounding box ≈ 204–820 x / 185–839 y; stays inside the 18% margin iOS recommends |

All values scale linearly: at 320 px the path is `M 82 244 L 160 76 L 238 244`, stroke 36, dot (160,200) r 18.

## Files
- `AppIcon-1024.svg` — light/default appearance (opaque dark ground)
- `AppIcon-dark-1024.svg` — iOS 18 Dark appearance (transparent ground)
- `AppIcon-tinted-1024.svg` — iOS 18 Tinted appearance (white glyph on transparent; system tints it)

## Build instructions (for Claude Code)
1. Rasterize each SVG to a 1024 × 1024 PNG, no alpha on the default icon:
   `rsvg-convert -w 1024 -h 1024 AppIcon-1024.svg -o AppIcon-1024.png` (or `cairosvg`, `sharp`, or Figma export).
2. In Xcode: Assets.xcassets → AppIcon, Appearances = "Any, Dark, Tinted", Size = "Single Size (1024pt)". Drop the three PNGs into the three wells.
3. Xcode generates every required size. No manual 20/29/40/60/76/83.5 variants needed on iOS 11+.
4. For App Store Connect, upload the default (opaque) 1024 PNG; it must have no transparency and no rounded corners.
5. If a marketing/rounded preview is needed, apply `border-radius: 22.37%` (229 px at 1024) in CSS or an iOS superellipse mask — never bake it into the asset.

## Don'ts
- No drop shadow, no inner glow, no text under the glyph.
- Don't thin the stroke below 11% of canvas width; the dot vanishes at 29 px.
- Keep the gradient direction fixed (coral top-left → violet bottom-right) across all appearances.
