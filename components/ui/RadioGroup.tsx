type RadioOption = {
  value: string;
  label: string;
};

type RadioGroupProps = {
  name: string;
  legend: string;
  labelClassName?: string;
  optionClassName?: string;
  className?: string;
  options: RadioOption[];
  defaultValue?: string;
  variant?: "list" | "pills";
};

export function RadioGroup({
  name,
  legend,
  labelClassName = "",
  optionClassName = "",
  className = "",
  options,
  defaultValue,
  variant = "list",
}: RadioGroupProps) {
  return (
    <fieldset className={className}>
      <legend className={`mb-1.5 text-[10px] font-bold uppercase leading-[13px] text-black ${labelClassName}`.trim()}>{legend}</legend>
      <div className={variant === "pills" ? "flex flex-wrap gap-3" : "flex flex-col gap-1.5"}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`${variant === "pills" ? "cursor-pointer" : "inline-flex items-center gap-2 text-[11px] font-normal text-black"} ${variant === "list" ? optionClassName : ""}`.trim()}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
              className={variant === "pills" ? "peer sr-only" : "h-3.5 w-3.5 accent-black"}
            />
            {variant === "pills" ? (
              <span className={`flex rounded min-h-[40px] min-w-[98px] items-center justify-center rounded-[3px] border border-[#999999] px-3 text-[10px] font-normal normal-case text-black peer-checked:border-black peer-checked:bg-black peer-checked:text-white ${variant === "pills" ? optionClassName : ""}`.trim()}>
                {option.label}
              </span>
            ) : option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}