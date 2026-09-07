"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/layout";
import { useOpsStore } from "@/stores/ops-store";

export default function ContentPage() {
  const pages = useOpsStore((s) => s.pages);
  const save = useOpsStore((s) => s.savePage);
  const [id, setId] = useState(pages[0]?.id);
  const current = pages.find((p) => p.id === id);
  const [body, setBody] = useState(current?.body ?? "");
  const [title, setTitle] = useState(current?.title ?? "");

  function select(next: string) {
    const page = pages.find((p) => p.id === next);
    setId(next);
    setBody(page?.body ?? "");
    setTitle(page?.title ?? "");
  }

  return (
    <div>
      <PageHeader title="Content" description="About, policies, journal, and lookbook — edited here, published to the shop." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Content" }]} />
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className="grid gap-2 self-start">
          {pages.map((p) => (
            <button key={p.id} onClick={() => select(p.id)} className={`rounded-lg border px-3 py-2 text-left text-sm ${p.id === id ? "bg-card ring-1 ring-primary" : "bg-transparent"}`}>
              <p className="font-medium">{p.title}</p>
              <p className="text-[11px] text-muted-foreground">{p.type}</p>
            </button>
          ))}
        </div>
        {current ? (
          <Card className="grid gap-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge value={current.status} />
              <span className="text-xs text-muted-foreground">/{current.slug}</span>
            </div>
            <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="Body">
              <Textarea className="min-h-64 font-sans" value={body} onChange={(e) => setBody(e.target.value)} />
            </Field>
            <Button onClick={async () => {
              await save({ ...current, title, body });
              toast.success("Page saved");
            }}>Save</Button>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
