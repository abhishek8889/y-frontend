import type {
  DataTableCellContext,
  DataTableColumnTooltip,
} from "./types";

export function getNestedValue(obj: unknown, path?: string): unknown {
  if (!path) return undefined;

  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function alignClass(align?: "left" | "center" | "right") {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

function tipFromValue(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

function resolveTipContent<T>(
  content: boolean | string | ((ctx: DataTableCellContext<T>) => string | null | undefined) | undefined,
  ctx: DataTableCellContext<T>,
): string | null {
  if (content == null) return null;
  if (content === true) return tipFromValue(ctx.value);
  if (content === false) return null;
  if (typeof content === "string") {
    const trimmed = content.trim();
    return trimmed || null;
  }
  const result = content(ctx);
  if (result == null) return null;
  const trimmed = String(result).trim();
  return trimmed || null;
}

export function resolveColumnTooltip<T>(
  tooltip: DataTableColumnTooltip<T> | undefined,
  ctx: DataTableCellContext<T>,
): { text: string; label: string } | null {
  if (tooltip == null || tooltip === false) return null;

  if (tooltip === true) {
    const text = tipFromValue(ctx.value);
    return text ? { text, label: "More information" } : null;
  }

  if (typeof tooltip === "string") {
    const text = tooltip.trim();
    return text ? { text, label: "More information" } : null;
  }

  if (typeof tooltip === "function") {
    const text = resolveTipContent(tooltip, ctx);
    return text ? { text, label: "More information" } : null;
  }

  const text = resolveTipContent(
    tooltip.content === undefined ? true : tooltip.content,
    ctx,
  );
  if (!text) return null;

  const label =
    typeof tooltip.label === "function"
      ? tooltip.label(ctx)
      : tooltip.label?.trim() || "More information";

  return { text, label };
}
