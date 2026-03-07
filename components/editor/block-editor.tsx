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
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileCode2,
  FileUp,
  PenBox,
  Trash2,
} from "lucide-react";
import { EditorToolbar } from "./editor-toolbar";
import { MarkdownPreview } from "./markdown-preview";
import { uploadImage, UploadError } from "@/lib/upload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  createMarkdownArticleContent,
  isMarkdownArticleContent,
  type MarkdownArticleContent,
} from "@/lib/editor-content";
import {
  detectMarkdownBaseUrl,
  extractPlainTextFromHtml,
  renderMarkdownToHtmlWithBase,
} from "@/lib/markdown";
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
  initialContent?: Record<string, unknown> | string | MarkdownArticleContent;
  onChange?: (data: { json: unknown; html: string; text: string }) => void;
}

function hasRichContent(editor: Editor) {
  return !(editor.isEmpty && editor.getText().trim().length === 0);
}

function buildMarkdownPayloadWithBase(
  markdown: string,
  baseUrl?: string | null,
) {
  const html = renderMarkdownToHtmlWithBase(markdown, baseUrl);

  return {
    json: createMarkdownArticleContent(markdown, baseUrl),
    html,
    text: extractPlainTextFromHtml(html),
  };
}

function getInitialEditorMode(
  initialContent?: Record<string, unknown> | string | MarkdownArticleContent,
) {
  return isMarkdownArticleContent(initialContent) ? "markdown" : "rich";
}

function getInitialMarkdown(
  initialContent?: Record<string, unknown> | string | MarkdownArticleContent,
) {
  return isMarkdownArticleContent(initialContent) ? initialContent.markdown : "";
}

function getInitialMarkdownBaseUrl(
  initialContent?: Record<string, unknown> | string | MarkdownArticleContent,
) {
  return isMarkdownArticleContent(initialContent)
    ? initialContent.baseUrl || detectMarkdownBaseUrl(initialContent.markdown)
    : null;
}

function getRichInitialContent(
  initialContent?: Record<string, unknown> | string | MarkdownArticleContent,
) {
  if (isMarkdownArticleContent(initialContent)) {
    return initialContent.markdown;
  }

  return (
    initialContent || {
      type: "doc",
      content: [{ type: "paragraph" }],
    }
  );
}

export function BlockEditor({ initialContent, onChange }: BlockEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editorMode, setEditorMode] = useState<"rich" | "markdown">(
    getInitialEditorMode(initialContent),
  );
  const [markdownView, setMarkdownView] = useState<"write" | "preview">(
    getInitialEditorMode(initialContent) === "markdown" ? "preview" : "write",
  );
  const [markdownSource, setMarkdownSource] = useState(
    getInitialMarkdown(initialContent),
  );
  const [markdownBaseUrl, setMarkdownBaseUrl] = useState<string>(
    getInitialMarkdownBaseUrl(initialContent) || "",
  );
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [pendingModeSwitch, setPendingModeSwitch] = useState<
    "rich" | "markdown" | null
  >(null);
  const [modeSwitchDialogOpen, setModeSwitchDialogOpen] = useState(false);
  const modeRef = useRef(editorMode);
  modeRef.current = editorMode;

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
    content: getRichInitialContent(initialContent),
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none px-6 py-4 min-h-[460px] focus:outline-none prose-headings:font-display prose-headings:font-semibold prose-headings:tracking-tight prose-h1:mb-4 prose-h1:text-4xl prose-h2:mb-3 prose-h2:text-3xl prose-h3:mb-3 prose-h3:text-2xl prose-h4:mb-2 prose-h4:text-xl prose-p:text-[1rem] prose-p:leading-7 prose-li:leading-7 prose-strong:text-slate-950 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-700 prose-blockquote:border-l-slate-300 prose-blockquote:text-slate-700 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.92em] prose-code:before:hidden prose-code:after:hidden prose-pre:bg-transparent prose-pre:p-0 prose-img:rounded-xl prose-table:table prose-table:w-full prose-th:border prose-th:border-slate-200 prose-th:bg-slate-50 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-slate-200 prose-td:px-3 prose-td:py-2 [&_h1]:mt-0 [&_h1]:mb-4 [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-slate-950 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-slate-950 [&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:text-slate-950 [&_p]:my-4 [&_p]:text-base [&_p]:leading-7 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_li]:leading-7 [&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-700 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.92em] [&_pre]:my-6 [&_pre]:overflow-x-auto [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2",
      },
      handleClickOn(view, _pos, node, nodePos, event, direct) {
        if (!direct || node.type.name !== "image") {
          return false;
        }

        event.preventDefault();
        const selection = NodeSelection.create(view.state.doc, nodePos);
        view.dispatch(
          view.state.tr
            .setSelection(selection)
            .setMeta("bubbleMenu", "updatePosition"),
        );
        view.focus();
        return true;
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
    onCreate: ({ editor }) => {
      if (modeRef.current === "rich") {
        emitEditorState(editor);
      }
    },
    onUpdate: ({ editor }) => {
      if (modeRef.current === "rich") {
        emitEditorState(editor);
      }
    },
    immediatelyRender: false,
  });

  const importMarkdownFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onerror = () => {
        toast.error("Could not read the Markdown file");
      };
      reader.onload = (ev) => {
        const text = (ev.target?.result as string | null) ?? "";
        const markdown = text.replace(/\r\n/g, "\n");

        if (!markdown.trim()) {
          toast.error("The selected Markdown file is empty");
          return;
        }

        setMarkdownSource(markdown);
        setMarkdownView("preview");
        setMarkdownBaseUrl(detectMarkdownBaseUrl(markdown) || "");
        setEditorMode("markdown");
        toast.success(`Imported ${file.name}`);
      };
      reader.readAsText(file);
    },
    [],
  );

  const handleFileUpload = useCallback(
    (file: File | null) => {
      if (!file || !editor) {
        return;
      }

      const isEmptyDocument =
        editorMode === "markdown"
          ? markdownSource.trim().length === 0
          : editor.isEmpty && editor.getText().trim().length === 0;

      if (isEmptyDocument) {
        importMarkdownFile(file);
        return;
      }

      setPendingImportFile(file);
      setImportDialogOpen(true);
    },
    [editor, editorMode, importMarkdownFile, markdownSource],
  );

  function confirmImport() {
    if (!pendingImportFile) {
      return;
    }

    importMarkdownFile(pendingImportFile);
    setImportDialogOpen(false);
    setPendingImportFile(null);
  }

  function openMarkdownPicker() {
    fileInputRef.current?.click();
  }

  function handleMarkdownFileSelection(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    handleFileUpload(event.target.files?.[0] ?? null);
    event.target.value = "";
  }

  function switchToMarkdownMode() {
    if (!editor || editorMode === "markdown") {
      return;
    }

    const markdownStorage = editor.storage as {
      markdown?: { getMarkdown?: () => string };
    };
    const markdown =
      markdownStorage.markdown?.getMarkdown?.() ?? "";

    setMarkdownSource(markdown);
    setMarkdownBaseUrl(
      detectMarkdownBaseUrl(markdown) || markdownBaseUrl || "",
    );
    setMarkdownView("preview");
    setEditorMode("markdown");
  }

  function switchToRichMode() {
    if (!editor || editorMode === "rich") {
      return;
    }

    if (markdownSource.trim()) {
      editor.commands.setContent(markdownSource);
    } else {
      editor.commands.clearContent();
    }

    setEditorMode("rich");
    toast.info("Switched to rich mode. Advanced Markdown may be simplified.");
  }

  function requestModeSwitch(targetMode: "rich" | "markdown") {
    if (targetMode === editorMode || !editor) {
      return;
    }

    const hasContent =
      editorMode === "markdown"
        ? markdownSource.trim().length > 0
        : hasRichContent(editor);

    if (!hasContent) {
      if (targetMode === "markdown") {
        switchToMarkdownMode();
      } else {
        switchToRichMode();
      }
      return;
    }

    setPendingModeSwitch(targetMode);
    setModeSwitchDialogOpen(true);
  }

  function confirmModeSwitch() {
    if (!pendingModeSwitch) {
      return;
    }

    if (pendingModeSwitch === "markdown") {
      switchToMarkdownMode();
    } else {
      switchToRichMode();
    }

    setPendingModeSwitch(null);
    setModeSwitchDialogOpen(false);
  }

  useEffect(() => {
    if (editorMode !== "markdown") {
      return;
    }

    onChangeRef.current?.(
      buildMarkdownPayloadWithBase(markdownSource, markdownBaseUrl),
    );
  }, [editorMode, markdownBaseUrl, markdownSource]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[460px] text-sm text-slate-400">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50/80 px-3 py-2">
        <div className="flex items-center gap-2">
          <Tabs
            value={editorMode}
            onValueChange={(value) => {
              if (value === "markdown" || value === "rich") {
                requestModeSwitch(value);
              }
            }}
          >
            <TabsList>
              <TabsTrigger value="rich">
                <PenBox />
                Rich editor
              </TabsTrigger>
              <TabsTrigger value="markdown">
                <FileCode2 />
                Markdown
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <span className="hidden text-xs text-slate-500 lg:inline">
            Markdown mode preserves raw source, HTML blocks, mermaid fences, and images.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-full"
            onClick={openMarkdownPicker}
          >
            <FileUp data-icon="inline-start" />
            Import Markdown
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown"
            className="hidden"
            onChange={handleMarkdownFileSelection}
          />
        </div>
      </div>
      <AlertDialog
        open={importDialogOpen}
        onOpenChange={(open) => {
          setImportDialogOpen(open);
          if (!open) {
            setPendingImportFile(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace article body?</AlertDialogTitle>
            <AlertDialogDescription>
              Importing
              {pendingImportFile ? ` "${pendingImportFile.name}"` : " this file"}
              {" "}will replace the current editor content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>
              Import Markdown
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={modeSwitchDialogOpen}
        onOpenChange={(open) => {
          setModeSwitchDialogOpen(open);
          if (!open) {
            setPendingModeSwitch(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch editor mode?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingModeSwitch === "markdown"
                ? "This will convert the current rich content into Markdown source. Complex rich formatting may be rewritten."
                : "This will convert the current Markdown source into the rich editor. Advanced Markdown, raw HTML, or Mermaid content may be simplified."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep current mode</AlertDialogCancel>
            <AlertDialogAction onClick={confirmModeSwitch}>
              Switch mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editorMode === "rich" ? (
        <>
          <EditorToolbar editor={editor} />

          {/* Floating toolbar that appears when an image node is selected */}
          <BubbleMenu
            editor={editor}
            updateDelay={0}
            shouldShow={({ state }) =>
              state.selection instanceof NodeSelection &&
              state.selection.node.type.name === "image"
            }
            options={{ placement: "top" }}
          >
            <div className="flex items-center gap-px rounded-xl border bg-background shadow-lg ring-1 ring-black/5 p-1">
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
                      className={`flex h-9 w-9 flex-col items-center justify-center gap-0.5 rounded-lg transition-colors ${
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

              <div className="mx-1 h-6 w-px shrink-0 bg-border" />

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
                      className={`flex h-9 w-9 flex-col items-center justify-center gap-0.5 rounded-lg transition-colors ${
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

              <div className="mx-1 h-6 w-px shrink-0 bg-border" />

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().deleteSelection().run();
                }}
                title="Delete image"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </BubbleMenu>

          <EditorContent editor={editor} />
        </>
      ) : (
        <div className="p-4">
          <Tabs value={markdownView} onValueChange={(value) => {
            if (value === "preview" || value === "write") {
              setMarkdownView(value);
            }
          }}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Markdown source mode
                </p>
                <p className="text-xs text-muted-foreground">
                  Source is preserved exactly. Use preview to inspect HTML, images, and mermaid blocks.
                </p>
              </div>
              <TabsList>
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="write">
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Preview Base URL
                  </p>
                  <Input
                    type="url"
                    value={markdownBaseUrl}
                    onChange={(event) => setMarkdownBaseUrl(event.target.value)}
                    placeholder="https://docs.github.com"
                    className="bg-white"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Used to resolve root-relative and relative Markdown links or images during preview and save.
                  </p>
                </div>
                <Textarea
                  value={markdownSource}
                  onChange={(event) => setMarkdownSource(event.target.value)}
                  placeholder="# Write Markdown here"
                  className="min-h-[520px] resize-y border-slate-200 bg-slate-950 px-4 py-4 font-mono text-sm leading-7 text-slate-100 placeholder:text-slate-500"
                />
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <div className="min-h-[520px] rounded-xl border border-slate-200 bg-white p-6">
                <MarkdownPreview
                  markdown={markdownSource}
                  baseUrl={markdownBaseUrl}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
