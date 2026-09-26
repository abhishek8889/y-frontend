import type { InputHTMLAttributes, ReactNode } from "react";

type InputType = InputHTMLAttributes<HTMLInputElement>["type"];

type InputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "prefix" | "type"> & {
  label: string;
  type?: InputType;
  prefix?: ReactNode;
  suffix?: ReactNode;
  containerClassName?: string;
};

export function InputField({
  label,
  id,
  type = "text",
  prefix,
  suffix,
  className = "",
  containerClassName = "",
  ...props
}: InputFieldProps) {
  const inputId = id ?? props.name;

  return (
    <div className="mb-0">
      <label
        htmlFor={inputId}
        className="text-[16px] mb-[6px] block font-bold uppercase leading-[24px] tracking-[0px] text-black"
      >
        {label}
      </label>

      <div
        className={`flex h-[48px] items-center rounded-[4px] border border-black bg-white transition focus-within:ring-1 focus-within:ring-black ${containerClassName}`.trim()}
      >
        {prefix ? <span className="mr-2 flex items-center">{prefix}</span> : null}

        <input
          id={inputId}
          type={type}
          {...props}
          className={`h-full w-full border-0 bg-transparent px-5 text-[14px] font-normal leading-[20px] text-black placeholder:text-black/60 focus:outline-none ${className}`.trim()}
        />

        {suffix ? <span className="mr-6 flex items-center">{suffix}</span> : null}
      </div>
    </div>
  );
}
