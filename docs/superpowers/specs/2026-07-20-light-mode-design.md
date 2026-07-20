# Light Mode Design — Homepage Portfolio

**Date:** 2026-07-20  
**Status:** Draft for review  
**Scope:** Add a manual light/dark theme toggle to the Vite + React portfolio site.

---

## 1. Goal

Ship a polished **light mode** that feels like a deliberate partner to the existing dark aesthetic (cold gray surfaces + retained cyan/teal/blue accents), with a **manual toggle button**. Dark remains the default for first-time visitors.

## 2. Decisions (locked)

| Decision | Choice |
|---|---|
| Trigger | Manual button only |
| Default theme | Dark (always, until user chooses) |
| System preference | Not followed on first visit |
| Persistence | `localStorage` key `theme` = `light` \| `dark` |
| Implementation | CSS variables + `data-theme` on `<html>` |
| Visual direction | Cold gray light palette; keep accent hues |

## 3. Architecture

### 3.1 Theme application

- Set `document.documentElement.dataset.theme` to `dark` or `light`.
- Also set `document.documentElement.style.colorScheme` (or `color-scheme` via CSS) so native UI (scrollbars, form controls) match.
- Dark tokens stay on `:root` (current values). Light tokens override under:

```css
:root,
[data-theme="dark"] { /* existing dark tokens */ }

[data-theme="light"] { /* light tokens */ }
```

- Optional but recommended: a tiny **blocking inline script** in `index.html` that reads `localStorage.theme` before first paint to avoid a dark→light flash when the user previously chose light.

### 3.2 State ownership

- New hook: `src/hooks/useTheme.ts`
  - Reads initial theme from `document.documentElement.dataset.theme` (set by inline script) or falls back to `localStorage` / `'dark'`.
  - Exposes `{ theme, toggleTheme, setTheme }`.
  - On change: update `dataset.theme`, `localStorage`, and `color-scheme`.
- Wire toggle into `Nav` (primary UI). `App` may pass nothing if the hook is self-contained.

### 3.3 Toggle UI placement

- **Desktop:** icon/button in the nav bar, near `.nav-time` (right cluster).
- **Mobile:** same control remains visible in the top nav (not buried only in drawer), so theme is always reachable without opening the menu.
- Control:
  - `button` with `type="button"`.
  - `aria-label` reflects next action (e.g. “切换到浅色模式” / “切换到深色模式”) or current state.
  - `data-cursor="link"` for custom cursor parity with other interactive elements.
  - Visual: compact mono-style control consistent with nav (prefer sun/moon glyphs or simple SVG; optional `DAY`/`NIGHT` mono label if icons feel out of place). Keep size aligned with nav touch targets.

## 4. Design tokens

### 4.1 Core palette

| Token | Dark (current) | Light |
|---|---|---|
| `--bg` | `#04070e` | `#f4f7fb` |
| `--bg2` | `#070c16` | `#e8eef6` |
| `--panel` | `#0a101d` | `#ffffff` |
| `--ink` | `#eaf2fb` | `#0b1220` |
| `--dim` | `#8b9bb4` | `#5b6b82` |
| `--line` | `rgba(148, 180, 220, .14)` | `rgba(15, 35, 60, .10)` |
| `--cyan` | `#22d3ee` | `#0891b2` (slightly deeper for text/contrast on light) *or keep hue if contrast OK* |
| `--blue` | `#60a5fa` | keep or slight deepen for body-adjacent uses |
| `--teal` | `#2dd4bf` | keep / slight deepen for text uses |
| `--font-d` / `--font-m` / `--ease` | unchanged | unchanged |

**Accent policy:** Prefer keeping the brand cyan/teal family. Where cyan is used as **text or thin stroke on light surfaces**, use a slightly deeper cyan (e.g. `#0891b2` / `#0e7490`) if WCAG contrast fails with pure `#22d3ee`. Filled accent chips and gradients may stay brighter.

### 4.2 New semantic tokens (replace hardcodes)

Introduce tokens so dark-only hex/rgba stop leaking into components:

| Token | Purpose | Dark | Light |
|---|---|---|---|
| `--on-accent` | Text/icon on cyan fills | `#04070e` | `#04070e` or near-black |
| `--scrim` | Image/card bottom fade | `rgba(4, 7, 14, .55)` | `rgba(244, 247, 251, .72)` or soft ink scrim |
| `--nav-glass` | Scrolled nav background | `rgba(4, 7, 14, .6)` | `rgba(244, 247, 251, .72)` |
| `--drawer-bg` | Mobile drawer | `rgba(4, 7, 14, .94)` | `rgba(244, 247, 251, .96)` |
| `--stroke-ghost` | Outline/hollow display text | `rgba(234, 242, 251, .5)` | `rgba(11, 18, 32, .35)` |
| `--noise-opacity` | Film grain overlay | `0.055` | `0.03`–`0.04` |

Refactor known hardcodes in `global.css` (approx. lines using `#04070e`, `rgba(4, 7, 14, …)`, selection/cursor-on-accent colors) to these tokens.

### 4.3 Component-specific notes

- **Noise (`body::after`):** lower opacity in light mode.
- **Nav scrolled state:** use `--nav-glass` + existing blur.
- **Work cards / avatar fades:** use `--scrim` gradients.
- **Loader / drawer:** backgrounds via tokens; loader remains full-bleed brand moment.
- **Outline/stroke headings:** switch from light-ink stroke to dark-ink stroke via `--stroke-ghost`.
- **Contribution levels (`.level-0`…`.level-4`):** provide light-mode fills (soft cool grays → deeper teal/cyan) so empty cells don’t look dirty on white.
- **Hero canvas:** no mandatory code change if particles stay cyan-on-either-background; verify readability visually. Only adjust if contrast fails.
- **Cursor / selection:** use `--on-accent` for label/text on cyan.

### 4.4 Motion / a11y

- Theme change: transition `background-color`, `color`, `border-color` on `body` and key surfaces (~0.25–0.35s). Do **not** animate large background-images or canvas.
- Respect `prefers-reduced-motion`: skip theme color transitions if reduced (instant swap).
- Existing reduced-motion and touch-device behaviors remain untouched.
- Focus ring for the theme button must be visible in both themes.

## 5. File-level change plan

| File | Change |
|---|---|
| `index.html` | Optional FOUC-prevention script: read `localStorage.theme`, set `data-theme` + `color-scheme` |
| `src/styles/global.css` | Light token block; semantic tokens; replace hardcodes; light contribution levels; toggle button styles; minor opacity tweaks |
| `src/hooks/useTheme.ts` | New hook (state + persistence + DOM sync) |
| `src/components/Nav.tsx` | Theme toggle button + hook usage |
| `src/App.tsx` | Only if theme needs to be provided higher (prefer keep in Nav/hook) |
| Components with canvas-only colors | Touch only if visual QA requires |

No new dependencies.

## 6. Out of scope

- Auto-following `prefers-color-scheme` (may be a later enhancement that only applies when no stored preference exists)
- Separate asset sets for light/dark images
- Redesigning layout, typography scale, or animations
- Unit test framework introduction

## 7. Validation

1. `npm run build` succeeds.
2. Manual check (`npm run dev`):
   - First visit: dark.
   - Toggle → light; reload stays light.
   - Toggle → dark; reload stays dark.
   - Desktop + mobile (≤768): toggle reachable and usable.
   - Sections: Hero, Manifesto, Works cards, Stack, Contributions heatmap, About, Contact, Footer, Loader (hard refresh).
   - Scrolled nav glass, drawer open, custom cursor on interactive targets.
   - `prefers-reduced-motion`: theme still switches cleanly.
3. Spot-check contrast of body text and cyan links on light surfaces.

## 8. Success criteria

- User can switch themes with one click; preference persists.
- Light mode reads as intentional cold-gray design, not inverted dark.
- No FOUC for returning light-mode users (with inline script).
- No regression to dark-mode appearance when `data-theme` is dark/absent.
