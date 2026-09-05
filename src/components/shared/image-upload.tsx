"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { ApiError, uploadImage } from "@/services/api/client";
import { cn } from "@/lib/utils";
import { MediaImg } from "@/components/media/media-img";

export function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  async function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Field label={label}>
      <div className="grid gap-2">
        {value ? (
          <div className="relative w-fit">
            <MediaImg src={value} alt="" className="h-24 w-20 rounded-md object-cover" />
            <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => onChange("")}>
              Remove
            </Button>
          </div>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => void onFiles(e.target.files)}
        />
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? "Uploading…" : "Upload image"}
        </Button>
        <div className="flex gap-2">
          <Input
            placeholder="Or paste image URL"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!urlDraft.trim()}
            onClick={() => {
              onChange(urlDraft.trim());
              setUrlDraft("");
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </Field>
  );
}

export function ProductMediaSection({
  images,
  onChange,
  disabled,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [dragging, setDragging] = useState(false);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) {
      toast.error("Choose image files (jpeg, png, webp, gif)");
      return;
    }
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const file of list) {
        urls.push(await uploadImage(file));
      }
      onChange([...images, ...urls]);
      toast.success(urls.length === 1 ? "Image uploaded" : `${urls.length} images uploaded`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function addUrl() {
    const url = urlDraft.trim();
    if (!url) return;
    onChange([...images, url]);
    setUrlDraft("");
  }

  return (
    <div className={cn("grid gap-4", disabled && "pointer-events-none opacity-80")}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => void uploadFiles(e.target.files ?? [])}
      />
      <div
        className={cn(
          "grid cursor-pointer place-items-center rounded-xl border border-dashed py-10 text-sm text-muted-foreground transition-colors",
          dragging && "border-foreground bg-muted/40",
          busy && "opacity-60",
        )}
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void uploadFiles(e.dataTransfer.files);
        }}
      >
        {busy ? "Uploading…" : "Drop images here or click to upload"}
      </div>
      <div className="flex flex-wrap gap-2">
        {images.map((src) => (
          <div key={src} className="relative">
            <MediaImg src={src} alt="" className="h-24 w-20 rounded-md object-cover" />
            <button
              type="button"
              className="absolute right-1 top-1 rounded bg-black/70 px-1.5 text-[10px] text-white"
              onClick={() => onChange(images.filter((u) => u !== src))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Or paste an image URL"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
        />
        <Button type="button" variant="outline" disabled={!urlDraft.trim()} onClick={addUrl}>
          Add URL
        </Button>
      </div>
    </div>
  );
}
