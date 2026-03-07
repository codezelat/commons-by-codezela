"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  uploadImage,
  validateImageFile,
  UploadError,
} from "@/lib/upload";
import {
  ImagePlus,
  Loader2,
  Trash2,
  XCircle,
  RefreshCw,
} from "lucide-react";

interface ArticleImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  previewUrl?: string;
  description?: string;
  emptyLabel?: string;
  emptyHint?: string;
  fallbackHint?: string;
  aspectClassName?: string;
}

function isAbsoluteHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function ImagePreview({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  if (isAbsoluteHttpUrl(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 320px"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 1024px) 100vw, 320px"
    />
  );
}

export function ArticleImageUploader({
  label,
  value,
  onChange,
  previewUrl,
  description,
  emptyLabel = "Click or drag to upload",
  emptyHint = "JPEG, PNG, WebP, GIF, SVG — Max 5 MB",
  fallbackHint,
  aspectClassName = "aspect-video",
}: ArticleImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const activePreview = previewUrl || value;
  const hasCustomImage = Boolean(value);

  async function handleFile(file: File) {
    setError(null);
    try {
      validateImageFile(file);
    } catch (e) {
      if (e instanceof UploadError) {
        setError(e.message);
      }
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
    if (file) {
      void handleFile(file);
    }
    e.target.value = "";
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      void handleFile(file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function removeImage() {
    onChange("");
    setError(null);
  }

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <div className="space-y-1">
        <Label className="text-sm font-medium text-slate-700">{label}</Label>
        {description ? (
          <p className="text-xs leading-5 text-slate-500">{description}</p>
        ) : null}
      </div>

      {activePreview ? (
        <div className="space-y-3">
          <div className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 ${aspectClassName}`}>
            <ImagePreview src={activePreview} alt={`${label} preview`} />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/35 via-slate-950/0 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3">
              <div className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-700 backdrop-blur">
                {hasCustomImage ? "Custom image" : "Preview fallback"}
              </div>
              <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
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
                  {hasCustomImage ? "Replace" : "Upload custom"}
                </Button>
                {hasCustomImage ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={removeImage}
                    disabled={uploading}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {fallbackHint && !hasCustomImage ? (
            <p className="text-xs leading-5 text-slate-500">{fallbackHint}</p>
          ) : null}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
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
                  {dragOver ? "Drop image here" : emptyLabel}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">{emptyHint}</p>
              </div>
            </>
          )}
        </div>
      )}

      {error ? (
        <div className="flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1.5 text-xs text-red-600">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      ) : null}

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

interface CoverImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export function CoverImageUploader({
  value,
  onChange,
}: CoverImageUploaderProps) {
  return (
    <ArticleImageUploader
      label="Cover image"
      value={value}
      onChange={onChange}
      description="Primary article image for the page header and article cards."
      emptyHint="JPEG, PNG, WebP, GIF, SVG — Max 5 MB"
      aspectClassName="aspect-[16/9]"
    />
  );
}
