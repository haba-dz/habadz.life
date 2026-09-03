import { cn } from "@/lib/utils";

import { Icon, type IconName } from "@/components/icons";

const valueTone = {
  green: "text-haba-green",
  red: "text-haba-red",
  ink: "text-haba-ink",
  /** ≥24px only — the lighter amber fails contrast at small sizes. design.md §8.5 */
  amber: "text-haba-amber-bright",
} as const;

/**
 * Big number over an icon + label row, sat inside a HairlineGrid. design.md §3.9
 */
export function StatTile({
  value,
  label,
  icon,
  tone = "ink",
  /**
   * `inline` puts a small icon before the label (the hero panel, §5.9).
   * `end` pushes a large icon to the far side (the /official-information
   * counters, §5.3).
   */
  iconPlacement = "inline",
  className,
}: {
  value: React.ReactNode;
  label: React.ReactNode;
  icon?: IconName;
  tone?: keyof typeof valueTone;
  iconPlacement?: "inline" | "end";
  className?: string;
}) {
  const valueEl = (
    <div
      className={cn(
        "font-bold leading-none text-[30px] desktop:text-[clamp(28px,3.6vw,40px)]",
        valueTone[tone],
      )}
    >
      {value}
    </div>
  );

  if (iconPlacement === "end") {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 bg-haba-surface px-4 py-4 desktop:px-5 desktop:py-[22px]",
          className,
        )}
      >
        <div>
          {valueEl}
          <div className="mt-1.5 text-xs text-haba-ink-2 desktop:text-[13px]">{label}</div>
        </div>
        {icon && <Icon name={icon} size={26} className={valueTone[tone]} />}
      </div>
    );
  }

  return (
    <div className={cn("bg-haba-surface-2 px-4 py-4 desktop:px-[18px] desktop:py-5", className)}>
      {valueEl}
      <div className="mt-2 flex items-center gap-1.5 text-xs text-haba-ink-2 desktop:text-[13px]">
        {icon && <Icon name={icon} size={16} className="text-haba-muted" />}
        {label}
      </div>
    </div>
  );
}
