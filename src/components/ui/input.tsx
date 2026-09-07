"use client";

import type { ComponentProps, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm shadow-none outline-none transition placeholder:text-muted-foreground focus-visible:border-ring disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/** Number field that allows clearing (empty) while typing — unlike raw Number("") → 0. */
export function NumberInput({
  value,
  onValueChange,
  className,
  ...props
}: Omit<ComponentProps<"input">, "type" | "value" | "onChange"> & {
  value: number;
  onValueChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(() => String(value ?? 0));
  const committed = useRef(value);

  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setDraft(String(value ?? 0));
    }
  }, [value]);

  return (
    <input
      type="number"
      inputMode="decimal"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm shadow-none outline-none transition placeholder:text-muted-foreground focus-visible:border-ring disabled:opacity-50",
        className,
      )}
      value={draft}
      onChange={(e) => {
        const raw = e.target.value;
        setDraft(raw);
        if (raw.trim() === "") return;
        const n = Number(raw);
        if (!Number.isNaN(n)) {
          committed.current = n;
          onValueChange(n);
        }
      }}
      onBlur={() => {
        if (draft.trim() === "" || Number.isNaN(Number(draft))) {
          committed.current = 0;
          setDraft("0");
          onValueChange(0);
          return;
        }
        const n = Number(draft);
        committed.current = n;
        setDraft(String(n));
        onValueChange(n);
      }}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium text-foreground", className)} {...props} />;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
