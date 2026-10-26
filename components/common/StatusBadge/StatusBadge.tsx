import { formatStatusLabel, statusBgClass, statusTextClass } from "@/lib/ui/statusColors";

type StatusBadgeProps = {
  status: string | null | undefined;
  label?: string;
  className?: string;
  showDot?: boolean;
};

export function StatusBadge({
  status,
  label,
  className = "",
  showDot = true,
}: StatusBadgeProps) {
  const textClass = statusTextClass(status);
  const displayLabel = label ?? formatStatusLabel(status);

  return (
    <span
      className={`inline-flex items-center gap-[9px] font-normal uppercase ${textClass} ${className}`.trim()}
    >
      {showDot ? (
        <span
          className={`h-[7px] w-[7px] shrink-0 rounded-full ${statusBgClass(status)}`}
          aria-hidden="true"
        />
      ) : null}
      {displayLabel}
    </span>
  );
}
