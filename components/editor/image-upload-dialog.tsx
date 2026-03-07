"use client";

import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  uploadImage,
  validateImageFile,
  formatFileSize,
  UploadError,
} from "@/lib/upload";
import {
  ImagePlus,
  Upload,
  Link2,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  FileImage,
} from "lucide-react";

type Tab = "upload" | "url";

interface ImageUploadDialogProps {
  /** Called with the final image URL on success */
  onInsert: (url: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageUploadDialog({
  onInsert,
  open,
  onOpenChange,
}: ImageUploadDialogProps) {
  const [tab, setTab] = useState<Tab>("upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTab("upload");
    setUploading(false);
    setError(null);
    setPreview(null);
    setSelectedFile(null);
    setUrlValue("");
    setDragOver(false);
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) reset();
  }

  function handleFileSelect(file: File) {
    setError(null);
    try {
      validateImageFile(file);
    } catch (e) {
      if (e instanceof UploadError) setError(e.message);
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      const result = await uploadImage(selectedFile);
      onInsert(result.url);
      handleOpenChange(false);
    } catch (e) {
      setError(e instanceof UploadError ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleUrlInsert() {
    const url = urlValue.trim();
    if (!url) {
      setError("Please enter a URL");
      return;
    }
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }
    onInsert(url);
    handleOpenChange(false);
  }

  function clearFile() {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>
            Upload an image or paste a URL to insert into your article.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setTab("upload");
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "upload"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("url");
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "url"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Link2 className="h-3.5 w-3.5" />
            URL
          </button>
        </div>

        {/* Upload tab */}
        {tab === "upload" && (
          <div className="space-y-3">
            {!selectedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors ${
                  dragOver
                    ? "border-blue-400 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`rounded-full p-3 ${dragOver ? "bg-blue-100" : "bg-slate-100"}`}
                >
                  <ImagePlus
                    className={`h-6 w-6 ${dragOver ? "text-blue-500" : "text-slate-400"}`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">
                    {dragOver
                      ? "Drop image here"
                      : "Drag & drop an image, or click to browse"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    JPEG, PNG, WebP, GIF, SVG — Max 5 MB
                  </p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  className="hidden"
                  onChange={handleInputChange}
                />
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                {/* Preview */}
                <div className="relative bg-slate-50">
                  {preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-h-48 object-contain"
                    />
                  )}
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* File info */}
                <div className="flex items-center gap-2 px-3 py-2 border-t bg-white">
                  <FileImage className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700 truncate flex-1">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-slate-400 shrink-0">
                    {formatFileSize(selectedFile.size)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* URL tab */}
        {tab === "url" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="image-url" className="text-sm">
                Image URL
              </Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={urlValue}
                onChange={(e) => {
                  setUrlValue(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleUrlInsert()}
                className="h-9 text-sm"
              />
            </div>
            {urlValue.trim() && (
              <div className="rounded-lg border overflow-hidden bg-slate-50">
                <img
                  src={urlValue.trim()}
                  alt="Preview"
                  className="w-full max-h-48 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.display = "block";
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Cancel
          </DialogClose>
          {tab === "upload" ? (
            <Button
              size="sm"
              disabled={!selectedFile || uploading}
              onClick={handleUpload}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Insert Image
                </>
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={!urlValue.trim()}
              onClick={handleUrlInsert}
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Insert Image
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
