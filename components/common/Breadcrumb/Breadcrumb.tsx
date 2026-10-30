import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  /** Prefer over href when staying on the same client view (e.g. list ↔ detail). */
  onClick?: () => void;
};

export type BreadcrumbVariant = "bar" | "dashboard";

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  /**
   * `bar` — full-bleed Balenciaga strip (public pages).
   * `dashboard` — inline trail above organiser page titles.
   */
  variant?: BreadcrumbVariant;
  className?: string;
};

export function Breadcrumb({
  items,
  variant = "bar",
  className = "",
}: BreadcrumbProps) {
  if (!items.length) return null;

  const isDashboard = variant === "dashboard";

  const navClass = isDashboard
    ? "dashboard-breadcrumb flex items-center overflow-hidden text-[12px] font-normal uppercase leading-none tracking-[0.04em] text-black"
    : "public-bar flex items-center overflow-hidden border-b border-black bg-white px-4 text-[10px] uppercase tracking-[0.04em] text-black sm:px-5 sm:text-[11px] sm:tracking-[0.08em]";

  const crumbClass =
    "breadcrumb-crumb truncate border-0 bg-transparent p-0 font-[inherit] text-[length:inherit] leading-[inherit] tracking-[inherit] text-inherit uppercase";

  return (
    <nav aria-label="Breadcrumb" className={`${navClass} ${className}`.trim()}>
      <ol className="flex min-w-0 items-center">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className={`flex items-center ${isLast ? "min-w-0 shrink" : "shrink-0"}`}
            >
              {index > 0 ? (
                <span
                  className={`breadcrumb-sep shrink-0 ${isDashboard ? "px-2" : "px-1.5 sm:px-2"}`}
                  aria-hidden="true"
                >
                  /
                </span>
              ) : null}
              {item.onClick && !isLast ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className={`${crumbClass} breadcrumb-link cursor-pointer transition hover:opacity-60`}
                >
                  {item.label}
                </button>
              ) : item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={`${crumbClass} breadcrumb-link transition hover:opacity-60`}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`${crumbClass} breadcrumb-current`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
