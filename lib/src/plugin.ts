import { parseSvg } from "@svg-fns/io";
import type { createLowlight } from "lowlight";
import { mermaidGrammar } from "lowlight-mermaid";
import mermaid from "mermaid";
import { Plugin, PluginKey } from "prosemirror-state";
import { type Decoration, DecorationSet } from "prosemirror-view";
export interface MermaidPluginOptions {
  /**
   * The name of the node using this mermaid plugin.
   */
  name?: string;
  /**
   * The lowlight instance to use for highlighting code blocks.
   */
  lowlight?: ReturnType<typeof createLowlight>;
  /**
   * The maximum height of the mermaid diagram.
   */
  maxHeight?: number;
  /**
   * Debounce time for updating the mermaid diagram.
   * @default 300
   */
  debounce?: number;
}

export const mermaidPlugin = ({
  name = "codeBlock",
  lowlight,
  debounce = 300,
}: MermaidPluginOptions) => {
  /** Register mermaid grammar if lowlight is present */
  lowlight?.register({ mermaid: mermaidGrammar });
  lowlight?.registerAlias("mmd", "mermaid");
  lowlight?.registerAlias("mindmap", "mermaid");

  // Track last rendered state per position to avoid unnecessary renders
  const renderCache = new Map<number, string>();
  const debounceTimers = new Map<number, ReturnType<typeof setTimeout>>();

  return new Plugin({
    key: new PluginKey("mermaid"),
    props: {
      decorations: (state) => {
        const decorations: Decoration[] = [];
        state.doc.descendants((node, pos) => {
          const code = node.textContent.trim();
          if (
            node.type.name !== name ||
            !/mmd|mermaid|mindmap/i.test(node.attrs.language) ||
            !code || // empty
            renderCache.get(pos) === code // no change
          ) {
            return;
          }
          renderCache.set(pos, code);
          const id = `m-${pos}`;

          if (debounceTimers.has(pos)) {
            clearTimeout(debounceTimers.get(pos));
          }

          const timer = setTimeout(async () => {
            const container = document.createElement("div");
            try {
              const { svg } = await mermaid.render(id, code);
              container.appendChild(parseSvg(svg));
              container.classList.add("error");
            } catch (err) {
              console.error(err);
              container.textContent =
                "Mermaid render error: " +
                (err instanceof Error ? err.message : String(err));
              container.classList.add("error");
            } finally {
              debounceTimers.delete(pos);
            }
          }, debounce);

          debounceTimers.set(pos, timer);
        });

        return DecorationSet.create(state.doc, decorations);
      },
    },
  });
};
