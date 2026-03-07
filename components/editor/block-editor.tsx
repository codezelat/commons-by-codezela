"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import { Typography } from "@tiptap/extension-typography";
import { Superscript } from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Table as TableExtension } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Markdown } from "tiptap-markdown";
import { common, createLowlight } from "lowlight";
import { NodeSelection } from "@tiptap/pm/state";
import { useCallback, useRef } from "react";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { EditorToolbar } from "./editor-toolbar";
import { uploadImage, UploadError } from "@/lib/upload";
import { toast } from "sonner";

const lowlight = createLowlight(common);

// ── Extended Image node with per-image alignment and width ──────────────────

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect fill="#f1f5f9" width="400" height="200" rx="8"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="14">Uploading\u2026</text></svg>`;

function makePlaceholderSrc() {
  return URL.createObjectURL(
    new Blob([PLACEHOLDER_SVG], { type: "image/svg+xml" }),
  );
}

function buildImgStyle(align: string, width: string | null) {
  const w = width ? `width: ${width}` : "max-width: 100%";
  const pos =
    align === "left"
      ? "float: left; margin: 0 1.5rem 1rem 0"
      : align === "right"
        ? "float: right; margin: 0 0 1rem 1.5rem"
        : "display: block; margin-left: auto; margin-right: auto";
  return `${w}; ${pos}`;
}

const ImageResizable = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (el) => {
          if (el.style.float === "left") return "left";
          if (el.style.float === "right") return "right";
          return el.getAttribute("data-align") ?? "center";
        },
        renderHTML: (attrs) => ({ "data-align": attrs.align }),
      },
      width: {
        default: null,
        parseHTML: (el) => el.style.width || el.getAttribute("data-width") || null,
        renderHTML: (attrs) => (attrs.width ? { "data-width": attrs.width } : {}),
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const { align = "center", width = null } = node.attrs as {
      align: string;
      width: string | null;
    };
    const { "data-align": _a, "data-width": _w, class: _c, style: _s, ...rest } =
      HTMLAttributes;
    return [
      "img",
      { ...rest, class: "rounded-lg my-4", style: buildImgStyle(align, width) },
    ];
  },
});

// ────────────────────────────────────────────────────────────────────────────

interface BlockEditorProps {
  initialContent?: Record<string, unknown>;
  onChange?: (data: { json: unknown; html: string; text: string }) => void;
}

export function BlockEditor({ initialContent, onChange }: BlockEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: false, // use lowlight version
        dropcursor: { color: "#3b82f6", width: 2 },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return `Heading ${node.attrs.level}`;
          }
          return "Start writing, paste Markdown, or type / for commands...";
        },
        showOnlyCurrent: true,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
      }),
      ImageResizable.configure({
        allowBase64: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Superscript,
      Subscript,
      TextStyle,
      Color,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class:
            "rounded-lg bg-slate-900 text-slate-50 p-4 my-3 overflow-x-auto text-sm font-mono",
        },
      }),
      TableExtension.configure({
        resizable: true,
        HTMLAttributes: { class: "border-collapse table-auto w-full my-4" },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: { class: "border border-slate-200 p-2 min-w-[80px]" },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-slate-200 p-2 bg-slate-50 font-semibold",
        },
      }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: initialContent || {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none px-6 py-4 min-h-[460px] focus:outline-none",
      },
      handleDrop(view, event, _slice, moved) {
        if (!moved && event.dataTransfer?.files?.length) {
          const files = Array.from(event.dataTransfer.files).filter((f) =>
            f.type.startsWith("image/"),
          );
          if (files.length > 0) {
            event.preventDefault();
            const dropPos = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            files.forEach(async (file) => {
              // Each file gets its own unique blob URL — prevents placeholder
              // collisions when multiple files are dropped simultaneously.
              const placeholderSrc = makePlaceholderSrc();
              const pos = dropPos?.pos ?? view.state.selection.head;
              const placeholderNode = view.state.schema.nodes.image.create({
                src: placeholderSrc,
              });
              view.dispatch(view.state.tr.insert(pos, placeholderNode));

              try {
                const result = await uploadImage(file);
                // Find the placeholder and replace it
                const { doc, tr } = view.state;
                doc.descendants((node, nodePos) => {
                  if (
                    node.type.name === "image" &&
                    node.attrs.src === placeholderSrc
                  ) {
                    tr.setNodeMarkup(nodePos, undefined, {
                      ...node.attrs,
                      src: result.url,
                    });
                    return false;
                  }
                });
                view.dispatch(tr);
              } catch (err) {
                toast.error(
                  err instanceof UploadError ? err.message : "Upload failed",
                );
                // Remove the placeholder
                const { doc, tr } = view.state;
                doc.descendants((node, nodePos) => {
                  if (
                    node.type.name === "image" &&
                    node.attrs.src === placeholderSrc
                  ) {
                    tr.delete(nodePos, nodePos + node.nodeSize);
                    return false;
                  }
                });
                view.dispatch(tr);
              } finally {
                URL.revokeObjectURL(placeholderSrc);
              }
            });
            return true;
          }
        }
        return false;
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (!file) continue;

              const placeholderSrc = makePlaceholderSrc();
              const node = view.state.schema.nodes.image.create({
                src: placeholderSrc,
              });
              view.dispatch(view.state.tr.replaceSelectionWith(node));

              (async () => {
                try {
                  const result = await uploadImage(file);
                  const { doc, tr } = view.state;
                  doc.descendants((n, nPos) => {
                    if (
                      n.type.name === "image" &&
                      n.attrs.src === placeholderSrc
                    ) {
                      tr.setNodeMarkup(nPos, undefined, {
                        ...n.attrs,
                        src: result.url,
                      });
                      return false;
                    }
                  });
                  view.dispatch(tr);
                } catch (err) {
                  toast.error(
                    err instanceof UploadError ? err.message : "Upload failed",
                  );
                  const { doc, tr } = view.state;
                  doc.descendants((n, nPos) => {
                    if (
                      n.type.name === "image" &&
                      n.attrs.src === placeholderSrc
                    ) {
                      tr.delete(nPos, nPos + n.nodeSize);
                      return false;
                    }
                  });
                  view.dispatch(tr);                } finally {
                  URL.revokeObjectURL(placeholderSrc);                }
              })();
              return true;
            }
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const html = editor.getHTML();
      const text = editor.getText();
      onChangeRef.current?.({ json, html, text });
    },
    immediatelyRender: false,
  });

  // Handle .md file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) {
          // Clear editor and insert markdown content
          editor.commands.setContent("");
          editor.commands.insertContent(text);
        }
      };
      reader.readAsText(file);
      e.target.value = ""; // reset
    },
    [editor],
  );

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[460px] text-sm text-slate-400">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <EditorToolbar editor={editor} onFileUpload={handleFileUpload} />

      {/* Floating toolbar that appears when an image node is selected */}
      <BubbleMenu
        editor={editor}
        shouldShow={({ state }) =>
          state.selection instanceof NodeSelection &&
          state.selection.node.type.name === "image"
        }
        tippyOptions={{ duration: 100, placement: "top" }}
      >
        <div className="flex items-center gap-0.5 rounded-lg border bg-background shadow-md px-1.5 py-1">
          {/* Alignment */}
          {(
            [
              ["left", AlignLeft],
              ["center", AlignCenter],
              ["right", AlignRight],
            ] as const
          ).map(([a, Icon]) => (
            <button
              key={a}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor
                  .chain()
                  .focus()
                  .updateAttributes("image", { align: a })
                  .run();
              }}
              title={`Align ${a}`}
              className={`rounded p-1 transition-colors ${
                editor.getAttributes("image").align === a
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}

          <div className="mx-0.5 h-4 w-px bg-border" />

          {/* Size presets */}
          {(
            [
              ["25%", "\u00bc"],
              ["50%", "\u00bd"],
              ["75%", "\u00be"],
              [null, "Full"],
            ] as Array<[string | null, string]>
          ).map(([w, label]) => (
            <button
              key={label}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor
                  .chain()
                  .focus()
                  .updateAttributes("image", { width: w })
                  .run();
              }}
              title={`${label} width`}
              className={`rounded px-1.5 py-0.5 text-xs font-medium transition-colors ${
                editor.getAttributes("image").width === w
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} />
    </div>
  );
}
