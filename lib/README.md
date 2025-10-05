# Prosemirror Mermaid <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

[![test](https://github.com/md2docx/prosemirror-mermaid/actions/workflows/test.yml/badge.svg)](https://github.com/md2docx/prosemirror-mermaid/actions/workflows/test.yml)
[![Maintainability](https://qlty.sh/gh/md2docx/projects/prosemirror-mermaid/maintainability.svg)](https://qlty.sh/gh/md2docx/projects/prosemirror-mermaid)
[![codecov](https://codecov.io/gh/md2docx/prosemirror-mermaid/graph/badge.svg)](https://codecov.io/gh/md2docx/prosemirror-mermaid)
[![Version](https://img.shields.io/npm/v/prosemirror-mermaid.svg?colorB=green)](https://www.npmjs.com/package/prosemirror-mermaid)
[![Downloads](https://img.jsdelivr.com/img.shields.io/npm/d18m/prosemirror-mermaid.svg)](https://www.npmjs.com/package/prosemirror-mermaid)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/prosemirror-mermaid)
[![NPM License](https://img.shields.io/npm/l/prosemirror-mermaid)](../LICENSE)

> 🧩 A lightweight **ProseMirror plugin** that renders [Mermaid](https://mermaid.js.org/) diagrams directly inside the editor — with live updates, caching, and tight SVG cropping.

---

## ✨ Features

- **Live rendering** — Mermaid diagrams update automatically as you type.
- **Debounced updates** — Smooth, performant re-rendering (default: 300 ms).
- **Smart caching** — Re-renders only when the diagram source changes.
- **Syntax highlighting** — Works seamlessly with [`lowlight`](https://github.com/wooorm/lowlight) and `lowlight-mermaid`.
- **Tight SVG cropping** — Uses [`@svg-fns/layout`](https://github.com/mayank1513/svg-fns) for clean, whitespace-free output.
- **Robust architecture** — Follows ProseMirror best practices via widget decorations and plugin-managed lifecycle.

---

## 🚀 Installation

```bash
pnpm add prosemirror-mermaid
```

**_or_**

```bash
npm install prosemirror-mermaid
```

**_or_**

```bash
yarn add prosemirror-mermaid
```

---

## 🧩 Usage

```ts
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { mermaidPlugin } from "prosemirror-mermaid";
import mermaid from "mermaid";

// Important: initialize Mermaid yourself
mermaid.initialize({ startOnLoad: false });

const state = EditorState.create({
  schema,
  plugins: [
    // ... other plugins
    mermaidPlugin({ name: "codeBlock" }),
  ],
});

const view = new EditorView(document.querySelector("#editor"), { state });
```

---

## ⚙️ Options

| Option              | Type                                | Default       | Description                                                                                    |
| ------------------- | ----------------------------------- | ------------- | ---------------------------------------------------------------------------------------------- |
| **`name`**          | `string`                            | `'codeBlock'` | Node type treated as Mermaid block.                                                            |
| **`lowlight`**      | `ReturnType<typeof createLowlight>` | —             | Enables syntax highlighting. Registers `mermaid`, `mmd`, and `mindmap` grammars automatically. |
| **`debounce`**      | `number`                            | `300`         | Delay (ms) before re-rendering after edits.                                                    |
| **`mermaidConfig`** | `MermaidConfig`                     | —             | Pass directly to `mermaid.initialize()`.                                                       |
| **`classList`**     | `string[] \| string`                | —             | CSS classes applied to each diagram container.                                                 |

---

## 🧠 Node Requirements

Your ProseMirror schema’s Mermaid node (usually `codeBlock`) must include:

- `language`: must be `"mermaid"`, `"mmd"`, or `"mindmap"`.
- `id`: unique identifier (e.g., `m1234abcd`).

This is typically managed by your editor or nodeView logic.
If you’re using [tiptap](https://tiptap.dev/), you can generate stable IDs via an `addAttributes()` extension override.

---

## 🧩 Example Integration (Tiptap)

```ts
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import { mermaidPlugin } from "prosemirror-mermaid";
import mermaid from "mermaid";

const lowlight = createLowlight();
mermaid.initialize({ startOnLoad: false });

const editor = useEditor({
  extensions: [
    CodeBlockLowlight.configure({ lowlight }).extend({
      addAttributes() {
        const parentAttrs = this.parent?.() ?? {};

        return {
          ...parentAttrs,
          id: {
            default: () => `m${crypto.randomUUID().slice(0, 8)}`,
            parseHTML: element =>
              element.getAttribute("data-id") || `m${crypto.randomUUID().slice(0, 8)}`,
            renderHTML: attributes => {
              if (!attributes.id) return {};
              return { "data-id": attributes.id };
            },
          },
        };
      },
      addProseMirrorPlugins() {
        return [
          ...(this.parent?.() || []),
          mermaidPlugin({
            name: this.name,
            lowlight: this.options.lowlight,
            classList: "mermaid",
          }),
        ];
      },
    }),
  ],
});
```

---

## 🧰 Internals

- Uses **`Decoration.widget`** to inject rendered SVGs after code blocks.
- Maintains per-node **render cache**, **debounce timers**, and **code cache**.
- Relies on [`@svg-fns/io`](https://github.com/mayank1513/svg-fns) for safe SVG parsing and [`tightlyCropSvg`](https://github.com/mayank1513/svg-fns) for layout cleanup.
- Handles render errors gracefully with inline messages.

---

## 🪄 Example Styling

```css
.mermaid-container {
  display: flex;
  justify-content: center;
  padding: 0.5rem;
  overflow-x: auto;
  background: var(--code-bg, #fafafa);
  border-radius: 0.5rem;
}
```

---

## 🙏 Credits

- [Mermaid](https://mermaid.js.org/) for the visualization engine
- [ProseMirror](https://prosemirror.net/) for the editing framework
- [@svg-fns](https://github.com/mayank1513/svg-fns) for SVG utilities
- [lowlight-mermaid](https://github.com/wooorm/lowlight) for syntax support

---

## License

This library is licensed under the MPL-2.0 open-source license.

> <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 20px"/> Please enroll in [our courses](https://mayank-chaudhari.vercel.app/courses) or [sponsor](https://github.com/sponsors/mayank1513) our work.

<hr />

<p align="center" style="text-align:center">with 💖 by <a href="https://mayank-chaudhari.vercel.app" target="_blank">Mayank Kumar Chaudhari</a></p>
