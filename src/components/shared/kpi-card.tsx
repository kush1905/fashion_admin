import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/layout";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  change,
  hint,
}: {
  label: string;
  value: string;
  change?: number;
  hint?: string;
}) {
  const up = (change ?? 0) >= 0;
  return (
    <Card className="p-4">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 font-display text-xl leading-tight sm:text-2xl">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {change != null ? (
          <span className={cn("inline-flex items-center gap-0.5", up ? "text-success" : "text-destructive")}>
            {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(change).toFixed(1)}%
          </span>
        ) : null}
        {hint ? <span className="text-muted-foreground">{hint}</span> : null}
      </div>
    </Card>
  );
}
