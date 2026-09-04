"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/forms";
import { Card, EmptyState } from "@/components/ui/layout";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/overlay";
import { Field, Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/overlay";
import { slugify } from "@/lib/utils";
import { useCatalogStore } from "@/stores/catalog-store";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const categories = useCatalogStore((s) => s.categories);
  const saveCategory = useCatalogStore((s) => s.saveCategory);
  const deleteCategory = useCatalogStore((s) => s.deleteCategory);
  const setHidden = useCatalogStore((s) => s.setCategoryHidden);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const roots = categories.filter((c) => !c.parentId).sort((a, b) => a.order - b.order);

  function children(id: string) {
    return categories.filter((c) => c.parentId === id).sort((a, b) => a.order - b.order);
  }

  async function create() {
    if (name.trim().length < 2) return;
    const category: Category = {
      id: `cat_${Date.now()}`,
      name,
      slug: slugify(name),
      parentId,
      hidden: false,
      productCount: 0,
      order: categories.length,
    };
    await saveCategory(category);
    toast.success("Category created");
    setOpen(false);
    setName("");
  }

  function Tree({ nodes, depth = 0 }: { nodes: Category[]; depth?: number }) {
    if (!nodes.length && depth === 0) return <EmptyState title="No categories yet" />;
    return (
      <ul className="grid gap-1">
        {nodes.map((node) => (
          <li key={node.id}>
            <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2" style={{ marginLeft: depth * 16 }}>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{node.name}</p>
                <p className="text-xs text-muted-foreground">{node.productCount} products · /{node.slug}</p>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                Visible
                <Switch checked={!node.hidden} onCheckedChange={(v) => setHidden(node.id, !v)} />
              </label>
              <Button size="sm" variant="ghost" onClick={() => { setParentId(node.id); setOpen(true); }}>
                Add child
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRemoveId(node.id)}>
                Delete
              </Button>
            </div>
            <Tree nodes={children(node.id)} depth={depth + 1} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description="A tree the shop navigation reads from. Drag mentally — use Add child to nest."
        crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Categories" }]}
        actions={<Button onClick={() => { setParentId(null); setOpen(true); }}>Add category</Button>}
      />
      <Card className="p-4">
        <Tree nodes={roots} />
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle className="font-display text-xl">New category</DialogTitle>
          <div className="mt-4 grid gap-3">
            <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Button onClick={create}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!removeId}
        onOpenChange={() => setRemoveId(null)}
        title="Remove this category?"
        description="Child categories will be removed in this demo as well."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (removeId) await deleteCategory(removeId);
          toast.success("Category removed");
          setRemoveId(null);
        }}
      />
    </div>
  );
}
