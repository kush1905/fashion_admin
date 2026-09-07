"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ProductMediaSection } from "@/components/shared/image-upload";
import { Button } from "@/components/ui/button";
import { Field, Input, NumberInput, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from "@/components/ui/forms";
import { Card } from "@/components/ui/layout";
import { slugify } from "@/lib/utils";
import { assignableCategories, categoryPath } from "@/lib/catalog";
import { DETAIL_FIELD_KEYS, emptyDetailAttributes, mergeDetailAttributes } from "@/lib/product-details";
import { useCatalogStore } from "@/stores/catalog-store";
import { useCan } from "@/hooks/use-can";
import type { Product, ProductStatus, ProductVariant } from "@/types";

const empty = (id: string): Product => ({
  id,
  title: "",
  sku: "",
  slug: "",
  shortDescription: "",
  description: "",
  mrp: 0,
  price: 0,
  taxPercent: 12,
  categoryId: "",
  collectionIds: [],
  images: [],
  colors: [{ name: "Ivory", hex: "#F4EFE6" }],
  sizes: ["S", "M", "L"],
  variants: [],
  attributes: emptyDetailAttributes(),
  seoTitle: "",
  seoDescription: "",
  status: "draft",
  rating: 0,
  reviewCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

function rebuildVariants(product: Product): ProductVariant[] {
  const variants: ProductVariant[] = [];
  for (const color of product.colors) {
    for (const size of product.sizes) {
      const existing = product.variants.find((v) => v.color === color.name && v.size === size);
      variants.push(
        existing ?? {
          id: `v_${color.name}_${size}_${Math.random().toString(36).slice(2, 6)}`,
          color: color.name,
          colorHex: color.hex,
          size,
          sku: `${product.sku || "SKU"}-${color.name.slice(0, 2).toUpperCase()}-${size}`,
          price: product.price,
          stock: 0,
          reserved: 0,
        },
      );
    }
  }
  return variants;
}

export function ProductEditor({ productId }: { productId?: string }) {
  const router = useRouter();
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.categories);
  const collections = useCatalogStore((s) => s.collections);
  const saveProduct = useCatalogStore((s) => s.saveProduct);
  const can = useCan();
  const seed = products.find((p) => p.id === productId);
  const readOnly = seed ? !can("Products", "edit") : !can("Products", "create");
  const [form, setForm] = useState<Product>(() => {
    const base = seed ?? empty(productId ?? `prd_${Date.now()}`);
    return { ...base, attributes: mergeDetailAttributes(base.attributes) };
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [customAttrKey, setCustomAttrKey] = useState("");

  const categoryOptions = useMemo(() => assignableCategories(categories), [categories]);

  const discount = useMemo(() => {
    if (!form.mrp) return 0;
    return Math.max(0, Math.round(((form.mrp - form.price) / form.mrp) * 100));
  }, [form.mrp, form.price]);

  function set<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "title" && !seed) next.slug = slugify(String(value));
      if (key === "colors" || key === "sizes" || key === "sku" || key === "price") next.variants = rebuildVariants(next);
      return next;
    });
  }

  async function onSave() {
    if (form.title.trim().length < 3) {
      setError("Give the piece a proper title.");
      return;
    }
    if (!form.sku) {
      setError("SKU is required.");
      return;
    }
    if (!form.categoryId) {
      setError("Choose a category — products are not assigned to Women (or Men) until you pick one.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const attributes = { ...form.attributes };
      if (!attributes["Style Number"]?.trim()) attributes["Style Number"] = form.sku;
      if (!attributes["Wash Care"]?.trim() && attributes.Care) attributes["Wash Care"] = attributes.Care;
      const withVariants = {
        ...form,
        attributes,
        variants: form.variants.length ? form.variants : rebuildVariants(form),
      };
      await saveProduct(withVariants);
      toast.success(seed ? "Product saved" : "Product created as draft");
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={seed ? form.title : "New product"}
        description={readOnly ? "View only — your role cannot change the catalogue." : "Basic facts, pricing, colour/size matrix, media, attributes, and SEO."}
        crumbs={[{ href: "/admin", label: "Dashboard" }, { href: "/admin/products", label: "Products" }, { label: seed ? (readOnly ? "View" : "Edit") : "New" }]}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/admin/products")}>{readOnly ? "Back" : "Cancel"}</Button>
            {readOnly ? null : (
              <Button onClick={onSave} disabled={busy}>{busy ? "Saving…" : "Save product"}</Button>
            )}
          </>
        }
      />
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      <div className={`grid gap-4 xl:grid-cols-[1fr_320px] ${readOnly ? "pointer-events-none opacity-80" : ""}`}>
        <div className="grid gap-4">
          <Card className="grid gap-4 p-5">
            <h2 className="font-display text-xl">Basic information</h2>
            <Field label="Title"><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SKU"><Input value={form.sku} onChange={(e) => set("sku", e.target.value)} /></Field>
              <Field label="Slug"><Input value={form.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
            </div>
            <Field label="Short description"><Input value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} /></Field>
            <Field label="Detailed description"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
          </Card>

          <Card className="grid gap-4 p-5">
            <h2 className="font-display text-xl">Pricing</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Field label="MRP"><NumberInput value={form.mrp} onValueChange={(v) => set("mrp", v)} /></Field>
              <Field label="Selling price"><NumberInput value={form.price} onValueChange={(v) => set("price", v)} /></Field>
              <Field label="Discount"><Input readOnly value={`${discount}%`} /></Field>
              <Field label="Tax %"><NumberInput value={form.taxPercent} onValueChange={(v) => set("taxPercent", v)} /></Field>
            </div>
          </Card>

          <Card className="grid gap-4 p-5">
            <h2 className="font-display text-xl">Colours & sizes</h2>
            <Field label="Colours (comma-separated)" hint="Example: Ivory, Blush">
              <Input
                value={form.colors.map((c) => c.name).join(", ")}
                onChange={(e) =>
                  set(
                    "colors",
                    e.target.value.split(",").map((name) => ({ name: name.trim(), hex: "#C4A574" })).filter((c) => c.name),
                  )
                }
              />
            </Field>
            <Field label="Sizes (comma-separated)">
              <Input value={form.sizes.join(", ")} onChange={(e) => set("sizes", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </Field>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[32rem] text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="pb-2">Colour</th>
                    <th>Size</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {(form.variants.length ? form.variants : rebuildVariants(form)).map((v, i) => (
                    <tr key={v.id} className="border-t">
                      <td className="py-2">{v.color}</td>
                      <td>{v.size}</td>
                      <td>
                        <Input
                          className="h-8"
                          value={v.sku}
                          onChange={(e) => {
                            const variants = [...(form.variants.length ? form.variants : rebuildVariants(form))];
                            variants[i] = { ...v, sku: e.target.value };
                            set("variants", variants);
                          }}
                        />
                      </td>
                      <td>
                        <NumberInput
                          className="h-8"
                          value={v.price}
                          onValueChange={(price) => {
                            const variants = [...(form.variants.length ? form.variants : rebuildVariants(form))];
                            variants[i] = { ...v, price };
                            set("variants", variants);
                          }}
                        />
                      </td>
                      <td>
                        <NumberInput
                          className="h-8"
                          value={v.stock}
                          onValueChange={(stock) => {
                            const variants = [...(form.variants.length ? form.variants : rebuildVariants(form))];
                            variants[i] = { ...v, stock };
                            set("variants", variants);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="grid gap-4 p-5">
            <h2 className="font-display text-xl">Media</h2>
            <ProductMediaSection images={form.images} onChange={(images) => set("images", images)} />
          </Card>

          <Card className="grid gap-4 p-5">
            <h2 className="font-display text-xl">Product details</h2>
            <p className="text-xs text-muted-foreground">
              These fields appear in the shop PDP accordion (style number, measurements, care, manufacturer, and more).
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {DETAIL_FIELD_KEYS.map((key) => (
                <Field
                  key={key}
                  label={key}
                  hint={
                    key === "Availability"
                      ? "Ready to ship or Made to order"
                      : key === "Production note"
                        ? "Shown under Add to bag when filled"
                        : key === "Measurements"
                          ? "e.g. Saree 5.5 m · Blouse fabric 1 m"
                          : undefined
                  }
                >
                  {key === "Production note" || key === "Manufacturer" || key === "Measurements" ? (
                    <Textarea
                      value={form.attributes[key] ?? ""}
                      onChange={(e) => set("attributes", { ...form.attributes, [key]: e.target.value })}
                    />
                  ) : (
                    <Input
                      value={form.attributes[key] ?? ""}
                      onChange={(e) => set("attributes", { ...form.attributes, [key]: e.target.value })}
                    />
                  )}
                </Field>
              ))}
            </div>
            <div className="grid gap-2 border-t pt-4">
              <p className="text-sm font-medium">Extra attributes</p>
              {Object.keys(form.attributes)
                .filter((key) => !(DETAIL_FIELD_KEYS as readonly string[]).includes(key))
                .map((key) => (
                  <Field key={key} label={key}>
                    <Input
                      value={form.attributes[key]}
                      onChange={(e) => set("attributes", { ...form.attributes, [key]: e.target.value })}
                    />
                  </Field>
                ))}
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[12rem] flex-1">
                  <Field label="Add field">
                    <Input
                      placeholder="e.g. Embroidery"
                      value={customAttrKey}
                      onChange={(e) => setCustomAttrKey(e.target.value)}
                    />
                  </Field>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const key = customAttrKey.trim();
                    if (!key || form.attributes[key] !== undefined) return;
                    set("attributes", { ...form.attributes, [key]: "" });
                    setCustomAttrKey("");
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 self-start">
          <Card className="grid gap-4 p-5">
            <h2 className="font-display text-xl">Organisation</h2>
            <Field label="Category" hint="Required. Pick the aisle under Women or Men — nothing is auto-assigned.">
              <Select
                value={form.categoryId || undefined}
                onValueChange={(v) => set("categoryId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category…" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {categoryPath(categories, c.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {form.categoryId ? (
              <p className="text-xs text-muted-foreground">
                Shop path: {categoryPath(categories, form.categoryId)}
              </p>
            ) : null}
            <div className="grid gap-2">
              <p className="text-sm font-medium">Collections</p>
              <p className="text-xs text-muted-foreground">Optional — toggle any that should feature this piece.</p>
              {collections.map((c) => {
                const on = form.collectionIds.includes(c.id);
                return (
                  <label key={c.id} className="flex items-center justify-between text-sm">
                    {c.name}
                    <Switch
                      checked={on}
                      onCheckedChange={(v) =>
                        set("collectionIds", v ? [...form.collectionIds, c.id] : form.collectionIds.filter((id) => id !== c.id))
                      }
                    />
                  </label>
                );
              })}
            </div>
          </Card>
          <Card className="grid gap-4 p-5">
            <h2 className="font-display text-xl">Visibility</h2>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => set("status", v as ProductStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["draft", "published", "scheduled", "archived"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </Card>
          <Card className="grid gap-4 p-5">
            <h2 className="font-display text-xl">SEO</h2>
            <Field label="Meta title"><Input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} /></Field>
            <Field label="Meta description"><Textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} /></Field>
          </Card>
        </div>
      </div>
    </div>
  );
}
