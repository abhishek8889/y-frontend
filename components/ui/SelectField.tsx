"use client";

import type { ReactNode } from "react";
import { SelectBox, type SelectBoxOption } from "@/components/ui/SelectBox";

interface SelectOption {
  value: string;
  label: string;
  keywords?: string;
}

type SelectFieldProps = {
  id?: string;
  name?: string;
  label?: string;
  labelClassName?: string;
  options: SelectOption[];
  placeholder?: string;
  prefix?: ReactNode;
  containerClassName?: string;
  wrapperClassName?: string;
  className?: string;
  density?: "default" | "compact";
  searchable?: boolean;
  searchPlaceholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  disabled?: boolean;
  required?: boolean;
  "aria-label"?: string;
  onChange?: (event: { target: { name?: string; value: string } }) => void;
  onOpenChange?: (open: boolean) => void;
};

export function SelectField({
  label,
  labelClassName = "",
  options,
  placeholder,
  prefix,
  className = "",
  containerClassName = "",
  wrapperClassName = "",
  density = "default",
  searchable = false,
  searchPlaceholder,
  id,
  name,
  value,
  defaultValue,
  disabled,
  required,
  onChange,
  onOpenChange,
  "aria-label": ariaLabel,
}: SelectFieldProps) {
  const selectId = id ?? name;

  return (
    <div className={`flex flex-col gap-[6px] ${wrapperClassName}`.trim()}>
      {label ? (
        <label
          htmlFor={selectId}
          className={`input-heading text-[14px] font-normal capitalize leading-normal text-[#6f6e69] ${labelClassName}`.trim()}
        >
          {label}
        </label>
      ) : null}

      <SelectBox
        id={selectId}
        name={name}
        value={value}
        defaultValue={defaultValue}
        options={options as SelectBoxOption[]}
        placeholder={placeholder}
        prefix={prefix}
        density={density}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        disabled={disabled}
        required={required}
        className={className}
        containerClassName={`input-box ${density === "compact" ? "input-box-compact" : ""} ${containerClassName}`.trim()}
        aria-label={ariaLabel ?? label}
        onChange={onChange}
        onOpenChange={onOpenChange}
      />
    </div>
  );
}
