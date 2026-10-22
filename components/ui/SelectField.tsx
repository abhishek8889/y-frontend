"use client";

import type { ReactNode } from "react";
import { SelectBox, type SelectBoxOption } from "@/components/ui/SelectBox";

interface SelectOption {
  value: string;
  label: string;
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
  value?: string | number;
  defaultValue?: string | number;
  disabled?: boolean;
  required?: boolean;
  "aria-label"?: string;
  onChange?: (event: { target: { name?: string; value: string } }) => void;
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
  id,
  name,
  value,
  defaultValue,
  disabled,
  required,
  onChange,
  "aria-label": ariaLabel,
}: SelectFieldProps) {
  const selectId = id ?? name;

  return (
    <div className={`flex flex-col gap-[6px] ${wrapperClassName}`.trim()}>
      {label ? (
        <label
          htmlFor={selectId}
          className={`text-[16px] font-bold uppercase leading-[24px] text-black ${labelClassName}`.trim()}
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
        disabled={disabled}
        required={required}
        className={className}
        containerClassName={containerClassName}
        aria-label={ariaLabel ?? label}
        onChange={onChange}
      />
    </div>
  );
}
