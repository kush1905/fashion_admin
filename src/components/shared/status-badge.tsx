import { Badge } from "@/components/ui/badge";
import { labelize } from "@/lib/nav";

const map: Record<string, "success" | "warning" | "danger" | "primary" | "muted" | "default"> = {
  published: "success",
  paid: "success",
  delivered: "success",
  approved: "success",
  active: "success",
  completed: "success",
  picked_up: "success",
  refund_completed: "success",
  healthy: "success",
  pending: "warning",
  scheduled: "warning",
  processing: "warning",
  packed: "warning",
  confirmed: "primary",
  dispatched: "primary",
  in_transit: "primary",
  out_for_delivery: "primary",
  ready: "primary",
  ready_for_pickup: "primary",
  low: "warning",
  draft: "muted",
  invited: "muted",
  abandoned: "warning",
  cancelled: "danger",
  rejected: "danger",
  failed: "danger",
  out: "danger",
  hidden: "muted",
  archived: "muted",
  disabled: "muted",
  refunded: "muted",
  return_requested: "warning",
  returned: "warning",
  vip: "primary",
};

export function StatusBadge({ value }: { value: string }) {
  return <Badge variant={map[value] ?? "default"}>{labelize(value)}</Badge>;
}
