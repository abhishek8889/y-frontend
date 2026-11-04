"use client";

type SwitchProps = {
  checked: boolean;
  onChange: () => void;
  label: string;
};

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="csp-switch"
      onClick={onChange}
    >
      <span className="csp-switch-knob" />
    </button>
  );
}
