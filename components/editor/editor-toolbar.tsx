"use client";

import type { Editor } from "@tiptap/react";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link,
  Image,
  Table,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Upload,
  Highlighter,
  Superscript,
  Subscript,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { ImageUploadDialog } from "./image-upload-dialog";

interface EditorToolbarProps {
  editor: Editor;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EditorToolbar({ editor, onFileUpload }: EditorToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  function addLink() {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  }

  function insertImage(url: string, alt?: string) {
    editor
      .chain()
      .focus()
      .setImage({ src: url, alt: alt ?? "" })
      .createParagraphNear()
      .run();
  }

  function insertTable() {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }

  const currentHeading = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
      ? "h2"
      : editor.isActive("heading", { level: 3 })
        ? "h3"
        : editor.isActive("heading", { level: 4 })
          ? "h4"
          : "paragraph";

  function setBlock(value: string) {
    switch (value) {
      case "paragraph":
        editor.chain().focus().setParagraph().run();
        break;
      case "h1":
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case "h2":
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "h3":
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case "h4":
        editor.chain().focus().toggleHeading({ level: 4 }).run();
        break;
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-slate-50/80 px-2 py-1.5 rounded-t-lg">
      {/* Block type selector */}
      <Select value={currentHeading} onValueChange={(v) => v && setBlock(v)}>
        <SelectTrigger className="h-7 w-[120px] border-0 bg-transparent text-xs shadow-none hover:bg-slate-100">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Paragraph</SelectItem>
          <SelectItem value="h1">Heading 1</SelectItem>
          <SelectItem value="h2">Heading 2</SelectItem>
          <SelectItem value="h3">Heading 3</SelectItem>
          <SelectItem value="h4">Heading 4</SelectItem>
        </SelectContent>
      </Select>

      <ToolbarSep />

      {/* Text formatting */}
      <ToolbarButton
        icon={Bold}
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        tooltip="Bold (⌘B)"
      />
      <ToolbarButton
        icon={Italic}
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        tooltip="Italic (⌘I)"
      />
      <ToolbarButton
        icon={Underline}
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        tooltip="Underline (⌘U)"
      />
      <ToolbarButton
        icon={Strikethrough}
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        tooltip="Strikethrough"
      />
      <ToolbarButton
        icon={Highlighter}
        active={editor.isActive("highlight")}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        tooltip="Highlight"
      />
      <ToolbarButton
        icon={Superscript}
        active={editor.isActive("superscript")}
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        tooltip="Superscript"
      />
      <ToolbarButton
        icon={Subscript}
        active={editor.isActive("subscript")}
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        tooltip="Subscript"
      />

      <ToolbarSep />

      {/* Lists */}
      <ToolbarButton
        icon={List}
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        tooltip="Bullet List"
      />
      <ToolbarButton
        icon={ListOrdered}
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        tooltip="Ordered List"
      />

      <ToolbarSep />

      {/* Block elements */}
      <ToolbarButton
        icon={Quote}
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        tooltip="Blockquote"
      />
      <ToolbarButton
        icon={Code}
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        tooltip="Code Block"
      />
      <ToolbarButton
        icon={Minus}
        active={false}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        tooltip="Horizontal Rule"
      />

      <ToolbarSep />

      {/* Alignment */}
      <ToolbarButton
        icon={AlignLeft}
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        tooltip="Align Left"
      />
      <ToolbarButton
        icon={AlignCenter}
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        tooltip="Align Center"
      />
      <ToolbarButton
        icon={AlignRight}
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        tooltip="Align Right"
      />

      <ToolbarSep />

      {/* Insert */}
      <ToolbarButton
        icon={Link}
        active={editor.isActive("link")}
        onClick={addLink}
        tooltip="Insert Link"
      />
      <ToolbarButton
        icon={Image}
        active={false}
        onClick={() => setImageDialogOpen(true)}
        tooltip="Insert Image"
      />
      <ImageUploadDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onInsert={insertImage}
      />
      <ToolbarButton
        icon={Table}
        active={editor.isActive("table")}
        onClick={insertTable}
        tooltip="Insert Table"
      />

      <ToolbarSep />

      {/* Upload .md file */}
      <Tooltip>
        <TooltipTrigger
          className="inline-flex items-center justify-center h-7 w-7 rounded-md border-0 bg-transparent cursor-pointer text-slate-500 hover:bg-slate-100"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
        </TooltipTrigger>
        <TooltipContent side="bottom">Upload .md file</TooltipContent>
      </Tooltip>
      <input
        ref={fileRef}
        type="file"
        accept=".md,.markdown,.txt"
        className="hidden"
        onChange={onFileUpload}
      />

      <div className="ml-auto flex items-center gap-0.5">
        <ToolbarButton
          icon={Undo2}
          active={false}
          onClick={() => editor.chain().focus().undo().run()}
          tooltip="Undo (⌘Z)"
          disabled={!editor.can().undo()}
        />
        <ToolbarButton
          icon={Redo2}
          active={false}
          onClick={() => editor.chain().focus().redo().run()}
          tooltip="Redo (⌘⇧Z)"
          disabled={!editor.can().redo()}
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  active,
  onClick,
  tooltip,
  disabled = false,
}: {
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  tooltip: string;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className={`inline-flex items-center justify-center h-7 w-7 rounded-md border-0 cursor-pointer ${active ? "bg-slate-200 text-slate-900" : "text-slate-500 bg-transparent hover:bg-slate-100"} ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        onClick={onClick}
        disabled={disabled}
      >
        <Icon className="h-3.5 w-3.5" />
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

function ToolbarSep() {
  return <Separator orientation="vertical" className="mx-1 h-5" />;
}
