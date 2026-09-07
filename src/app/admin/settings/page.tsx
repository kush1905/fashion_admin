"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, NumberInput } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/forms";
import { Card } from "@/components/ui/layout";
import { useOpsStore } from "@/stores/ops-store";
import { useCan } from "@/hooks/use-can";

export default function SettingsPage() {
  const settings = useOpsStore((s) => s.settings);
  const update = useOpsStore((s) => s.updateSettings);
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);
  const can = useCan();
  const canEdit = can("Settings", "edit");

  async function save() {
    setBusy(true);
    await update(form);
    toast.success("Settings saved");
    setBusy(false);
  }

  return (
    <div>
      <PageHeader title="Settings" description="Store, payments, shipping, tax, mail — all mocked, all ready for a real backend." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Settings" }]} actions={canEdit ? <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button> : undefined} />
      <Tabs defaultValue="general">
        <TabsList className="flex flex-wrap h-auto">
          {["general", "store", "payments", "shipping", "tax", "notifications", "email", "appearance", "seo"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="general" className="mt-4">
          <Card className="grid gap-3 p-5 max-w-xl">
            <Field label="Workspace name"><Input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} /></Field>
            <Field label="Timezone"><Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></Field>
            <Field label="Currency"><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></Field>
          </Card>
        </TabsContent>
        <TabsContent value="store" className="mt-4">
          <Card className="grid gap-3 p-5 max-w-xl">
            <Field label="Studio email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Address"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          </Card>
        </TabsContent>
        <TabsContent value="payments" className="mt-4">
          <Card className="p-5 max-w-xl text-sm text-muted-foreground">Razorpay, cards, UPI, and net banking will connect here. This demo only records method on each order.</Card>
        </TabsContent>
        <TabsContent value="shipping" className="mt-4">
          <Card className="grid gap-3 p-5 max-w-xl">
            <Field label="Free shipping above (INR)"><NumberInput value={form.freeShippingThreshold} onValueChange={(freeShippingThreshold) => setForm({ ...form, freeShippingThreshold })} /></Field>
            <p className="text-sm text-muted-foreground">Delhivery and Bluedart are mocked as couriers on shipments.</p>
          </Card>
        </TabsContent>
        <TabsContent value="tax" className="mt-4">
          <Card className="grid gap-3 p-5 max-w-xl">
            <Field label="Default GST %"><NumberInput value={form.taxPercent} onValueChange={(taxPercent) => setForm({ ...form, taxPercent })} /></Field>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="mt-4">
          <Card className="p-5 max-w-xl text-sm leading-relaxed">Low-stock alerts, new-order pings, and return requests appear in the bell. Threshold is {form.lowStockThreshold} units.</Card>
        </TabsContent>
        <TabsContent value="email" className="mt-4">
          <Card className="p-5 max-w-xl text-sm text-muted-foreground">Transactional templates (order confirmed, packed, out for delivery) will live here. Not wired in the demo.</Card>
        </TabsContent>
        <TabsContent value="appearance" className="mt-4">
          <Card className="p-5 max-w-xl text-sm">Reena Rathore uses a warm paper canvas and a single wine accent. Storefront theming will be a later phase.</Card>
        </TabsContent>
        <TabsContent value="seo" className="mt-4">
          <Card className="p-5 max-w-xl text-sm text-muted-foreground">Default title suffix and social share image will sit here. Product SEO is already on each product.</Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
