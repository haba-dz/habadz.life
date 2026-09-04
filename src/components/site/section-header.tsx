import Link from "next/link";

import { cn } from "@/lib/utils";

import { Icon, type IconName } from "@/components/icons";
import { Eyebrow } from "./eyebrow";

/**
 * Numbered eyebrow + icon heading on one side, a trailing link or a caption on
 * the other. design.md §3.10
 *
 * On mobile the eyebrow drops away and the heading shrinks — matching the
 * mobile artboard, which leads with the heading alone.
 */
export function SectionHeader({
  index,
  eyebrow,
  icon,
  title,
  action,
  caption,
  className,
}: {
  index?: number;
  eyebrow?: React.ReactNode;
  icon?: IconName;
  title: React.ReactNode;
  action?: { href: string; label: React.ReactNode; icon?: IconName };
  caption?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 desktop:mb-5",
        className,
      )}
    >
      <div>
        {eyebrow && (
          <Eyebrow index={index} className="mb-1.5 hidden desktop:block">
            {eyebrow}
          </Eyebrow>
        )}
        <h2 className="flex items-center gap-2.5 font-bold leading-tight text-haba-forest text-[21px] desktop:gap-3 desktop:text-[clamp(23px,3.4vw,36px)]">
          {icon && <Icon name={icon} size={26} className="text-haba-green" />}
          {title}
        </h2>
      </div>

      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-haba-green hover:text-haba-green-dark desktop:text-sm"
        >
          {action.icon && <Icon name={action.icon} size={16} />}
          {action.label} <span aria-hidden>←</span>
        </Link>
      )}

      {!action && caption && (
        <span className="text-[13px] text-haba-muted desktop:text-sm">{caption}</span>
      )}
    </div>
  );
}
