/** Build a URL slug from a category name. */
export function categorySlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function categoryHref(id: number, name: string) {
  return `/category/${encodeURIComponent(categorySlug(name))}?id=${id}`;
}
