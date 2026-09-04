import { cn } from "@/lib/utils";

/**
 * Numbered section eyebrow — `01 — النشرة`. design.md §3.10
 * Hidden on mobile, where sections lead with the heading alone.
 */
export function Eyebrow({
  index,
  children,
  className,
}: {
  /** Zero-padded automatically: 1 renders as `01`. */
  index?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-xs font-semibold tracking-[0.5px] text-haba-green",
        className,
      )}
    >
      {index !== undefined && `${String(index).padStart(2, "0")} — `}
      {children}
    </div>
  );
}
