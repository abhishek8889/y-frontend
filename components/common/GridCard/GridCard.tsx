"use client";

import type { GridCardColumns, GridCardItem, GridCardProps } from "./types";

const columnClassMap: Record<GridCardColumns, string> = {
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
};

function GridCardCell({
  item,
  className = "",
}: {
  item: GridCardItem;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[82px] flex-col justify-center border border-black/100 bg-white p-[18px] ${className}`.trim()}
    >
      <div className="flex items-start gap-3">
        {item.icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-black/15 bg-black/[0.03] text-black">
            {item.icon}
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="font-heading flex items-center gap-2 text-[14px] leading-[20px] tracking-[0.5px] text-[#AAAAAC]">
            {item.indicatorColor ? (
              <span
                className="inline-block h-[7px] w-[7px] shrink-0 rounded-full"
                style={{ backgroundColor: item.indicatorColor }}
                aria-hidden="true"
              />
            ) : null}
            <span className="min-w-0">{item.label}</span>
          </p>

          <p className="mt-[6px] text-[22px] font-normal leading-[24px] tracking-[-0.05em] text-black">
            {item.value}
          </p>

          {item.description != null && item.description !== "" ? (
            <p className="mt-[10px] text-[14px] font-normal leading-[20px] text-[#9B9994]">
              {item.description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Overview metrics grid.
 * Pass a config array of items (label / value / optional description / icon),
 * same structural idea as Offthetree `listItems` + GridCard.
 */
export function GridCard({
  items,
  columns = 3,
  isLoading = false,
  emptyMessage = "No overview data available.",
  className = "",
  itemClassName = "",
}: GridCardProps) {
  const gridClass = [
    "grid gap-4 md:grid-cols-2 md:gap-6",
    columnClassMap[columns],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (isLoading) {
    return (
      <div className={gridClass} aria-busy="true" aria-live="polite">
        {Array.from({ length: columns }, (_, index) => (
          <div
            key={`grid-card-skeleton-${index}`}
            className={`min-h-[82px] animate-pulse border border-black/10 bg-black/[0.03] p-[18px] ${itemClassName}`.trim()}
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
      <div className="border border-black/100 px-4 py-8 text-center text-[13px] text-black/50">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {items.map((item, index) => (
        <GridCardCell
          key={item.id ?? `${String(item.label)}-${index}`}
          item={item}
          className={itemClassName}
        />
      ))}
    </div>
  );
}
