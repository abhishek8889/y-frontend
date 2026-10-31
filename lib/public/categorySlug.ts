/** Build a URL slug from a category name (fallback when API omits `slug`). */
export function categorySlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Prefer API `slug`; fall back to slugifying `name`. */
export function resolveCategorySlug(category: { slug?: string | null; name: string }) {
  const fromApi = category.slug?.trim();
  return fromApi || categorySlug(category.name);
}

/** Category page URL — slug only (no id query). */
export function categoryHref(category: { id?: number; slug?: string | null; name: string }) {
  return `/category/${encodeURIComponent(resolveCategorySlug(category))}`;
}
