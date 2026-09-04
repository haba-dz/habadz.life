import { cn } from "@/lib/utils";

import { Icon, type IconName } from "@/components/icons";
import { Chip } from "./chip";

/** 1200px content column with the design gutter. design.md §2.3 */
export const SHELL = "mx-auto w-full max-w-[1200px] px-4 desktop:px-6";

/** Section vertical rhythm. design.md §2.3 */
export const SECTION = "pt-8 desktop:pt-[clamp(30px,4.8vw,64px)]";

/**
 * The white banner every inner page opens with: a bordered eyebrow, the page
 * title, and a lede. design.md §5.3–§5.8
 */
export function PageHero({
  eyebrow,
  eyebrowIcon,
  tone = "green",
  title,
  lede,
  children,
}: {
  eyebrow: React.ReactNode;
  eyebrowIcon?: IconName;
  tone?: "green" | "red";
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-haba-surface">
      <div
        className={cn(
          SHELL,
          "py-6 desktop:pt-[clamp(24px,3.4vw,44px)] desktop:pb-[clamp(24px,3vw,36px)]",
        )}
      >
        <Chip tone={tone} fill="outline" size="sm" className="desktop:px-3 desktop:text-[12.5px]">
          {eyebrowIcon && <Icon name={eyebrowIcon} size={16} />}
          {eyebrow}
        </Chip>

        <h1 className="mt-3 font-haba-display text-[26px] font-bold leading-tight text-haba-forest desktop:text-[clamp(26px,4.8vw,46px)]">
          {title}
        </h1>

        {lede && (
          <p className="mt-3 max-w-[760px] text-[14.5px] leading-relaxed text-haba-ink-2 desktop:text-[16.5px]">
            {lede}
          </p>
        )}

        {children}
      </div>
    </section>
  );
}
