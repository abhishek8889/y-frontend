import type { ReactNode, SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  prefix?: ReactNode;
}

export function SelectField({
  label,
  options,
  placeholder,
  prefix,
  className = "",
  id,
  ...props
}: SelectFieldProps) {
  const selectId = id ?? props.name;

  return (
    <div className="flex flex-col gap-[6px]">
      <label htmlFor={selectId} className="text-[16px] font-bold uppercase leading-[24px] text-black">
        {label}
      </label>

      <div className="relative flex h-[48px] items-center overflow-hidden rounded-[4px] border border-black bg-white">
        {prefix ? <span className="mr-2 flex items-center pl-5">{prefix}</span> : null}

        <select
          id={selectId}
          {...props}
          className={`h-full w-full appearance-none border-0 bg-transparent px-5 pr-12 text-[14px] font-normal leading-[20px] text-black outline-none focus:outline-none ${className}`.trim()}
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
<path d="M0.664062 0.664062L4.66406 4.66406L8.66406 0.664062" stroke="black" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
        </div>
      </div>
    </div>
  );
}
