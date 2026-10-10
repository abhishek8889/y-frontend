import type { ReactNode, SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "prefix"> & {
  label?: string;
  labelClassName?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  prefix?: ReactNode;
  containerClassName?: string;
  wrapperClassName?: string;
  density?: "default" | "compact";
};

export function SelectField({
  label,
  labelClassName = "",
  error,
  options,
  placeholder,
  prefix,
  className = "",
  containerClassName = "",
  wrapperClassName = "",
  density = "default",
  id,
  ...props
}: SelectFieldProps) {
  const selectId = id ?? props.name;
  const errorId = selectId ? `${selectId}-error` : undefined;

  return (
    <div className={`flex flex-col gap-[6px] ${wrapperClassName}`.trim()}>
      {label ? (
        <label htmlFor={selectId} className={`text-[16px] font-bold uppercase leading-[24px] text-black ${labelClassName}`.trim()}>
          {label}
        </label>
      ) : null}

      <div className={`relative flex ${density === "compact" ? "h-10" : "h-[48px]"} items-center overflow-hidden bg-white ${containerClassName}`.trim()}>
        {prefix ? <span className="mr-2 flex items-center pl-5">{prefix}</span> : null}

        <select
          id={selectId}
          {...props}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-full w-full appearance-none border rounded-[4px] ${
            error ? "border-[#d32f2f]" : "border-black"
          } bg-transparent px-5 pr-12 text-[14px] font-normal leading-[20px] text-black outline-none focus:outline-none ${className}`.trim()}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[44px] items-center justify-center">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0.664062 0.664062L4.66406 4.66406L8.66406 0.664062" stroke="black" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1 text-[12px] leading-[18px] text-[#d32f2f]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
