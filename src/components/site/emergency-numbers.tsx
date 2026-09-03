import { cn } from "@/lib/utils";

import { Icon } from "@/components/icons";
import { HairlineGrid } from "./hairline-grid";

export type EmergencyNumber = {
  /** Dialled as-is. Latin numerals, rendered LTR. */
  number: string;
  name: React.ReactNode;
  sub: React.ReactNode;
};

/**
 * National emergency numbers. Sits above the footer on every page. design.md §3.17
 *
 * Each cell is a tel: link — the mobile artboard makes them tappable and there
 * is no reason for desktop to be worse. The note is load-bearing: these numbers
 * reach the emergency services directly, not this platform.
 */
export function EmergencyNumbers({
  title,
  note,
  items,
  className,
}: {
  title: React.ReactNode;
  note: React.ReactNode;
  items: EmergencyNumber[];
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="flex items-center gap-2 text-[14.5px] font-bold text-haba-ink desktop:text-[15px]">
          <Icon name="call-ringing-02" size={18} className="text-haba-red" />
          {title}
        </h2>
        <p className="text-[13px] text-haba-muted">{note}</p>
      </div>

      <HairlineGrid min={195}>
        {items.map((item) => (
          <a
            key={item.number}
            href={`tel:${item.number.replace(/\s/g, "")}`}
            className="flex items-center justify-between gap-3 bg-haba-surface px-4 py-3.5 text-haba-ink hover:bg-haba-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-haba-green desktop:px-5 desktop:py-[18px]"
          >
            <span>
              <span className="block text-sm font-semibold">{item.name}</span>
              <span className="block text-[11.5px] text-haba-muted desktop:text-xs">
                {item.sub}
              </span>
            </span>
            <span
              dir="ltr"
              className={cn(
                "font-bold leading-none text-haba-red text-[26px] desktop:text-[30px]",
              )}
            >
              {item.number}
            </span>
          </a>
        ))}
      </HairlineGrid>
    </section>
  );
}
