import { createLowlight } from "lowlight";
import { Schema } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type MermaidPluginOptions, mermaidPlugin } from "./plugin";

// Mock mermaid
vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: vi
      .fn()
      .mockResolvedValue({ svg: '<svg><rect width="100" height="50"/></svg>' }),
  },
}));

// Mock svg-fns
vi.mock("@svg-fns/io", () => ({
  parseSvg: vi.fn().mockReturnValue(document.createElement("svg")),
}));

vi.mock("@svg-fns/layout", () => ({
  tightlyCropSvg: vi.fn(),
}));

// Mock lowlight-mermaid
vi.mock("lowlight-mermaid", () => ({
  mermaidGrammar: () => ({ name: "mermaid" }),
}));

const schema = new Schema({
  nodes: {
    doc: { content: "block+" },
    paragraph: { group: "block", content: "text*" },
    text: {},
    codeBlock: {
      group: "block",
      content: "text*",
      attrs: {
        language: { default: null },
        id: { default: null },
      },
      toDOM: () => ["pre", ["code", 0]],
    },
  },
});

describe("mermaidPlugin", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("creates plugin with default options", () => {
    const plugin = mermaidPlugin({ classList: "mermaid-container" });
    expect(plugin).toBeDefined();
    // @ts-expect-error -- test
    expect(plugin.key).toBeDefined();
  });

  it("creates plugin with custom options", () => {
    const options: MermaidPluginOptions = {
      name: "customCodeBlock",
      debounce: 500,
      mermaidConfig: { theme: "dark" },
      classList: ["custom", "mermaid"],
    };

    const plugin = mermaidPlugin(options);
    expect(plugin).toBeDefined();
  });

  it("creates decorations for mermaid code blocks", () => {
    const plugin = mermaidPlugin({ classList: "mermaid" });

    const codeBlock = schema.nodes.codeBlock.create(
      { language: "mermaid", id: "test-1" },
      schema.text("graph TD\nA --> B"),
    );

    const doc = schema.nodes.doc.create({}, [codeBlock]);
    const state = EditorState.create({ doc, plugins: [plugin] });

    // @ts-expect-error -- test
    const decorations = plugin.props?.decorations?.(state);
    expect(decorations).toBeDefined();
    // @ts-expect-error -- test
    expect(decorations?.find().length).toBe(1);
  });

  it("ignores non-mermaid code blocks", () => {
    const plugin = mermaidPlugin({ classList: "mermaid" });

    const codeBlock = schema.nodes.codeBlock.create(
      { language: "javascript", id: "test-1" },
      schema.text("console.log('hello');"),
    );

    const doc = schema.nodes.doc.create({}, [codeBlock]);
    const state = EditorState.create({ doc, plugins: [plugin] });

    // @ts-expect-error -- test
    const decorations = plugin.props?.decorations?.(state);
    // @ts-expect-error -- test
    expect(decorations?.find().length).toBe(0);
  });

  it("ignores code blocks without id", () => {
    const plugin = mermaidPlugin({ classList: "mermaid" });

    const codeBlock = schema.nodes.codeBlock.create(
      { language: "mermaid" },
      schema.text("graph TD\nA --> B"),
    );

    const doc = schema.nodes.doc.create({}, [codeBlock]);
    const state = EditorState.create({ doc, plugins: [plugin] });

    // @ts-expect-error -- test
    const decorations = plugin.props?.decorations?.(state);
    // @ts-expect-error -- test
    expect(decorations?.find().length).toBe(0);
  });

  it("ignores empty code blocks", () => {
    const plugin = mermaidPlugin({ classList: "mermaid" });

    const codeBlock = schema.nodes.codeBlock.create(
      { language: "mermaid", id: "test-1" },
      schema.text("   "),
    );

    const doc = schema.nodes.doc.create({}, [codeBlock]);
    const state = EditorState.create({ doc, plugins: [plugin] });

    // @ts-expect-error -- test
    const decorations = plugin.props?.decorations?.(state);
    // @ts-expect-error -- test
    expect(decorations?.find().length).toBe(0);
  });

  it("handles different mermaid language aliases", () => {
    const plugin = mermaidPlugin({ classList: "mermaid" });

    const languages = ["mermaid", "mmd", "mindmap"];

    languages.forEach((lang, index) => {
      const codeBlock = schema.nodes.codeBlock.create(
        { language: lang, id: `test-${index}` },
        schema.text("graph TD\nA --> B"),
      );

      const doc = schema.nodes.doc.create({}, [codeBlock]);
      const state = EditorState.create({ doc, plugins: [plugin] });

      // @ts-expect-error -- test
      const decorations = plugin.props?.decorations?.(state);
      // @ts-expect-error -- test
      expect(decorations?.find().length).toBe(1);
    });
  });

  it("uses custom node name", () => {
    const plugin = mermaidPlugin({ name: "customCode", classList: "mermaid" });

    const codeBlock = schema.nodes.codeBlock.create(
      { language: "mermaid", id: "test-1" },
      schema.text("graph TD\nA --> B"),
    );

    const doc = schema.nodes.doc.create({}, [codeBlock]);
    const state = EditorState.create({ doc, plugins: [plugin] });

    // Should not find decorations because node name doesn't match
    // @ts-expect-error -- test
    const decorations = plugin.props?.decorations?.(state);
    // @ts-expect-error -- test
    expect(decorations?.find().length).toBe(0);
  });

  it("accepts array of CSS classes", () => {
    const plugin = mermaidPlugin({ classList: ["custom", "mermaid"] });
    expect(plugin).toBeDefined();
  });

  it("accepts single CSS class as string", () => {
    const plugin = mermaidPlugin({ classList: "single-class" });
    expect(plugin).toBeDefined();
  });

  it("handles multiple mermaid blocks", () => {
    const plugin = mermaidPlugin({ classList: "mermaid" });

    const block1 = schema.nodes.codeBlock.create(
      { language: "mermaid", id: "test-1" },
      schema.text("graph TD\nA --> B"),
    );

    const block2 = schema.nodes.codeBlock.create(
      { language: "mmd", id: "test-2" },
      schema.text('pie\n"Dogs" : 386\n"Cats" : 85'),
    );

    const doc = schema.nodes.doc.create({}, [block1, block2]);
    const state = EditorState.create({ doc, plugins: [plugin] });

    // @ts-expect-error -- test
    const decorations = plugin.props?.decorations?.(state);
    // @ts-expect-error -- test
    expect(decorations?.find().length).toBe(2);
  });

  it("caches rendered content for unchanged code", async () => {
    const mermaid = await import("mermaid");
    const renderSpy = vi.spyOn(mermaid.default, "render");

    const plugin = mermaidPlugin({ classList: "mermaid", debounce: 0 });

    const codeBlock = schema.nodes.codeBlock.create(
      { language: "mermaid", id: "test-1" },
      schema.text("graph TD\nA --> B"),
    );

    const doc = schema.nodes.doc.create({}, [codeBlock]);
    const state1 = EditorState.create({ doc, plugins: [plugin] });

    // First render
    // @ts-expect-error -- test
    plugin.props?.decorations?.(state1);

    // Second render with same content
    const state2 = EditorState.create({ doc, plugins: [plugin] });
    // @ts-expect-error -- test
    plugin.props?.decorations?.(state2);

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Should only render once due to caching
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});

describe("MermaidPluginOptions", () => {
  it("has correct default values", () => {
    const plugin = mermaidPlugin({ classList: "test" });
    expect(plugin).toBeDefined();
  });

  it("accepts all configuration options", () => {
    const options: MermaidPluginOptions = {
      name: "customBlock",
      debounce: 1000,
      mermaidConfig: {
        theme: "dark",
        startOnLoad: false,
      },
      classList: ["custom", "diagram"],
    };

    const plugin = mermaidPlugin(options);
    expect(plugin).toBeDefined();
  });
});
