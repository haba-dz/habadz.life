import { cn } from "@/lib/utils";

import { FOCUS_RING } from "./focus";

/**
 * Form controls. design.md §3.11
 *
 * Deliberately not a rewrite of components/ui/input.tsx — that file is shared
 * with /admin. These wrap the native elements with the site's own metrics
 * (11px/14px padding, 14.5px text, square, hairline border).
 */
const controlClass = cn(
  "w-full border border-haba-border bg-haba-surface px-3.5 py-[11px] text-[14.5px] text-haba-ink placeholder:text-haba-muted",
  FOCUS_RING,
);

export function FieldLabel({
  required,
  className,
  children,
  ...props
}: React.ComponentProps<"label"> & { required?: boolean }) {
  return (
    <label
      className={cn("mb-1.5 block text-[13px] font-semibold text-haba-ink-2", className)}
      {...props}
    >
      {children}
      {required && <span aria-hidden> *</span>}
    </label>
  );
}

export function FieldInput({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(controlClass, className)} {...props} />;
}

/**
 * Phone and other latin-numeral inputs. Sets dir="ltr" so the number reads
 * correctly inside an RTL form — this is a genuine LTR run, not a locale-aware
 * edge, so it is written unconditionally. design.md §3.11
 */
export function FieldPhoneInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type="tel"
      inputMode="tel"
      dir="ltr"
      className={cn(controlClass, "text-left", className)}
      {...props}
    />
  );
}

export function FieldSelect({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn(controlClass, className)} {...props} />;
}

export function FieldTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea rows={3} className={cn(controlClass, className)} {...props} />;
}

/** Label + control + optional error, the usual pairing. */
export function Field({
  label,
  required,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={htmlFor} required={required}>
        {label}
      </FieldLabel>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-haba-muted">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs font-semibold text-haba-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export { controlClass };
