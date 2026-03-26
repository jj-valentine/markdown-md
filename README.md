<div align="center">
  <h1>markdown-md</h1>
  <p><em>Mark up your markdown.</em></p>
  <p>Annotations, highlights, and rich overlays on plain <code>.md</code> files &mdash;<br/>without breaking the format underneath.</p>
  <p>
    <img src="https://img.shields.io/badge/electron-41-47848f?style=flat-square&logo=electron&logoColor=white" alt="Electron 41"/>
    <img src="https://img.shields.io/badge/react-19-61dafb?style=flat-square&logo=react&logoColor=black" alt="React 19"/>
    <img src="https://img.shields.io/badge/tiptap-3-1a1a2e?style=flat-square" alt="Tiptap 3"/>
    <img src="https://img.shields.io/badge/license-MIT-22aa55?style=flat-square" alt="MIT"/>
  </p>
</div>

---

> Markdown was designed to strip markup away. markdown-md adds it back &mdash; annotations, highlights, comments, structure &mdash; as a rich layer on top of files that stay plain text on disk. Open them anywhere, mark them up here.

---

## How it works

```
your-file.md  (plain text, never modified by annotations)
      |
  Tiptap / ProseMirror
  (rich editor, markdown round-trip)
      |
  Markup Layer  [coming]
  (annotations, highlights, comments — stored separately)
      |
  Electron + React
  (native file I/O, dark UI, autosave)
```

Open a `.md` file. Edit it with a rich editor. Mark it up with annotations that live in a separate overlay — the markdown underneath stays portable and unchanged.

---

## Quick start

```bash
git clone https://github.com/jj-valentine/markdown-md.git && cd markdown-md
npm install
npm run dev
```

An Electron window opens with a dark-themed editor. Start typing, or open an existing `.md` file with Cmd+O.

---

## The idea

Markdown is everywhere — docs, notes, READMEs, knowledge bases. But it's deliberately minimal. No annotations. No highlights. No way to layer meaning on top of a document without changing the document itself.

markdown-md is a structured overlay editor. Open any `.md` file, mark it up with annotations, highlights, comments, and structural cues — and the markdown underneath stays untouched. Your `.md` files remain portable, diffable, and readable in any tool. The markup layer lives separately.

Think of it as the difference between writing in a notebook and writing *on* a notebook — sticky notes, margin scribbles, highlighted passages — without altering a single page.

### What's built

The editor foundation is in place. Markup features are coming next.

**Editor core**
- WYSIWYG editing backed by Tiptap 3 (ProseMirror) with full markdown round-tripping
- Headings, bold, italic, links, images, code blocks, tables, task lists, blockquotes
- Syntax highlighting in fenced code blocks (lowlight)
- Heading promote/demote with Cmd+= / Cmd+- and animated level badge

**File I/O**
- Native file dialogs for open/save/save-as (`.md`, `.markdown`, `.mdx`, `.txt`)
- IPC path allowlist — only files from native dialogs can be written
- Autosave to localStorage (1s debounce), restored on relaunch
- Close guard with save/discard/cancel dialog, error recovery on save failure

**Dual backend**
- Desktop: Electron IPC + Node `fs`
- Web: browser download/upload fallback
- Editor component has zero Electron imports — embeddable anywhere

---

## Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd+O | Open file |
| Cmd+S | Save |
| Cmd+Shift+S | Save As |
| Cmd+= | Promote heading (H3 &rarr; H2) |
| Cmd+- | Demote heading (H2 &rarr; H3) |
| Cmd+Z / Cmd+Shift+Z | Undo / Redo |
| Cmd+B / Cmd+I | Bold / Italic |

Zoom is disabled (Cmd+=/- are reserved for heading shortcuts).

---

## Architecture

```
markdown-md/
├── electron/
│   ├── main.ts              # Window, menus, close guard, heading shortcuts
│   ├── preload.ts           # contextBridge API (sandboxed)
│   └── ipc-handlers.ts      # file:open, file:save, file:save-as
│
├── src/
│   ├── components/
│   │   ├── Editor/
│   │   │   ├── TiptapEditor.tsx      # Tiptap instance, markdown round-trip
│   │   │   └── MarkdownEditor.tsx    # Orchestrator: file I/O, autosave, store
│   │   ├── Layout/AppShell.tsx       # Grid shell (topbar, sidebar, editor, status)
│   │   └── StatusBar/StatusBar.tsx   # File name, word count, encoding
│   ├── hooks/useFileIO.ts           # Open/save/saveAs + menu event wiring
│   ├── stores/editor-store.ts       # Zustand: fileName, isDirty, wordCount
│   ├── lib/
│   │   ├── file-io.ts              # Dual backend adapter
│   │   └── autosave.ts             # localStorage autosave (1s debounce)
│   ├── types/electron.d.ts         # Window.api type declarations
│   └── styles/
│       ├── tokens.css              # Design tokens (dark palette)
│       ├── reset.css               # Box model reset, body defaults
│       ├── layout.css              # AppShell grid, topbar, sidebar
│       └── editor-content.css      # ProseMirror content styling
│
├── electron.vite.config.ts         # Build config (main, preload, renderer)
└── package.json
```

### IPC flow

```
Renderer                    Main Process               Disk
   |                            |                        |
   |--- invoke('file:save') --->|                        |
   |                            |--- writeFile() ------->|
   |                            |<-- ok ----------------|
   |<-- { filePath } ----------|                        |
   |                            |                        |
   |--- send('save-complete') ->|                        |
   |                            |-- win.destroy() -->    |
```

Save operations go through IPC with a path allowlist. The renderer never touches the filesystem directly.

### Close guard flow

```
User closes window
    |
Main: e.preventDefault()
Main: send('query:is-dirty')
    |
Renderer: reply:is-dirty(true)
    |
Main: showMessageBoxSync
    |
    +-- Save    --> menu:save --> save-complete --> win.destroy()
    +-- Don't   --> win.destroy()
    +-- Cancel  --> (nothing)
    +-- Failure --> save-failed --> error dialog, window stays
    +-- No response (crash) --> second close forces quit
```

---

## Design system

Dark indigo/violet palette. No CSS framework — vanilla CSS with custom properties.

| Token | Value | Usage |
|-------|-------|-------|
| `--surface` | `#0e0e0e` | Main background |
| `--surface-container` | `#1a1919` | Elevated surfaces |
| `--primary` | `#a3a6ff` | Links, active states |
| `--primary-dim` | `#6063ee` | Blockquote borders |
| `--tertiary` | `#ffa5d9` | Inline code |
| `--on-surface` | `#ffffff` | Primary text |
| `--on-surface-variant` | `#adaaaa` | Secondary text |
| `--outline-variant` | `#494847` | Borders |

**Typography:** Inter for body, JetBrains Mono for code. Both loaded locally.

---

## Stack

| Layer | Tech |
|-------|------|
| Runtime | [Electron](https://www.electronjs.org/) 41 |
| Editor | [Tiptap](https://tiptap.dev/) 3 (ProseMirror) |
| Markdown | [@tiptap/markdown](https://tiptap.dev/docs/editor/extensions/functionality/markdown) |
| UI | [React](https://react.dev/) 19 |
| State | [Zustand](https://zustand.docs.pmnd.rs/) 5 |
| Icons | [Lucide](https://lucide.dev/) |
| Syntax | [lowlight](https://github.com/wooorm/lowlight) (highlight.js) |
| Build | [electron-vite](https://electron-vite.github.io/) 5 + [Vite](https://vite.dev/) 7 |
| Language | TypeScript 5.9, vanilla CSS |

---

## Scripts

```bash
npm run dev        # Start dev server (hot-reload renderer)
npm run build      # Production build → out/
npm run preview    # Preview production build
npm run lint       # ESLint
```

---

## Embedding

The `MarkdownEditor` component is designed for embedding into other React apps. It has no Electron imports — all platform integration flows through props and the `window.api` bridge, which gracefully degrades when absent.

```tsx
import MarkdownEditor from './components/Editor/MarkdownEditor'

// Works standalone — no Electron required
<MarkdownEditor />
```

This is the integration point for [CEREBRO](https://github.com/jj-valentine/cerebellum)'s Global Files & Editor section.

---

## Roadmap

**Markup layer** (the point of all this)
- [ ] Inline annotations — attach notes to any span of text
- [ ] Highlights with categories (question, important, revisit)
- [ ] Margin comments — visible alongside content, stored separately
- [ ] Annotation persistence — overlay data stored alongside `.md` files without modifying them

**Editor**
- [ ] Toolbar with full formatting controls
- [ ] Find and replace
- [ ] File tree sidebar
- [ ] Tabs for multiple open files

**Export & theming**
- [ ] Export to HTML / PDF (with or without annotations)
- [ ] Custom themes
- [ ] Plugin system

---

## License

MIT
