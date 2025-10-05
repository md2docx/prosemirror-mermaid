/**
 * @file Provides a ProseMirror plugin for rendering Mermaid diagrams within the editor.
 *
 * @remarks
 * This plugin offers a comprehensive solution for integrating mermaid.js into a
 * ProseMirror editor. Key features include:
 *
 * - **Live Rendering**: Diagrams update automatically as the user types.
 * - **Debouncing**: Rendering is debounced to ensure performance in a live editing environment.
 * - **Caching**: Diagrams are only re-rendered when their source code changes.
 * - **Syntax Highlighting**: Integrates with `lowlight` for syntax highlighting of the mermaid code block.
 * - **Robust Architecture**: Follows ProseMirror best practices by separating concerns. Widget decorations
 * are used for placing containers, while the plugin `view` manages the rendering lifecycle and state.
 */

import { parseSvg } from "@svg-fns/io";
import { tightlyCropSvg } from "@svg-fns/layout";
import type { createLowlight } from "lowlight";
import { mermaidGrammar } from "lowlight-mermaid";
import mermaid, { type MermaidConfig } from "mermaid";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

/**
 * Defines the configuration options for the mermaidPlugin.
 */
export interface MermaidPluginOptions {
  /**
   * The name of the ProseMirror node type that should be treated as a mermaid block.
   * @default 'codeBlock'
   */
  name?: string;
  /**
   * An instance of `lowlight` used for syntax highlighting the code block.
   * If provided, the 'mermaid' grammar will be registered automatically.
   */
  lowlight?: ReturnType<typeof createLowlight>;
  /**
   * The debounce delay in milliseconds for rendering the mermaid diagram after
   * the user stops typing.
   * @default 300
   */
  debounce?: number;

  /**
   * Configuration options for the mermaid library.
   */
  mermaidConfig?: MermaidConfig;
  /**
   * CSS classes to apply to the container
   */
  classList: string[] | string;
}

/**
 * Creates a ProseMirror plugin that finds and renders Mermaid code blocks within the editor.
 *
 * The node using this plugin must set language and id attributes
 *
 * @example
 * ```ts
 * import { EditorState } from 'prosemirror-state';
 * import { EditorView } from 'prosemirror-view';
 * import { mermaidPlugin } from './prosemirror-mermaid';
 * import mermaid from 'mermaid';
 *
 * // It's important to initialize Mermaid yourself
 * mermaid.initialize({ startOnLoad: false });
 *
 * const state = EditorState.create({
 * schema,
 * plugins: [
 * // ... other plugins
 * mermaidPlugin({ name: 'codeBlock' })
 * ]
 * });
 *
 * const view = new EditorView(document.querySelector('#editor'), {
 * state,
 * });
 * ```
 *
 * @param options Configuration options for the plugin.
 * @returns A ProseMirror `Plugin` instance.
 */
export const mermaidPlugin = ({
  name = "codeBlock",
  lowlight,
  debounce = 300,
  mermaidConfig,
  classList,
}: MermaidPluginOptions): Plugin => {
  if (lowlight) {
    lowlight.register({ mermaid: mermaidGrammar });
    lowlight.registerAlias("mmd", "mermaid");
    lowlight.registerAlias("mindmap", "mermaid");
  }

  mermaid.initialize({
    ...mermaidConfig,
    startOnLoad: false,
    suppressErrorRendering: true,
  });

  const codeCache = new Map<string, string>();
  const renderCache = new Map<string, HTMLDivElement>();
  const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

  const createContainer = () => {
    const container = document.createElement("div");
    container.classList.add(
      ...(Array.isArray(classList) ? classList : [classList]),
    );
    return container;
  };

  return new Plugin({
    key: new PluginKey("mermaid"),
    props: {
      decorations: (state) => {
        const decorationsList: Decoration[] = [];

        state.doc.descendants((node, pos) => {
          const code = node.textContent.trim();

          if (
            node.type.name !== name ||
            !/mmd|mermaid|mindmap/i.test(node.attrs.language) ||
            !code ||
            !node.attrs.id
          ) {
            return;
          }

          const id = node.attrs.id;

          const container = renderCache.get(id) ?? createContainer();

          decorationsList.push(
            Decoration.widget(pos + node.nodeSize - 1, container, { side: 1 }),
          );

          // no change
          if (codeCache.get(id) === code) {
            return;
          }

          codeCache.set(id, code);

          if (debounceTimers.has(id)) {
            clearTimeout(debounceTimers.get(id));
          }

          const timer = setTimeout(async () => {
            try {
              const { svg } = await mermaid.render(id, code);
              container.textContent = "";
              const svgEl = parseSvg(svg);
              container.appendChild(svgEl);
              tightlyCropSvg(svgEl);
              container.classList.remove("error");
            } catch (err) {
              console.error(err);
              container.textContent =
                "Mermaid render error: " +
                (err instanceof Error ? err.message : String(err));
              container.classList.add("error");
            } finally {
              debounceTimers.delete(id);
            }
          }, debounce);

          debounceTimers.set(id, timer);

          renderCache.set(id, container);
        });

        return DecorationSet.create(state.doc, decorationsList);
      },
    },
  });
};
