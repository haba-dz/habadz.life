import { cn } from "@/lib/utils";

/**
 * Numbered step card. Help, Donate and Volunteers each use exactly three.
 * design.md §3.12
 */
export function FormStep({
  step,
  title,
  caption,
  className,
  children,
}: {
  step: number;
  title: React.ReactNode;
  caption?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("border border-haba-border bg-haba-surface", className)}>
      <div className="flex items-start gap-3 border-b border-haba-border bg-haba-surface-2 px-4 py-4 desktop:px-[22px]">
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center bg-haba-green text-sm font-bold text-white"
        >
          {step}
        </span>
        <div>
          <h3 className="text-[17px] font-bold leading-snug text-haba-forest">{title}</h3>
          {caption && (
            <p className="mt-0.5 text-[12.5px] text-haba-muted">{caption}</p>
          )}
        </div>
      </div>
      <div className="p-4 desktop:p-[22px]">{children}</div>
    </section>
  );
}
