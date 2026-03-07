"use client";

import { useState, useCallback, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  uploadImage,
  validateImageFile,
  formatFileSize,
  UploadError,
} from "@/lib/upload";
import {
  ImagePlus,
  Loader2,
  Trash2,
  XCircle,
  RefreshCw,
} from "lucide-react";

interface CoverImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export function CoverImageUploader({
  value,
  onChange,
}: CoverImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    try {
      validateImageFile(file);
    } catch (e) {
      if (e instanceof UploadError) setError(e.message);
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImage(file);
      onChange(result.url);
    } catch (e) {
      setError(e instanceof UploadError ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function removeCover() {
    onChange("");
    setError(null);
  }

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <Label className="text-sm font-medium text-slate-700">Cover Image</Label>

      {value ? (
        /* Has cover image — show preview + actions */
        <div className="space-y-2">
          <div className="relative group aspect-video overflow-hidden rounded-md border bg-slate-50">
            <img
              src={value}
              alt="Cover preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {/* Overlay actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 group-hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 text-xs"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1 h-3 w-3" />
                )}
                Replace
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-8 text-xs"
                onClick={removeCover}
                disabled={uploading}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* No cover image — show drop zone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
              <p className="text-xs text-slate-500">Uploading…</p>
            </>
          ) : (
            <>
              <div
                className={`rounded-full p-2 ${dragOver ? "bg-blue-100" : "bg-slate-100"}`}
              >
                <ImagePlus
                  className={`h-5 w-5 ${dragOver ? "text-blue-500" : "text-slate-400"}`}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-slate-600">
                  {dragOver ? "Drop image here" : "Click or drag to upload"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  JPEG, PNG, WebP, GIF — Max 5 MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1.5 text-xs text-red-600">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
