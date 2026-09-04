"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/layout";
import { Switch } from "@/components/ui/forms";
import { useOpsStore } from "@/stores/ops-store";

export default function HomepagePage() {
  const sections = useOpsStore((s) => s.homepage);
  const toggle = useOpsStore((s) => s.toggleSection);
  const reorder = useOpsStore((s) => s.reorderHomepage);
  const [selected, setSelected] = useState(sections[0]?.id);

  function move(index: number, dir: -1 | 1) {
    const ids = sections.map((s) => s.id);
    const next = index + dir;
    if (next < 0 || next >= ids.length) return;
    [ids[index], ids[next]] = [ids[next], ids[index]];
    reorder(ids);
  }

  const current = sections.find((s) => s.id === selected) ?? sections[0];

  return (
    <div>
      <PageHeader
        title="Homepage"
        description="What the public site actually shows — order, visibility, and a live-ish preview."
        crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Homepage" }]}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-2">
          {sections.map((s, i) => (
            <Card key={s.id} className={`flex flex-wrap items-center gap-3 p-3 ${selected === s.id ? "ring-1 ring-primary" : ""}`}>
              <button className="text-muted-foreground" aria-label="Reorder" onClick={() => move(i, -1)}>
                <GripVertical className="size-4" />
              </button>
              <button className="min-w-0 flex-1 basis-40 text-left" onClick={() => setSelected(s.id)}>
                <p className="font-medium">{s.title}</p>
                <p className="truncate text-xs text-muted-foreground">{s.meta}</p>
              </button>
              <div className="ml-auto flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => move(i, -1)}>Up</Button>
                <Button size="sm" variant="ghost" onClick={() => move(i, 1)}>Down</Button>
                <Switch checked={s.visible} onCheckedChange={() => toggle(s.id)} />
              </div>
            </Card>
          ))}
        </div>
        <Card className="overflow-hidden self-start">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm font-medium">Preview</p>
            {current.visible ? <Eye className="size-4" /> : <EyeOff className="size-4 text-muted-foreground" />}
          </div>
          {current ? (
            <>
              <img src={current.preview} alt="" className="h-56 w-full object-cover" />
              <div className="p-4">
                <p className="font-display text-2xl">{current.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{current.meta}</p>
                <p className="mt-3 text-sm">{current.visible ? "Live on the storefront." : "Hidden — the shop will skip this block."}</p>
                <Button className="mt-3" variant="outline" onClick={() => toast.message("Section editor is simulated in this demo")}>Edit section</Button>
              </div>
            </>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
