# HANDOFF — markdown-md

_Last updated: 2026-03-26_

## What This Is

Standalone markdown editor (Electron desktop app + web deployable). Valentine color palette (iTerm2-derived). Will embed into CEREBRO's "Global Files & Editor" section. Built with React 19 + Tiptap v3 + electron-vite + Zustand + vanilla CSS.

## Session Boundary

- **Status**: active
- **Last updated**: 2026-03-26
- **Branch**: `main`
- **PR #1**: merged (Phases 1-2)

## Last Completed

- Valentine color migration: tokens.css rewritten from Stitch to valentine palette, hardcoded rgba values updated
- Phase 3 Toolbar: full formatting toolbar with all button groups (undo/redo, headings, bold/italic/strike/code/highlight, lists, blockquote, link, insert menu)
- Tiptap extensions wired: highlight, table, task-list, link, image, code-block-lowlight, typography
- Electron Format menu expanded: bold, italic, strikethrough, code shortcuts via native menu
- Editor content CSS: task list checkboxes, table styles, highlight marks, syntax highlighting
- Annotation architecture decided: build standalone in markdown-md (Phase 6)

## What's Built (File Map)

| File | Purpose |
|------|---------|
| `electron/main.ts` | Electron main process: window, native menus, IPC routing, zoom blocking |
| `electron/preload.ts` | contextBridge: file ops + menu/format events to renderer |
| `electron/ipc-handlers.ts` | Node fs file operations (open, save, save-as via dialog) |
| `src/components/Editor/TiptapEditor.tsx` | Tiptap instance + all extensions, markdown parse, heading promote/demote, badge, format event handlers |
| `src/components/Editor/MarkdownEditor.tsx` | Orchestrator: wires file I/O, autosave, store sync, exposes editor handle |
| `src/components/Layout/AppShell.tsx` | Grid layout: topbar + toolbar + sidebar + editor + status bar |
| `src/components/Toolbar/Toolbar.tsx` | Toolbar container: button groups, heading dropdown, insert menu |
| `src/components/Toolbar/ToolbarButton.tsx` | Reusable button: icon, tooltip, active state, focus-preserving click |
| `src/components/Toolbar/HeadingDropdown.tsx` | Dropdown: P, H1-H6 selection |
| `src/components/Toolbar/InsertMenu.tsx` | Dropdown: table, horizontal rule, code block, image |
| `src/components/StatusBar/StatusBar.tsx` | File name, dirty indicator, word count |
| `src/stores/editor-store.ts` | Zustand: fileName, filePath, isDirty, wordCount |
| `src/hooks/useFileIO.ts` | React hook: open/save/saveAs + menu event listeners |
| `src/lib/file-io.ts` | Dual backend adapter: Electron IPC or web upload/download |
| `src/lib/autosave.ts` | Debounced localStorage autosave (1s) |
| `src/styles/tokens.css` | Valentine dark palette (surfaces anchored at #343434) |
| `src/styles/toolbar.css` | Toolbar layout, button styles, dropdown menus, active states |
| `src/styles/reset.css` | Box model reset, body defaults, drag regions |
| `src/styles/layout.css` | AppShell grid, topbar, sidebar, status bar |
| `src/styles/editor-content.css` | ProseMirror content styles, heading badge, highlight/task-list/table/syntax CSS |
| `src/types/electron.d.ts` | Window.api type declarations |
| `electron.vite.config.ts` | electron-vite config (main, preload, renderer) |
| `docs/specs/2026-03-26-valentine-color-integration-design.md` | Color integration spec |

## Key Decisions

- **Fresh EditorState on file open**: ProseMirror author recommends new state (not setContent) when loading files. Fixes undo history and node corruption.
- **Heading cycle is semantic**: H1→H2→...→H6→P. H4-H6 will be styled larger than P in CSS.
- **Valentine palette replaces Stitch**: Full token mapping in spec. Surfaces derived from iTerm bg `#343434`. Two derived colors: seafoam `#88d8c0` (secondary), soft carnation `#f0a0b8` (tertiary). Reserved: `#a70138` (deep crimson), `#d4c9ff` (soft lavender).
- **Standalone-first, CEREBRO-ready**: MarkdownEditor component has zero Electron dependency, embeds via props
- **Annotations in markdown-md**: Build annotation layer standalone (Phase 6). Editor owns highlight creation, comment attachment, markdown serialization. CEREBRO layers on multi-user identity and persistence.

## Plan Reference

`~/.claude/plans/curious-beaming-crystal.md` — 8-phase plan. Phases 1-3 complete. Phase check-ins enforced.

## Next Actions

- Phase 4: View Modes (CodeMirror raw pane, split view, view toggle)
- Phase 5: Slash Commands (Tiptap Suggestion, floating menu, keyboard nav)
- Phase 6: Annotations + Sidebar (annotation marks, color picker, sidebar cards)

## Open Questions / Blockers

- Green reuse: `#baffc9` used for --success, --diff-add, and ANSI green. User flagged — may need differentiation later.
- Comment syntax color `#535353` (bright black) might be too dark — revisit when code blocks ship.
