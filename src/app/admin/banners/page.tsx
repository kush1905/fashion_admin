"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ImageUploadField } from "@/components/shared/image-upload";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Card } from "@/components/ui/layout";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/overlay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms";
import { useOpsStore } from "@/stores/ops-store";
import type { Banner, BannerStatus } from "@/types";
import { PRODUCT_IMAGES } from "@/data/products";
import { MediaImg } from "@/components/media/media-img";

export default function BannersPage() {
  const banners = useOpsStore((s) => s.banners);
  const save = useOpsStore((s) => s.saveBanner);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);

  function start(banner?: Banner) {
    setForm(
      banner ?? {
        id: `bn_${Date.now()}`,
        title: "",
        subtitle: "",
        cta: "Shop now",
        destination: "/",
        desktopImage: PRODUCT_IMAGES.ivoryLehenga,
        tabletImage: PRODUCT_IMAGES.goldSaree,
        mobileImage: PRODUCT_IMAGES.redLehenga,
        status: "draft",
        startDate: "2026-09-04",
        endDate: "2026-10-04",
      },
    );
    setOpen(true);
  }

  return (
    <div>
      <PageHeader title="Banners" description="Hero and campaign frames — desktop, tablet, mobile." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Banners" }]} actions={<Button onClick={() => start()}>New banner</Button>} />
      <div className="grid gap-4 lg:grid-cols-2">
        {banners.map((b) => (
          <Card key={b.id} className="overflow-hidden">
            <MediaImg src={b.desktopImage} alt="" className="h-40 w-full object-cover" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl">{b.title}</h2>
                  <p className="text-sm text-muted-foreground">{b.subtitle}</p>
                </div>
                <StatusBadge value={b.status} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{b.startDate} → {b.endDate} · {b.cta}</p>
              <div className="mt-3 flex gap-2">
                <MediaImg src={b.tabletImage} alt="" className="h-16 w-20 rounded object-cover" />
                <MediaImg src={b.mobileImage} alt="" className="h-16 w-12 rounded object-cover" />
              </div>
              <Button className="mt-3" size="sm" variant="outline" onClick={() => start(b)}>Edit</Button>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle className="font-display text-xl">Banner</DialogTitle>
          {form ? (
            <div className="mt-4 grid max-h-[70vh] gap-3 overflow-y-auto">
              <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
              <Field label="Subtitle"><Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></Field>
              <Field label="CTA"><Input value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} /></Field>
              <Field label="Destination"><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></Field>
              <ImageUploadField
                label="Desktop image"
                value={form.desktopImage}
                onChange={(desktopImage) => setForm({ ...form, desktopImage })}
              />
              <ImageUploadField
                label="Tablet image"
                value={form.tabletImage}
                onChange={(tabletImage) => setForm({ ...form, tabletImage })}
              />
              <ImageUploadField
                label="Mobile image"
                value={form.mobileImage}
                onChange={(mobileImage) => setForm({ ...form, mobileImage })}
              />
              <Field label="Status">
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as BannerStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["draft", "scheduled", "published"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Start"><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
                <Field label="End"><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
              </div>
              <Button
                disabled={saving || !form.desktopImage}
                onClick={async () => {
                  setSaving(true);
                  try {
                    await save(form);
                    toast.success("Banner saved");
                    setOpen(false);
                  } catch {
                    toast.error("Could not save banner");
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
