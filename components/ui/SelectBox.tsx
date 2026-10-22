"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

export type SelectBoxOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectChangeEvent = {
  target: {
    name?: string;
    value: string;
  };
};

export type SelectBoxProps = {
  id?: string;
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  options: SelectBoxOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  density?: "default" | "compact";
  prefix?: ReactNode;
  className?: string;
  containerClassName?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  onChange?: (event: SelectChangeEvent) => void;
};

export function SelectBox({
  id,
  name,
  value,
  defaultValue = "",
  options,
  placeholder,
  disabled = false,
  required = false,
  density = "default",
  prefix,
  className = "",
  containerClassName = "",
  onChange,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: SelectBoxProps) {
  const generatedId = useId();
  const listboxId = `${id ?? generatedId}-listbox`;
  const triggerId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? ""));
  const selectedValue = value !== undefined ? String(value) : internalValue;

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue) ?? null,
    [options, selectedValue],
  );

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function commitValue(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onChange?.({ target: { name, value: nextValue } });
    setOpen(false);
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
    }
  }

  const heightClass = density === "compact" ? "h-10" : "h-[48px]";
  const displayLabel = selectedOption?.label ?? placeholder ?? "Select";
  const isPlaceholder = !selectedOption;

  return (
    <div ref={rootRef} className="relative">
      {name ? <input type="hidden" name={name} value={selectedValue} required={required} /> : null}

      <button
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-required={required || undefined}
        onClick={() => {
          if (!disabled) setOpen((current) => !current);
        }}
        onKeyDown={handleTriggerKeyDown}
        className={`flex w-full ${heightClass} cursor-pointer items-center overflow-hidden rounded-[4px] border border-black bg-white text-left text-black outline-none transition hover:bg-black/[0.02] focus-visible:ring-1 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50 ${containerClassName} ${className}`.trim()}
      >
        {prefix ? <span className="mr-2 flex items-center pl-5">{prefix}</span> : null}
        <span
          className={`min-w-0 flex-1 truncate px-5 pr-2 text-[14px] leading-[20px] ${
            isPlaceholder ? "text-black/45" : "text-black"
          } ${prefix ? "!pl-0" : ""}`.trim()}
        >
          {displayLabel}
        </span>
        <span className="flex w-[44px] shrink-0 items-center justify-center" aria-hidden="true">
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            className={open ? "rotate-180" : undefined}
          >
            <path
              d="M0.664062 0.664062L4.66406 4.66406L8.66406 0.664062"
              stroke="black"
              strokeWidth="1.33333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={triggerId}
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-[80] max-h-[240px] overflow-auto rounded-[4px] border border-black bg-white py-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
        >
          {placeholder ? (
            <li
              role="option"
              aria-selected={!selectedOption}
              aria-disabled="true"
              className="cursor-default px-4 py-2 text-[13px] text-black/40"
            >
              {placeholder}
            </li>
          ) : null}
          {options.map((option) => {
            const isSelected = option.value === selectedValue;
            return (
              <li key={option.value} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => commitValue(option.value)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left text-[14px] leading-5 text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 ${
                    isSelected ? "bg-black/[0.04] font-medium" : ""
                  }`.trim()}
                >
                  <span className="min-w-0 flex-1">{option.label}</span>
                  {isSelected ? <span aria-hidden="true">✓</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
