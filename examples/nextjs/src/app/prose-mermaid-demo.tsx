"use client";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { all, createLowlight } from "lowlight";
import { mermaidPlugin } from "prosemirror-mermaid";

const lowlight = createLowlight(all);

// svg-ops, svg-fx

lowlight.registerAlias("js", "javascript");
lowlight.registerAlias("ts", "typescript");
lowlight.registerAlias("html", "xml");
lowlight.registerAlias("md", "markdown");

const initialContent = `
<p>Hello World!</p>
<pre>
  <code class="language-javascript">
    console.log('Hello World!');
  </code>
</pre>

<pre>
  <code class="language-mermaid">
    graph TD
      A[Start] --> B{Is it working?}
      B -- Yes --> C[Great]
      B -- No --> D[Debug]
  </code>
</pre>
`;

export default function ProsemirrorMermaidDemo() {
  const editor = useEditor({
    content: initialContent,
    extensions: [
      Document,
      Paragraph,
      CodeBlockLowlight.configure({ lowlight }).extend({
        addAttributes() {
          const parentAttrs = this.parent?.() ?? {};

          return {
            ...parentAttrs,
            id: {
              default: null,
              parseHTML: (element) =>
                element.getAttribute("data-id") ||
                `m${crypto.randomUUID().slice(0, 8)}`,
              renderHTML: (attributes) => {
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
            }),
          ];
        },
      }),
      Text,
    ],
    immediatelyRender: false,
  });

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "10px auto",
        boxShadow: "0 0 10px gray",
      }}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
