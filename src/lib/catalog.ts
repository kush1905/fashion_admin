import type { Category } from "@/types";

export function categoryPath(categories: Category[], id: string) {
  const parts: string[] = [];
  let current = categories.find((c) => c.id === id);
  while (current) {
    parts.unshift(current.name);
    current = current.parentId ? categories.find((c) => c.id === current!.parentId) : undefined;
  }
  return parts.join(" › ");
}

/** Leaf categories suitable for assigning products (with Women/Men paths). */
export function assignableCategories(categories: Category[]) {
  return categories
    .filter((c) => !c.hidden && !categories.some((child) => child.parentId === c.id))
    .sort((a, b) => categoryPath(categories, a.id).localeCompare(categoryPath(categories, b.id)));
}
