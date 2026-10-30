export type StatusColorKey = "draft" | "active" | "inactive" | "soldout";

function normalizeStatusToken(status: string | null | undefined) {
  return String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export function normalizeStatusKey(status: string | null | undefined): StatusColorKey {
  const normalized = normalizeStatusToken(status);

  if (normalized === "draft") return "draft";
  if (normalized === "inactive" || normalized === "completed") return "inactive";
  if (
    normalized === "sold_out" ||
    normalized === "soldout" ||
    normalized === "cancelled" ||
    normalized === "canceled" ||
    normalized === "suspended" ||
    normalized === "refunded"
  ) {
    return "soldout";
  }
  if (normalized === "partially_refunded") return "inactive";
  if (normalized === "failed" || normalized === "rejected") return "soldout";
  if (normalized === "pending" || normalized === "processing") return "draft";
  // published / active / succeeded / unknown → active (green)
  return "active";
}

export function statusTextClass(status: string | null | undefined) {
  return `text-status-${normalizeStatusKey(status)}`;
}

export function statusBgClass(status: string | null | undefined) {
  return `bg-status-${normalizeStatusKey(status)}`;
}

export function statusBorderClass(status: string | null | undefined) {
  return `border-status-${normalizeStatusKey(status)}`;
}

export function formatStatusLabel(status: string | null | undefined) {
  const normalized = normalizeStatusToken(status);
  if (!normalized) return "";
  if (normalized === "sold_out" || normalized === "soldout") return "Sold out";
  if (normalized === "published") return "Published";
  if (normalized === "cancelled" || normalized === "canceled") return "Cancelled";
  if (normalized === "completed") return "Completed";
  if (normalized === "draft") return "Draft";
  if (normalized === "inactive") return "Inactive";
  if (normalized === "active") return "Active";
  if (normalized === "suspended") return "Suspended";
  if (normalized === "refunded") return "Refunded";
  if (normalized === "partially_refunded") return "Partially refunded";
  if (normalized === "succeeded") return "Succeeded";
  if (normalized === "failed") return "Failed";
  if (normalized === "pending") return "Pending";
  if (normalized === "processing") return "Processing";
  return normalized
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
