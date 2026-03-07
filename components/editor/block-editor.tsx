"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
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
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";
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
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      height: {
        default: null,
      },
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
        parseHTML: (el) =>
          el.style.width || el.getAttribute("data-width") || null,
        renderHTML: (attrs) =>
          attrs.width ? { "data-width": attrs.width } : {},
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const { align = "center", width = null } = node.attrs as {
      align: string;
      width: string | null;
    };

    const rest = { ...HTMLAttributes };
    delete rest["data-align"];
    delete rest["data-width"];
    delete rest.class;
    delete rest.style;

    return [
      "img",
      { ...rest, class: "rounded-lg my-4", style: buildImgStyle(align, width) },
    ];
  },
});

// ────────────────────────────────────────────────────────────────────────────

interface BlockEditorProps {
  initialContent?: Record<string, unknown> | string;
  onChange?: (data: { json: unknown; html: string; text: string }) => void;
}

export function BlockEditor({ initialContent, onChange }: BlockEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  function emitEditorState(editor: Editor) {
    onChangeRef.current?.({
      json: editor.getJSON(),
      html: editor.getHTML(),
      text: editor.getText(),
    });
  }

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
                  view.dispatch(tr);
                } finally {
                  URL.revokeObjectURL(placeholderSrc);
                }
              })();
              return true;
            }
          }
        }
        return false;
      },
    },
    onCreate: ({ editor }) => emitEditorState(editor),
    onUpdate: ({ editor }) => emitEditorState(editor),
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
        options={{ placement: "top" }}
      >
        <div className="flex items-center gap-px rounded-xl border bg-background shadow-lg ring-1 ring-black/5 p-1">
          {/* ── Alignment group ── */}
          <div className="flex items-center gap-px">
            {(
              [
                ["left", AlignLeft, "Left"],
                ["center", AlignCenter, "Center"],
                ["right", AlignRight, "Right"],
              ] as const
            ).map(([a, Icon, label]) => {
              const active = editor.getAttributes("image").align === a;
              return (
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
                  title={`Align ${label}`}
                  className={`flex flex-col items-center justify-center gap-0.5 rounded-lg w-9 h-9 transition-colors ${
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[9px] font-medium leading-none">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* separator */}
          <div className="mx-1 h-6 w-px bg-border shrink-0" />

          {/* ── Width group ── */}
          <div className="flex items-center gap-px">
            {(
              [
                [null, "Full", "100%"],
                ["75%", "¾", "75%"],
                ["50%", "½", "50%"],
                ["25%", "¼", "25%"],
              ] as Array<[string | null, string, string]>
            ).map(([w, glyph, label]) => {
              const active = editor.getAttributes("image").width === w;
              return (
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
                  title={`Width: ${label}`}
                  className={`flex flex-col items-center justify-center gap-0.5 rounded-lg w-9 h-9 transition-colors ${
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span className="text-sm font-semibold leading-none">
                    {glyph}
                  </span>
                  <span className="text-[9px] font-medium leading-none">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* separator */}
          <div className="mx-1 h-6 w-px bg-border shrink-0" />

          {/* ── Delete ── */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().deleteSelection().run();
            }}
            title="Delete image"
            className="flex items-center justify-center rounded-lg w-9 h-9 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} />
    </div>
  );
}
