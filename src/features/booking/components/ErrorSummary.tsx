import { AlertCircle } from "lucide-react";

export function ErrorSummary({
  title,
  errors,
}: {
  title: string;
  errors: { field: string; message: string }[];
}) {
  if (errors.length === 0) return null;

  return (
    <div
      className="rounded-[24px] border border-error/30 bg-[rgba(154,61,61,0.06)] p-5"
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 text-error" size={18} aria-hidden="true" />
        <div>
          <h3 className="font-semibold text-text">{title}</h3>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            {errors.map((error) => (
              <li key={error.field}>
                <a href={`#${error.field}`} className="underline underline-offset-2">
                  {error.message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
