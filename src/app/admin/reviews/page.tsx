"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms";
import { Card, EmptyState, TableWrap, Td, Th } from "@/components/ui/layout";
import { Sheet, SheetContent } from "@/components/ui/overlay";
import { formatDate } from "@/lib/format";
import { useCatalogStore } from "@/stores/catalog-store";
import { useCustomersStore } from "@/stores/customers-store";
import type { Review } from "@/types";

export default function ReviewsPage() {
  const reviews = useCustomersStore((s) => s.reviews);
  const products = useCatalogStore((s) => s.products);
  const setStatus = useCustomersStore((s) => s.setReviewStatus);
  const updateReview = useCustomersStore((s) => s.updateReview);
  const [rating, setRating] = useState("all");
  const [status, setFilter] = useState("all");
  const [active, setActive] = useState<Review | null>(null);
  const [reply, setReply] = useState("");

  const rows = useMemo(
    () => reviews.filter((r) => (rating === "all" || String(r.rating) === rating) && (status === "all" || r.status === status)),
    [reviews, rating, status],
  );
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div>
      <PageHeader title="Reviews" description="What clients write after the wedding week." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Reviews" }]} />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="p-4"><p className="text-xs text-muted-foreground uppercase">Average</p><p className="font-display text-2xl">{avg.toFixed(1)} / 5</p></Card>
        {[5, 4, 3, 2, 1].map((n) => (
          <Card key={n} className="p-4">
            <p className="text-xs text-muted-foreground">{n} star</p>
            <p className="font-display text-xl">{reviews.filter((r) => r.rating === n).length}</p>
          </Card>
        ))}
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Select value={rating} onValueChange={setRating}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ratings</SelectItem>
            {[5, 4, 3, 2, 1].map((n) => <SelectItem key={n} value={String(n)}>{n} stars</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setFilter}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["all", "pending", "approved", "hidden", "rejected"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {rows.length === 0 ? <EmptyState title="No reviews match" /> : (
        <TableWrap>
          <thead><tr><Th>Product</Th><Th>Customer</Th><Th>Rating</Th><Th>Review</Th><Th>Date</Th><Th>Status</Th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="cursor-pointer hover:bg-muted/40" onClick={() => { setActive(r); setReply(r.reply ?? ""); }}>
                <Td>{products.find((p) => p.id === r.productId)?.title}</Td>
                <Td>{r.customerName}</Td>
                <Td>{r.rating}★</Td>
                <Td className="max-w-xs truncate">{r.title}</Td>
                <Td>{formatDate(r.date)}</Td>
                <Td><StatusBadge value={r.status} /></Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
      <Sheet open={!!active} onOpenChange={() => setActive(null)}>
        <SheetContent className="overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {active ? (
            <>
              <h2 className="font-display text-2xl">{active.title}</h2>
              <p className="text-sm text-muted-foreground">{active.customerName} · {active.rating}★</p>
              <p className="mt-4 text-sm leading-relaxed">{active.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={async () => { await setStatus(active.id, "approved"); toast.success("Approved"); }}>Approve</Button>
                <Button size="sm" variant="outline" onClick={async () => { await setStatus(active.id, "hidden"); toast.success("Hidden"); }}>Hide</Button>
                <Button size="sm" variant="destructive" onClick={async () => { await setStatus(active.id, "rejected"); toast.success("Rejected"); }}>Reject</Button>
              </div>
              <Textarea className="mt-4" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply from the atelier" />
              <Button className="mt-2" variant="outline" onClick={async () => { await updateReview(active.id, { reply }); toast.success("Reply saved"); }}>Send reply</Button>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
