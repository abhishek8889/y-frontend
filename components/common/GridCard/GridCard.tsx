"use client";

import type { GridCardColumns, GridCardItem, GridCardProps } from "./types";

const MAX_COLUMNS = 5;

function resolveColumnCount(itemCount: number, columns?: GridCardColumns): number {
  if (columns) return Math.min(columns, MAX_COLUMNS);
  return Math.min(Math.max(itemCount, 1), MAX_COLUMNS);
}

function GridCardCell({
  item,
  className = "",
}: {
  item: GridCardItem;
  className?: string;
}) {
  return (
    <div
      className={`organiser-grid-card flex min-h-[87px] min-w-0 flex-1 flex-col justify-center border border-black bg-white p-[18px] ${className}`.trim()}
    >
      <div className="flex items-start gap-3">
        {item.icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-black/15 bg-black/[0.03] text-black">
            {item.icon}
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="font-heading flex items-center gap-2 text-[14px] leading-[19.6px] text-[#aaaaac]">
            {item.indicatorColor ? (
              <span
                className="inline-block h-[7px] w-[7px] shrink-0 rounded-full"
                style={{ backgroundColor: item.indicatorColor }}
                aria-hidden="true"
              />
            ) : null}
            <span className="min-w-0">{item.label}</span>
          </p>

          <p className="mt-[6px] text-[22px] font-bold uppercase leading-[24.2px] text-black">
            {item.value}
          </p>

          {item.description != null && item.description !== "" ? (
            <p className="mt-[10px] text-[14px] font-normal leading-[19.6px] text-[#6f6e69]">
              {item.description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Overview metrics row.
 * Cards share the row equally (max 5). Omit `columns` to size from `items.length`.
 */
export function GridCard({
  items,
  columns,
  isLoading = false,
  emptyMessage = "No overview data available.",
  className = "",
  itemClassName = "",
}: GridCardProps) {
  const visibleItems = items.slice(0, MAX_COLUMNS);
  const columnCount = resolveColumnCount(visibleItems.length, columns);
  const rowClass = [
    "organiser-grid-card-row flex w-full flex-col gap-2.5 md:flex-row md:items-stretch",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (isLoading) {
    return (
      <div className={rowClass} aria-busy="true" aria-live="polite">
        {Array.from({ length: columnCount }, (_, index) => (
          <div
            key={`grid-card-skeleton-${index}`}
            className={`min-h-[87px] min-w-0 flex-1 animate-pulse border border-black/10 bg-black/[0.03] p-[18px] ${itemClassName}`.trim()}
          >
            <div className="h-3 w-24 bg-black/10" />
            <div className="mt-3 h-6 w-16 bg-black/10" />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="border border-black px-4 py-8 text-center text-[13px] text-black/50">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={rowClass}>
      {visibleItems.map((item, index) => (
        <GridCardCell
          key={item.id ?? `${String(item.label)}-${index}`}
          item={item}
          className={itemClassName}
        />
      ))}
    </div>
  );
}
