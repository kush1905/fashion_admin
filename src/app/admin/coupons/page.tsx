"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Switch, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms";
import { TableWrap, Td, Th } from "@/components/ui/layout";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/overlay";
import { formatCurrency } from "@/lib/format";
import { useOpsStore } from "@/stores/ops-store";
import type { Coupon } from "@/types";

export default function CouponsPage() {
  const coupons = useOpsStore((s) => s.coupons);
  const save = useOpsStore((s) => s.saveCoupon);
  const toggle = useOpsStore((s) => s.toggleCoupon);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Coupon>>({
    code: "",
    type: "percentage",
    value: 10,
    minCartValue: 0,
    firstOrderOnly: false,
    usageLimit: 100,
    startDate: "2026-09-04",
    endDate: "2026-12-31",
  });

  return (
    <div>
      <PageHeader title="Coupons" description="Codes, conditions, and remaining uses." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Coupons" }]} actions={<Button onClick={() => setOpen(true)}>New coupon</Button>} />
      <TableWrap>
        <thead>
          <tr>
            <Th>Code</Th>
            <Th>Type</Th>
            <Th>Value</Th>
            <Th>Min cart</Th>
            <Th>Usage</Th>
            <Th>Validity</Th>
            <Th>Active</Th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id}>
              <Td className="font-mono font-medium">{c.code}</Td>
              <Td><StatusBadge value={c.type} /></Td>
              <Td>{c.type === "percentage" ? `${c.value}%` : c.type === "fixed" ? formatCurrency(c.value) : "Free ship"}</Td>
              <Td>{c.minCartValue ? formatCurrency(c.minCartValue) : "—"}</Td>
              <Td>{c.usedCount} / {c.usageLimit} <span className="text-muted-foreground">({c.usageLimit - c.usedCount} left)</span></Td>
              <Td className="text-xs">{c.startDate} → {c.endDate}</Td>
              <Td><Switch checked={c.active} onCheckedChange={() => toggle(c.id)} /></Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle className="font-display text-xl">Create coupon</DialogTitle>
          <div className="mt-4 grid gap-3">
            <Field label="Code"><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></Field>
            <Field label="Type">
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Coupon["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="free_shipping">Free shipping</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Value"><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></Field>
            <Field label="Minimum cart"><Input type="number" value={form.minCartValue} onChange={(e) => setForm({ ...form, minCartValue: Number(e.target.value) })} /></Field>
            <label className="flex items-center justify-between text-sm">First order only <Switch checked={!!form.firstOrderOnly} onCheckedChange={(v) => setForm({ ...form, firstOrderOnly: v })} /></label>
            <Button onClick={async () => {
              await save({
                id: `cpn_${Date.now()}`,
                code: form.code || "NEWCODE",
                type: form.type ?? "percentage",
                value: form.value ?? 0,
                minCartValue: form.minCartValue,
                firstOrderOnly: !!form.firstOrderOnly,
                startDate: form.startDate ?? "",
                endDate: form.endDate ?? "",
                usageLimit: form.usageLimit ?? 100,
                usedCount: 0,
                active: true,
              });
              toast.success("Coupon created");
              setOpen(false);
            }}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
