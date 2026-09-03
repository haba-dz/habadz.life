import { cn } from "@/lib/utils";

import { Icon } from "@/components/icons";

/**
 * Amber advisory. design.md §3.16 — used once, at the top of /volunteers, to
 * explain why uncoordinated turnout hinders relief work.
 */
export function WarningBlock({
  title,
  children,
  className,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 border border-haba-amber-200 bg-haba-amber-50 px-5 py-[18px]",
        className,
      )}
    >
      <Icon name="alert-circle" size={20} className="mt-0.5 text-haba-amber" />
      <div>
        <p className="text-[15px] font-bold text-haba-amber-900">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-haba-ink-2">{children}</p>
      </div>
    </div>
  );
}
