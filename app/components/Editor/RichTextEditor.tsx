"use client";

import { createContext, useContext, useEffect, useId, useState, type ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { Extension, mergeAttributes, Mark, type ChainedCommands } from "@tiptap/core";
import type { ProjectPage } from "../../lib/ocworld";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
    fontFamily: {
      setFontFamily: (family: string) => ReturnType;
      unsetFontFamily: () => ReturnType;
    };
    lineSpacing: {
      setLineSpacing: (spacing: string) => ReturnType;
      unsetLineSpacing: () => ReturnType;
    };
    paragraphSpacing: {
      setParagraphSpacing: (spacing: string) => ReturnType;
      unsetParagraphSpacing: () => ReturnType;
    };
  }
}

const FontSize = Mark.create({
  name: "fontSize",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => element.style.fontSize || null,
        renderHTML: (attributes) => {
          if (!attributes.size) {
            return {};
          }
          return { style: `font-size: ${attributes.size}` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        style: "font-size",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { size });
        },
      unsetFontSize:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});

const FontFamily = Mark.create({
  name: "fontFamily",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      family: {
        default: null,
        parseHTML: (element) => element.style.fontFamily || null,
        renderHTML: (attributes) => {
          if (!attributes.family) {
            return {};
          }
          return { style: `font-family: ${attributes.family}` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        style: "font-family",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFontFamily:
        (family: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { family });
        },
      unsetFontFamily:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});

const LineSpacing = Mark.create({
  name: "lineSpacing",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      spacing: {
        default: null,
        parseHTML: (element) => element.style.lineHeight || null,
        renderHTML: (attributes) => {
          if (!attributes.spacing) {
            return {};
          }
          return { style: `line-height: ${attributes.spacing}` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        style: "line-height",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setLineSpacing:
        (spacing: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { spacing });
        },
      unsetLineSpacing:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});

const ParagraphSpacing = Extension.create({
  name: "paragraphSpacing",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          paragraphSpacing: {
            default: null,
            parseHTML: (element) => {
              const marginTop = element.style.marginTop;
              const marginBottom = element.style.marginBottom;
              if (marginTop && marginBottom) return "both";
              if (marginTop) return "before";
              if (marginBottom) return "after";
              return null;
            },
            renderHTML: (attributes) => {
              if (attributes.paragraphSpacing === "before") {
                return { style: "margin-top: 0.85rem" };
              }
              if (attributes.paragraphSpacing === "after") {
                return { style: "margin-bottom: 0.85rem" };
              }
              if (attributes.paragraphSpacing === "both") {
                return { style: "margin-top: 0.85rem; margin-bottom: 0.85rem" };
              }
              return {};
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setParagraphSpacing:
        (spacing: string) =>
        ({ commands }) => {
          const paragraphUpdated = commands.updateAttributes("paragraph", { paragraphSpacing: spacing });
          const headingUpdated = commands.updateAttributes("heading", { paragraphSpacing: spacing });
          return paragraphUpdated || headingUpdated;
        },
      unsetParagraphSpacing:
        () =>
        ({ commands }) => {
          const paragraphUpdated = commands.updateAttributes("paragraph", { paragraphSpacing: null });
          const headingUpdated = commands.updateAttributes("heading", { paragraphSpacing: null });
          return paragraphUpdated || headingUpdated;
        },
    };
  },
});

export const richTextExtensions = [
  StarterKit.configure({
    link: false,
    underline: false,
  }),
  Underline,
  Link.configure({ openOnClick: false }),
  TextStyle,
  Color,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Image,
  FontSize,
  FontFamily,
  LineSpacing,
  ParagraphSpacing,
];

const fontSizes = Array.from({ length: 17 }, (_, index) => 4 + index * 2);
const lineSpacings = [
  { label: "Single", value: "line:1" },
  { label: "1.15", value: "line:1.15" },
  { label: "1.25", value: "line:1.25" },
  { label: "1.5", value: "line:1.5" },
  { label: "Double", value: "line:2" },
  { label: "Add space before paragraph", value: "paragraph:before" },
  { label: "Add space after paragraph", value: "paragraph:after" },
  { label: "Remove paragraph space", value: "paragraph:clear" },
];
const fontFamilies = [
  { label: "System Sans", value: "Inter, ui-sans-serif, system-ui, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Editorial Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Classic Book", value: "Garamond, Baskerville, Georgia, serif" },
  { label: "Times", value: "'Times New Roman', Times, serif" },
  { label: "Typewriter", value: "'Courier New', Courier, monospace" },
  { label: "Clean Mono", value: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace" },
  { label: "Trebuchet", value: "'Trebuchet MS', Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Palatino", value: "Palatino, 'Palatino Linotype', serif" },
  { label: "Optima", value: "Optima, Candara, 'Noto Sans', sans-serif" },
  { label: "Lucida", value: "'Lucida Sans', 'Lucida Grande', sans-serif" },
  { label: "Century Gothic", value: "'Century Gothic', CenturyGothic, AppleGothic, sans-serif" },
  { label: "Book Antiqua", value: "'Book Antiqua', Palatino, serif" },
  { label: "Didot", value: "Didot, 'Bodoni 72', serif" },
  { label: "Copperplate", value: "Copperplate, 'Copperplate Gothic Light', fantasy" },
  { label: "Handwritten", value: "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive" },
  { label: "Soft Script", value: "'Snell Roundhand', 'Brush Script MT', cursive" },
];
const colorChoices = [
  { label: "Ink", value: "#0f172a" },
  { label: "Slate", value: "#475569" },
  { label: "Amethyst", value: "#7c3aed" },
  { label: "Sky", value: "#0ea5e9" },
  { label: "Moss", value: "#16a34a" },
  { label: "Ember", value: "#ea580c" },
  { label: "Rose", value: "#ef4444" },
  { label: "Ivory", value: "#f8fafc" },
];

function normalizePointSize(value: string) {
  const number = Number.parseFloat(value);
  if (!Number.isFinite(number)) return "";
  return String(Math.min(36, Math.max(4, number)));
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  pages?: ProjectPage[];
}

interface RichTextToolbarProps {
  editor: Editor | null;
  compact?: boolean;
  allowImages?: boolean;
  pages?: ProjectPage[];
}

const PageLinkContext = createContext<ProjectPage[]>([]);

export function PageLinkProvider({ pages, children }: { pages: ProjectPage[]; children: ReactNode }) {
  return <PageLinkContext.Provider value={pages}>{children}</PageLinkContext.Provider>;
}

export function usePageLinkPages() {
  return useContext(PageLinkContext);
}

export function RichTextToolbar({ editor, compact = false, allowImages = true, pages }: RichTextToolbarProps) {
  const contextPages = usePageLinkPages();
  const linkPages = pages ?? contextPages;
  const fontSizeListId = useId();
  const [fontSizeDraft, setFontSizeDraft] = useState("");
  const [customColor, setCustomColor] = useState("#0f172a");
  const setImage = () => {
    const url = window.prompt("Enter the image URL");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  const buttonClass = compact
    ? "rounded-full px-2.5 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100"
    : "rounded-full px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100";
  const selectClass = compact
    ? "rounded-full border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none transition hover:bg-slate-50"
    : "rounded-full border border-stone-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition hover:bg-slate-50";
  const inputClass = compact
    ? "w-16 rounded-full border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none transition hover:bg-slate-50"
    : "w-20 rounded-full border border-stone-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition hover:bg-slate-50";

  const runForTextTarget = (command: (chain: ChainedCommands) => ChainedCommands) => {
    if (!editor) return;
    const { empty, from } = editor.state.selection;
    const chain = empty ? editor.chain().focus().selectAll() : editor.chain().focus();
    command(chain).run();
    if (empty) {
      window.requestAnimationFrame(() => {
        const position = Math.min(from, editor.state.doc.content.size);
        editor.commands.setTextSelection(position);
      });
    }
  };

  const addLink = () => {
    const url = window.prompt("Enter the link URL");
    if (url) {
      runForTextTarget((chain) => chain.extendMarkRange("link").setLink({ href: url }));
    }
  };

  const addInternalLink = (pageId: string) => {
    if (!pageId) return;
    runForTextTarget((chain) => chain.extendMarkRange("link").setLink({ href: `#oc-page:${pageId}` }));
  };

  const applyFontSize = (value: string) => {
    const normalized = normalizePointSize(value);
    if (!normalized) return;
    runForTextTarget((chain) => chain.setFontSize(`${normalized}pt`));
    setFontSizeDraft(normalized);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "p-2" : "border-b border-stone-200 bg-stone-50 p-3"}`}>
      <button
        type="button"
        title="Bold"
        onClick={() => runForTextTarget((chain) => chain.toggleBold())}
        className={`${buttonClass} font-semibold`}
      >
        B
      </button>
      <button
        type="button"
        title="Italic"
        onClick={() => runForTextTarget((chain) => chain.toggleItalic())}
        className={`${buttonClass} italic`}
      >
        I
      </button>
      <button
        type="button"
        title="Underline"
        onClick={() => runForTextTarget((chain) => chain.toggleUnderline())}
        className={`${buttonClass} underline`}
      >
        U
      </button>
      <button
        type="button"
        title="Heading 1"
        onClick={() => runForTextTarget((chain) => chain.toggleHeading({ level: 1 }))}
        className={buttonClass}
      >
        H1
      </button>
      <button
        type="button"
        title="Heading 2"
        onClick={() => runForTextTarget((chain) => chain.toggleHeading({ level: 2 }))}
        className={buttonClass}
      >
        H2
      </button>
      <button
        type="button"
        title="Heading 3"
        onClick={() => runForTextTarget((chain) => chain.toggleHeading({ level: 3 }))}
        className={buttonClass}
      >
        H3
      </button>
      <select
        value=""
        title="Font size presets"
        onChange={(event) => {
          const size = event.target.value;
          if (size) {
            applyFontSize(size);
            event.target.value = "";
          }
        }}
        className={selectClass}
      >
        <option value="">Size</option>
        {fontSizes.map((size) => (
          <option key={size} value={size}>
            {size} pt
          </option>
        ))}
      </select>
      <input
        type="number"
        list={fontSizeListId}
        min={4}
        max={36}
        step={1}
        value={fontSizeDraft}
        placeholder="pt"
        title="Type font size from 4 to 36 pt"
        onChange={(event) => setFontSizeDraft(event.target.value)}
        onBlur={(event) => applyFontSize(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            applyFontSize(event.currentTarget.value);
            event.currentTarget.blur();
          }
        }}
        className={inputClass}
      />
      <datalist id={fontSizeListId}>
        {fontSizes.map((size) => (
          <option key={size} value={size} />
        ))}
      </datalist>
      <select
        value=""
        title="Font family"
        onChange={(event) => {
          const family = event.target.value;
          if (family === "clear") {
            runForTextTarget((chain) => chain.unsetFontFamily());
          } else if (family) {
            runForTextTarget((chain) => chain.setFontFamily(family));
          }
          event.target.value = "";
        }}
        className={selectClass}
      >
        <option value="">Font</option>
        {fontFamilies.map((font) => (
          <option key={font.label} value={font.value}>
            {font.label}
          </option>
        ))}
        <option value="clear">Reset font</option>
      </select>
      <select
        value=""
        title="Line spacing"
        onChange={(event) => {
          const spacing = event.target.value;
          if (spacing.startsWith("line:")) {
            runForTextTarget((chain) => chain.setLineSpacing(spacing.replace("line:", "")));
          } else if (spacing === "paragraph:before") {
            runForTextTarget((chain) => chain.setParagraphSpacing("before"));
          } else if (spacing === "paragraph:after") {
            runForTextTarget((chain) => chain.setParagraphSpacing("after"));
          } else if (spacing === "paragraph:clear") {
            runForTextTarget((chain) => chain.unsetParagraphSpacing());
          }
          event.target.value = "";
        }}
        className={selectClass}
      >
        <option value="">Spacing</option>
        {lineSpacings.map((spacing) => (
          <option key={spacing.value} value={spacing.value}>
            {spacing.label}
          </option>
        ))}
        <option value="clear">Reset spacing</option>
      </select>
      <select
        value=""
        title="Text alignment"
        onChange={(event) => {
          const align = event.target.value as "left" | "center" | "right" | "justify";
          if (align) {
            runForTextTarget((chain) => chain.setTextAlign(align));
            event.target.value = "";
          }
        }}
        className={selectClass}
      >
        <option value="">Align</option>
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
        <option value="justify">Justify</option>
      </select>
      <select
        value=""
        title="Link"
        onChange={(event) => {
          const value = event.target.value;
          if (value === "external") {
            addLink();
          } else if (value === "clear") {
            runForTextTarget((chain) => chain.extendMarkRange("link").unsetLink());
          } else if (value.startsWith("page:")) {
            addInternalLink(value.replace("page:", ""));
          }
          event.target.value = "";
        }}
        className={selectClass}
      >
        <option value="">Link</option>
        <option value="external">Web address</option>
        {linkPages.map((page) => (
          <option key={page.id} value={`page:${page.id}`}>
            {page.title}
            {page.showInNavigation ? "" : " (hidden)"}
          </option>
        ))}
        <option value="clear">Remove link</option>
      </select>
      <button
        type="button"
        title="Bullet list"
        onClick={() => runForTextTarget((chain) => chain.toggleBulletList())}
        className={buttonClass}
      >
        List
      </button>
      <button
        type="button"
        title="Numbered list"
        onClick={() => runForTextTarget((chain) => chain.toggleOrderedList())}
        className={buttonClass}
      >
        1.
      </button>
      {allowImages ? (
        <button type="button" title="Image" onClick={setImage} className={buttonClass}>
          Img
        </button>
      ) : null}
      <div className="flex items-center gap-1 rounded-full border border-stone-200 bg-white px-2 py-1.5">
        <span className="text-xs font-semibold text-slate-500">Color</span>
        {colorChoices.map((color) => (
          <button
            key={color.value}
            type="button"
            title={color.label}
            onClick={() => {
              setCustomColor(color.value);
              runForTextTarget((chain) => chain.setColor(color.value));
            }}
            className="h-5 w-5 rounded-full border border-stone-300 shadow-sm transition hover:scale-110"
            style={{ backgroundColor: color.value }}
          />
        ))}
        <label className="relative inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-stone-300 bg-white shadow-sm" title="Choose custom color">
          <span className="h-4 w-4 rounded-full" style={{ backgroundColor: customColor }} />
          <input
            type="color"
            value={customColor}
            onChange={(event) => {
              setCustomColor(event.target.value);
              runForTextTarget((chain) => chain.setColor(event.target.value));
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Choose custom text color"
          />
        </label>
      </div>
    </div>
  );
}

export default function RichTextEditor({ value, onChange, placeholder, pages = [] }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: richTextExtensions,
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-text-content max-w-full focus:outline-none",
        "aria-label": placeholder ?? "Rich text editor",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-white shadow-sm">
      <RichTextToolbar editor={editor} pages={pages} />

      <div className="min-h-[220px] p-4 focus-within:outline-none">
        {editor ? <EditorContent editor={editor} /> : null}
      </div>
    </div>
  );
}
