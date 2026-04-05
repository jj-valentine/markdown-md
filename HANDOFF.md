# HANDOFF — markdown-md

_Last updated: 2026-03-28_

## What This Is

Standalone markdown editor (Electron desktop app + web deployable). Valentine color palette (iTerm2-derived). Will embed into CEREBRO's "Global Files & Editor" section. Built with React 19 + Tiptap v3 + electron-vite + Zustand + vanilla CSS.

## Session Boundary

- **Status**: mid-task
- **Ended because**: context limit
- **Last updated**: 2026-03-28
- **Branch**: `main`
- **PR #1**: merged (Phases 1-2)

## Last Completed

- **Batch 1 — Quick wins**: scrollbar fade-out (1.2s idle + margin), Discord-style tooltips (dark bg, arrow, mouse-tracking), double-click guard (rAF-deferred mousedown listeners)
- **Batch 2 — Button fixes**: table/image button selection-saving (focus-loss guard), UrlInput cleanup, floating TableControls for row/col management
- **Batch 3 — Editor behavior**: `useEditorState` for reactive toolbar state, format-word-at-cursor (inline buttons expand to word), link ⌘K dual listener removed (Toolbar owns it), link popover display-text field
- **Batch 4 — Responsive toolbar**: InsertMenu `expanded` prop, ResizeObserver threshold at 700px, collapses to "+" dropdown below that

## What's Built (File Map)

| File | Purpose |
|------|---------|
| `electron/main.ts` | Electron main process: window, native menus, IPC routing, zoom blocking, before-input-event handler |
| `electron/preload.ts` | contextBridge: file ops + menu/format events (bold, italic, strike, code, highlight, headings, lists, link) |
| `electron/ipc-handlers.ts` | Node fs file operations (open, save, save-as via dialog) |
| `src/components/Editor/TiptapEditor.tsx` | Tiptap instance + 12 extensions + ListTabIndent, markdown parse, heading promote/demote, badge, format event handlers |
| `src/components/Editor/MarkdownEditor.tsx` | Orchestrator: wires file I/O, autosave, store sync, scrollbar fade, TableControls |
| `src/components/Editor/TableControls.tsx` | Floating bar below active table: add/remove rows/cols, delete table |
| `src/components/Layout/AppShell.tsx` | Grid layout: topbar + toolbar + sidebar + editor + status bar |
| `src/components/Toolbar/Toolbar.tsx` | Toolbar container: button groups, heading dropdown, link URL input, insert menu |
| `src/components/Toolbar/ToolbarButton.tsx` | Reusable button: icon, styled tooltip (above), active state, focus-preserving click, keyboard activation |
| `src/components/Toolbar/HeadingDropdown.tsx` | Dropdown: P, H1-H6 selection with inline shortcut labels |
| `src/components/Toolbar/InsertMenu.tsx` | Dropdown: table (with size picker), horizontal rule, code block, image (with URL input) |
| `src/components/Toolbar/UrlInput.tsx` | Floating URL input popover for link/image insertion |
| `src/components/StatusBar/StatusBar.tsx` | File name, dirty indicator, word count |
| `src/stores/editor-store.ts` | Zustand: fileName, filePath, isDirty, wordCount |
| `src/hooks/useFileIO.ts` | React hook: open/save/saveAs + menu event listeners |
| `src/lib/file-io.ts` | Dual backend adapter: Electron IPC or web upload/download |
| `src/lib/autosave.ts` | Debounced localStorage autosave (1s) |
| `src/styles/tokens.css` | Valentine dark palette (surfaces anchored at #343434) |
| `src/styles/toolbar.css` | Toolbar layout, button/tooltip/dropdown/url-input/table-picker styles, z-index:10 |
| `src/styles/reset.css` | Box model reset, body defaults, selection color, drag regions |
| `src/styles/layout.css` | AppShell grid, topbar, sidebar, status bar |
| `src/styles/editor-content.css` | ProseMirror content styles, heading badge, highlight/task-list/table/syntax CSS |
| `src/types/electron.d.ts` | Window.api type declarations (all IPC handlers) |
| `electron.vite.config.ts` | electron-vite config (main, preload, renderer) |

## Key Decisions

- **Fresh EditorState on file open**: ProseMirror author recommends new state (not setContent) when loading files. Fixes undo history and node corruption.
- **Heading cycle is semantic**: H1→H2→...→H6→P. H4-H6 will be styled larger than P in CSS.
- **Valentine palette replaces Stitch**: Surfaces derived from iTerm bg `#343434`. Two derived colors: seafoam `#88d8c0` (secondary), soft carnation `#f0a0b8` (tertiary). Reserved: `#a70138` (deep crimson), `#d4c9ff` (soft lavender).
- **Standalone-first, CEREBRO-ready**: MarkdownEditor component has zero Electron dependency, embeds via props
- **Annotations in markdown-md**: Build annotation layer standalone (Phase 6).

## Plan Reference

`~/.claude/plans/curious-beaming-crystal.md` — 8-phase plan. Phases 1-3 complete. Phase check-ins enforced.

## Next Actions

### Bugs — Hotkeys (FIXED — needs manual testing)
- **Root causes diagnosed and fixed**:
  1. macOS Option+Shift+Number produces special chars — before-input-event now catches via `input.code`
  2. `input.key` changes with Shift held (`-`→`_`, `=`→`+`) — now uses `input.code` (physical key)
  3. Missing FormatShortcuts entries — added strikethrough, link (⌘K dispatches CustomEvent)
  4. Optimizer conflict on Cmd+- — fixed with `{ zoom: true }` on `optimizer.watchWindowShortcuts`
  5. IPC timing after preventDefault — now uses `setImmediate()` for all before-input-event IPC sends
- **All shortcuts preserved as user designed them**: ⌥⇧1-6, ⌥⇧P, ⌘⇧-/+/0, ⌘⇧X, ⌘K, ⌘⇧T, ⌘⇧I, ⌘=/-
- **Plan**: `~/.claude/plans/toasty-floating-gosling.md`

### Bugs — Buttons (FIXED)
- ✅ **Table/Image buttons**: added selection-saving before focus moves to picker inputs; restores position before executing command. Cleaned up UrlInput `__cleanup` hack.

### Bugs — Editor behavior (FIXED)
- ✅ **Toolbar state reflects cursor position**: used `useEditorState` from Tiptap v3 to subscribe to editor state changes — toolbar buttons now react to selection changes.
- ✅ **Format-word-at-cursor**: toolbar inline format buttons (bold, italic, strike, code, highlight) now expand to word boundaries before applying formatting.
- ✅ **Link ⌘K dual listener**: removed TiptapEditor's `onFormatLink` handler — Toolbar now exclusively owns link UI.
- ⚠️ **Double-click selection**: deferred toolbar mousedown listeners to rAF to avoid disrupting double-click. May still need ProseMirror-level fix if issue persists.

### UI — Tooltips (FIXED — Discord-style)
- ✅ **Discord-style tooltips**: dark bg (#111214), 4px radius, arrow pointing down, label + shortcut inline, 100ms transition
- ✅ **Mouse-tracking position**: tooltip follows cursor X within button
- ✅ **Hover delay**: 250ms

### UI — Other (FIXED)
- ✅ **Scrollbar**: fades out after 1.2s idle, shows on scroll/hover, 3px margin from edge via transparent border
- ✅ **Link popover display text**: added text field pre-filled from selection; handles insert-new, replace-text, and set-href-only cases
- ✅ **Responsive toolbar**: InsertMenu expands into inline buttons when toolbar > 700px, collapses back to "+" dropdown below that
- ✅ **Table row/column management**: floating TableControls bar appears below active table with add/remove row/col buttons + delete table

### Features
- **Code highlighting/annotation**: user should be able to highlight/annotate code blocks
- After toolbar fixes → **skip Phases 4-5**, go straight to **Phase 6: Annotations**

## Open Questions / Blockers

- **Hotkey fix needs manual Electron testing** — build passes but before-input-event behavior must be verified live.
- **All UI fixes need manual Electron testing** — built and type-checked but visual verification needed.
- Green reuse: `#baffc9` used for --success, --diff-add, and ANSI green. May need differentiation later.
- Comment syntax color `#535353` might be too dark.
