import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Field({
  label,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text">{label}</span>
      <input
        className={cn(
          "min-h-12 w-full rounded-2xl border border-stroke bg-surface px-4 text-base text-text outline-none transition focus:border-gold-deep focus:ring-2 focus:ring-gold-rich/20",
          error && "border-error",
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-2 block text-sm text-error">{error}</span> : null}
    </label>
  );
}

export function TextareaField({
  label,
  error,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text">{label}</span>
      <textarea
        className={cn(
          "min-h-28 w-full rounded-2xl border border-stroke bg-surface px-4 py-3 text-base text-text outline-none transition focus:border-gold-deep focus:ring-2 focus:ring-gold-rich/20",
          error && "border-error",
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-2 block text-sm text-error">{error}</span> : null}
    </label>
  );
}
