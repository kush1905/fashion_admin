"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ImageUploadField } from "@/components/shared/image-upload";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Card, EmptyState } from "@/components/ui/layout";
import { ConfirmDialog, Dialog, DialogContent, DialogTitle, Sheet, SheetContent } from "@/components/ui/overlay";
import { slugify } from "@/lib/utils";
import { useCatalogStore } from "@/stores/catalog-store";
import type { Collection } from "@/types";
import { MediaImg } from "@/components/media/media-img";

function blankCollection(): Collection {
  return {
    id: `col_${Date.now()}`,
    name: "",
    slug: "",
    description: "",
    image: "",
    productIds: [],
    status: "draft",
    season: "",
  };
}

export default function CollectionsPage() {
  const collections = useCatalogStore((s) => s.collections);
  const products = useCatalogStore((s) => s.products);
  const saveCollection = useCatalogStore((s) => s.saveCollection);
  const deleteCollection = useCatalogStore((s) => s.deleteCollection);

  const [assignId, setAssignId] = useState<string | null>(null);
  const [editor, setEditor] = useState<Collection | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const assigning = collections.find((c) => c.id === assignId);

  function openCreate() {
    setIsNew(true);
    setEditor(blankCollection());
  }

  function openEdit(collection: Collection) {
    setIsNew(false);
    setEditor({ ...collection });
  }

  async function onSave() {
    if (!editor) return;
    if (editor.name.trim().length < 2) {
      toast.error("Give the collection a name");
      return;
    }
    setSaving(true);
    try {
      const payload: Collection = {
        ...editor,
        slug: editor.slug.trim() || slugify(editor.name),
        season: editor.season?.trim() || undefined,
      };
      await saveCollection(payload);
      toast.success(isNew ? "Collection created" : "Collection saved");
      setEditor(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save collection");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Collections"
        description="Create edits and seasons, then assign products to them."
        crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Collections" }]}
        actions={<Button onClick={openCreate}>New collection</Button>}
      />

      {!collections.length ? (
        <EmptyState title="No collections yet" description="Create a collection to group products for the shop." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              {c.image ? (
                <MediaImg src={c.image} alt="" className="h-40 w-full object-cover" />
              ) : (
                <div className="grid h-40 place-items-center bg-muted text-sm text-muted-foreground">No image</div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl">{c.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{c.description || "No description"}</p>
                  </div>
                  <StatusBadge value={c.status} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {c.productIds.length} products · /{c.slug}
                  {c.season ? ` · ${c.season}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setAssignId(c.id)}>
                    Assign products
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setRemoveId(c.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editor} onOpenChange={(open) => !open && setEditor(null)}>
        <DialogContent>
          <DialogTitle className="font-display text-xl">{isNew ? "New collection" : "Edit collection"}</DialogTitle>
          {editor ? (
            <div className="mt-4 grid max-h-[70vh] gap-3 overflow-y-auto">
              <Field label="Name">
                <Input
                  value={editor.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditor({
                      ...editor,
                      name,
                      slug: isNew || !editor.slug ? slugify(name) : editor.slug,
                    });
                  }}
                />
              </Field>
              <Field label="Slug" hint="Used in shop URLs like /collections/festive">
                <Input value={editor.slug} onChange={(e) => setEditor({ ...editor, slug: slugify(e.target.value) })} />
              </Field>
              <Field label="Description">
                <Textarea
                  value={editor.description}
                  onChange={(e) => setEditor({ ...editor, description: e.target.value })}
                />
              </Field>
              <Field label="Season">
                <Input
                  placeholder="e.g. FW26"
                  value={editor.season ?? ""}
                  onChange={(e) => setEditor({ ...editor, season: e.target.value })}
                />
              </Field>
              <Field label="Status">
                <Select
                  value={editor.status}
                  onValueChange={(v) => setEditor({ ...editor, status: v as Collection["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">draft</SelectItem>
                    <SelectItem value="published">published</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <ImageUploadField
                label="Cover image"
                value={editor.image}
                onChange={(image) => setEditor({ ...editor, image })}
              />
              <div className="flex gap-2 pt-1">
                <Button variant="outline" onClick={() => setEditor(null)}>
                  Cancel
                </Button>
                <Button disabled={saving} onClick={() => void onSave()}>
                  {saving ? "Saving…" : isNew ? "Create collection" : "Save changes"}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Sheet open={!!assigning} onOpenChange={() => setAssignId(null)}>
        <SheetContent className="overflow-y-auto p-5">
          <h2 className="font-display text-2xl">{assigning?.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tick pieces into this collection.</p>
          <ul className="mt-4 grid gap-2">
            {products.map((p) => {
              const on = assigning?.productIds.includes(p.id) ?? false;
              return (
                <li key={p.id} className="flex items-center gap-3 rounded-md border px-2 py-2">
                  <Checkbox
                    checked={on}
                    onCheckedChange={async (v) => {
                      if (!assigning) return;
                      const productIds = v
                        ? [...assigning.productIds, p.id]
                        : assigning.productIds.filter((id) => id !== p.id);
                      await saveCollection({ ...assigning, productIds });
                      toast.success("Collection updated");
                    }}
                  />
                  {p.images[0] ? (
                    <MediaImg src={p.images[0]} alt="" className="size-10 rounded object-cover" />
                  ) : (
                    <div className="size-10 rounded bg-muted" />
                  )}
                  <span className="text-sm">{p.title}</span>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!removeId}
        onOpenChange={() => setRemoveId(null)}
        title="Delete collection?"
        description="Products stay in the catalogue; they are only removed from this group."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (!removeId) return;
          await deleteCollection(removeId);
          toast.success("Collection deleted");
          setRemoveId(null);
          if (assignId === removeId) setAssignId(null);
        }}
      />
    </div>
  );
}
