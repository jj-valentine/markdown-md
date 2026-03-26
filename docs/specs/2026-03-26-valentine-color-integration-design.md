# Valentine Color Integration — Design Spec

Integrate the user's iTerm2 "valentine" color profile into the markdown-md editor theme, replacing the Stitch-derived palette. Every ANSI and UI color is assigned an editor semantic role.

## Source Palette

Extracted from `~/Library/Preferences/com.googlecode.iterm2.plist`, profile "valentine".

## Token Mapping

### Primary & Accent

| Token | Hex | Source | Role |
|-------|-----|--------|------|
| `--primary` | `#7980ff` | iTerm link | Links, active states, main accent |
| `--primary-dim` | `#93afff` | iTerm bright cyan | Blockquote borders, subdued primary |
| `--secondary` | `#88d8c0` | Derived (seafoam) | Secondary actions, sidebar active |
| `--accent` | `#7f7ff0` | iTerm magenta | Syntax keywords, special emphasis |
| `--tertiary` | `#f0a0b8` | Derived (soft carnation) | Inline code text |
| `--highlight` | `#ffb964` | iTerm bright magenta | Text highlight marks, annotation glow |

### Semantic Status

| Token | Hex | Source | Role |
|-------|-----|--------|------|
| `--error` | `#dd6964` | iTerm red | Errors, destructive actions |
| `--error-hover` | `#ff968d` | iTerm bright red | Error hover/focus states |
| `--warning` | `#ffd080` | iTerm yellow | Warnings, unsaved indicator |
| `--success` | `#baffc9` | iTerm green | Save confirmed, task complete |
| `--info` | `#61afef` | iTerm blue | Informational, metadata, word count |

### Surfaces

| Token | Hex | Source | Role |
|-------|-----|--------|------|
| `--surface` | `#343434` | iTerm background | Editor background |
| `--surface-container-lowest` | `#1a1a1a` | Derived | Deepest recesses (code block bg) |
| `--surface-container-low` | `#242424` | Derived | Topbar, status bar |
| `--surface-container` | `#2a2a2a` | Derived | Mid-level containers |
| `--surface-container-high` | `#3a3a3a` | Derived | Hover states, elevated panels |
| `--surface-container-highest` | `#444444` | Derived | Tooltips, dropdowns |
| `--surface-bright` | `#4a4a4a` | Derived | Brightest surface variant |
| `--surface-variant` | `#444444` | Derived | Same as highest |
| `--on-surface` | `#eeeeec` | iTerm white | Body text |
| `--on-surface-variant` | `#969696` | iTerm foreground | Secondary text, labels |
| `--outline` | `#777575` | Kept from Stitch | Borders, dividers |
| `--outline-variant` | `#4a4a4a` | Derived | Ghost borders (10-20% opacity) |
| `--selection` | `#eaeaea` | iTerm selection | Text selection background (new) |
| `--caret` | `#e5e5e5` | iTerm cursor | Editor caret color (new) |

### Content Syntax (code blocks, Phase 4+)

| Role | Hex | Source |
|------|-----|--------|
| Strings | `#aafba1` | iTerm bright green |
| Keywords | `#7f7ff0` | iTerm magenta (= `--accent`) |
| Functions | `#61afef` | iTerm blue (= `--info`) |
| Numbers/constants | `#ffd080` | iTerm yellow (= `--warning`) |
| Comments | `#535353` | iTerm bright black |
| Types | `#87cefa` | iTerm bright blue |
| HTML tags | `#dd6964` | iTerm red (= `--error`) |
| Inline code | `#f0a0b8` | Derived (= `--tertiary`) |

Note: comments at `#535353` may need adjustment — flagged for review once code blocks ship.

### Remaining Colors

| Token | Hex | Source | Role |
|-------|-----|--------|------|
| `--diff-add` | `#baffc9` | iTerm green | Diff addition background tint |
| `--search-highlight` | `#ffebab` | iTerm bright yellow | Search match highlight |
| `--tab-accent` | `#c9dfff` | iTerm cyan | Topbar/tab color accent |

### Colors Not Mapped

| Hex | Source | Reason |
|-----|--------|--------|
| `#414141` | iTerm black | Redundant with surface scale |
| `#feffff` | iTerm bright white | Too close to `--on-surface` |
| `#ff2600` | iTerm badge | Too saturated for UI use |
| `#b3ecff` | iTerm cursor guide | No current editor role |
| `#60aef0` | iTerm underline | Covered by `--info` |
| `#373737` | iTerm selected text | Covered by surface scale |

## Reserved Colors

Kept for future use — not assigned to tokens yet but too good to drop.

| Hex | Origin | Potential Role |
|-----|--------|----------------|
| `#a70138` | Stitch error-container | Deep crimson — destructive action fills, error container backgrounds |
| `#d4c9ff` | Stitch on-secondary-container | Soft lavender — annotation backgrounds, highlight variants, light accents |

## Tokens Dropped

These Stitch tokens have no valentine equivalent and are removed:

| Token | Old Value | Reason |
|-------|-----------|--------|
| `--primary-container` | `#9396ff` | No container pattern needed — `--primary` + opacity suffices |
| `--on-primary` | `#0f00a4` | Unused — dark-on-primary not needed in dark theme |
| `--on-primary-container` | `#0a0081` | Dropped with container |
| `--secondary-container` | `#49339d` | Replaced by `--secondary` + opacity |

## New Tokens Added

| Token | Hex | Note |
|-------|-----|------|
| `--accent` | `#7f7ff0` | Syntax keywords, special emphasis |
| `--highlight` | `#ffb964` | Text highlight marks, annotation glow |
| `--warning` | `#ffd080` | Warnings, unsaved state |
| `--success` | `#baffc9` | Save confirmed, task complete |
| `--info` | `#61afef` | Informational, metadata |
| `--error-hover` | `#ff968d` | Error hover/focus states |
| `--selection` | `#eaeaea` | Text selection background |
| `--caret` | `#e5e5e5` | Editor caret color |
| `--diff-add` | `#baffc9` | Diff addition tint |
| `--search-highlight` | `#ffebab` | Search match highlight |
| `--tab-accent` | `#c9dfff` | Topbar/tab accent |

## Implementation Notes

- Replace values in `tokens.css` — existing token names kept, new tokens appended
- Surface tonal scale: 6 stops from `#1a1a1a` to `#4a4a4a`, anchored at `#343434`
- `--primary-dim` is lighter than `--primary` — name is historical; role is "subdued/secondary primary" not "darker"
- Syntax highlighting tokens apply in Phase 4 (CodeMirror) and Phase 3 (code-block-lowlight)
- `--secondary` (`#88d8c0` seafoam) and `--tertiary` (`#f0a0b8` carnation) are derived — may revisit in context
- Container tokens replaced by base color + opacity pattern (e.g. `rgba(121, 128, 255, 0.1)` instead of `--primary-container`)
