"use client";

import type { ImgHTMLAttributes } from "react";
import { resolveMediaUrl } from "@/lib/media";

/** img wrapper that rewrites /uploads and localhost upload URLs for the configured API host. */
export function MediaImg({
  src,
  alt = "",
  ...props
}: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { src?: string | null }) {
  if (!src) return <div className={props.className} aria-hidden />;
  return <img src={resolveMediaUrl(src)} alt={alt} {...props} />;
}
