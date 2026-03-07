"use client";

import { useEditor, EditorContent } from "@tiptap/react";
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
import { useCallback, useRef } from "react";
import { EditorToolbar } from "./editor-toolbar";
import { uploadImage, UploadError } from "@/lib/upload";
import { toast } from "sonner";

const lowlight = createLowlight(common);

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
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full mx-auto block my-4",
        },
        allowBase64: true,
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
              // Insert a placeholder while uploading
              const placeholderSrc =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23f1f5f9' width='400' height='200' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='system-ui' font-size='14'%3EUploading…%3C/text%3E%3C/svg%3E";
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

              const placeholderSrc =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23f1f5f9' width='400' height='200' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='system-ui' font-size='14'%3EUploading…%3C/text%3E%3C/svg%3E";
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
                }
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
      <EditorContent editor={editor} />
    </div>
  );
}
