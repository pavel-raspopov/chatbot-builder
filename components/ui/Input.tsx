import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type InputProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  error?: string;
};

export function Input({
  label,
  id,
  error,
  className = "",
  ...props
}: InputProps): ReactNode {
  const inputId = id ?? props.name;

  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-text-primary">
      <span>{label}</span>
      <input
        id={inputId}
        className={`rounded-md border border-border bg-surface px-3 py-2 text-base font-normal text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60 ${className}`.trim()}
        {...props}
      />
      {error ? <span className="text-sm font-normal text-error">{error}</span> : null}
    </label>
  );
}
