import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type SharedProps = {
  label?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  prefixClassName?: string;
  suffixClassName?: string;
  containerClassName?: string;
  density?: "default" | "compact";
  as?: "input" | "textarea";
};

type InputFieldProps = SharedProps &
  (
    | ({ as?: "input" } & InputHTMLAttributes<HTMLInputElement>)
    | ({ as: "textarea" } & TextareaHTMLAttributes<HTMLTextAreaElement>)
  );

export function InputField(props: InputFieldProps) {
  const {
    label,
    id,
    as = "input",
    prefix,
    suffix,
    prefixClassName = "ml-5 mr-2",
    suffixClassName = "mr-6",
    className = "",
    containerClassName = "",
    density = "default",
  } = props;
  const inputId = id ?? (typeof props.name === "string" ? props.name : undefined);
  const isTextarea = as === "textarea";
  const type = "type" in props ? props.type ?? "text" : "text";
  const rows = "rows" in props ? props.rows : undefined;

  return (
    <div className="mb-0">
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-[6px] block text-[16px] font-bold uppercase leading-[24px] tracking-[0px] text-black"
        >
          {label}
        </label>
      ) : null}

      <div
        className={`flex rounded-[4px] border border-black bg-white transition focus-within:ring-1 focus-within:ring-black ${
          isTextarea ? "min-h-[140px] p-0" : density === "compact" ? "h-10 items-center" : "h-[48px] items-center"
        } ${containerClassName}`.trim()}
      >
        {prefix ? <span className={`flex items-center ${prefixClassName}`}>{prefix}</span> : null}

        {isTextarea ? (
          <textarea
            id={inputId}
            rows={rows ?? 4}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            className={`w-full resize-none border-0 bg-transparent px-5 py-3 text-[14px] font-normal leading-[20px] text-black placeholder:text-black/60 focus:outline-none ${className}`.trim()}
          />
        ) : (
          <>
            <input
              id={inputId}
              type={type}
              {...(props as InputHTMLAttributes<HTMLInputElement>)}
              className={`h-full w-full border-0 bg-transparent px-5 text-[14px] font-normal leading-[20px] text-black placeholder:text-black/60 focus:outline-none ${className}`.trim()}
            />
            {suffix ? <span className={`flex items-center ${suffixClassName}`}>{suffix}</span> : null}
          </>
        )}
      </div>
    </div>
  );
}
