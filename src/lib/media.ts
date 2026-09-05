/** Origin of the API host derived from NEXT_PUBLIC_API_URL (…/api → …). */
export function apiOrigin() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
  return base.replace(/\/api\/?$/, "").replace(/\/$/, "");
}

/** Turn relative or localhost upload paths into absolute URLs for the browser. */
export function resolveMediaUrl(src: string) {
  if (!src) return src;
  const origin = apiOrigin();

  const local = src.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/uploads\/.+)$/i);
  if (local) return `${origin}${local[3]}`;

  if (src.startsWith("/uploads/")) return `${origin}${src}`;

  return src;
}
