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
          class: "rounded-lg bg-slate-900 text-slate-50 p-4 my-3 overflow-x-auto text-sm font-mono",
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
        HTMLAttributes: { class: "border border-slate-200 p-2 bg-slate-50 font-semibold" },
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
        class: "prose prose-slate max-w-none px-6 py-4 min-h-[460px] focus:outline-none",
      },
      handleDrop(view, event, slice, moved) {
        // Handle image file drop
        if (!moved && event.dataTransfer?.files?.length) {
          const files = Array.from(event.dataTransfer.files).filter((f) =>
            f.type.startsWith("image/")
          );
          if (files.length > 0) {
            event.preventDefault();
            files.forEach((file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const src = e.target?.result as string;
                if (src) {
                  const { tr } = view.state;
                  const pos = view.posAtCoords({
                    left: event.clientX,
                    top: event.clientY,
                  });
                  if (pos) {
                    const node = view.state.schema.nodes.image.create({ src });
                    const transaction = tr.insert(pos.pos, node);
                    view.dispatch(transaction);
                  }
                }
              };
              reader.readAsDataURL(file);
            });
            return true;
          }
        }
        return false;
      },
      handlePaste(view, event) {
        // Handle image paste
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const src = e.target?.result as string;
                  if (src) {
                    const node = view.state.schema.nodes.image.create({ src });
                    const transaction = view.state.tr.replaceSelectionWith(node);
                    view.dispatch(transaction);
                  }
                };
                reader.readAsDataURL(file);
              }
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
    [editor]
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


