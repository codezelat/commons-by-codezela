import Image, { type ImageProps } from "next/image";
import { normalizeLocalUploadUrl } from "@/lib/local-upload";

type ManagedImageProps = Omit<ImageProps, "alt"> & { alt: string };

function getImageSrc(src: ManagedImageProps["src"]) {
  if (typeof src === "string") {
    return src;
  }

  if ("src" in src && typeof src.src === "string") {
    return src.src;
  }

  if ("default" in src && typeof src.default?.src === "string") {
    return src.default.src;
  }

  return "";
}

function shouldBypassOptimization(src: string) {
  return (
    src.startsWith("/api/uploads/") ||
    src.startsWith("/uploads/") ||
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.endsWith(".svg") ||
    src.includes(".svg?")
  );
}

export function ManagedImage({ alt, ...props }: ManagedImageProps) {
  const normalizedSrc =
    typeof props.src === "string"
      ? normalizeLocalUploadUrl(props.src)
      : props.src;
  const src = getImageSrc(normalizedSrc);

  return (
    <Image
      {...props}
      src={normalizedSrc}
      alt={alt}
      unoptimized={props.unoptimized || shouldBypassOptimization(src)}
    />
  );
}
