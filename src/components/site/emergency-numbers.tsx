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
  /*
   * A row count that is not a multiple of the column count leaves a hole in the
   * last row, which is what six items in a five-column grid looked like. The
   * count is derived from lib/emergency.ts and will change again when a contact
   * or a toll-free number is added, so stretch the final cell over whatever is
   * left instead of assuming six. Written as literal class names because that is
   * what Tailwind's scanner can see.
   */
  const lastSpan = cn(
    items.length % 2 === 1 && "min-[560px]:max-desktop:[&>*:last-child]:col-span-2",
    items.length % 3 === 1 && "desktop:[&>*:last-child]:col-span-3",
    items.length % 3 === 2 && "desktop:[&>*:last-child]:col-span-2",
  );

  return (
    <section className={className}>
      <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="flex items-center gap-2 text-[14.5px] font-bold text-haba-ink desktop:text-[15px]">
          <Icon name="call-ringing-02" size={18} className="text-haba-red" />
          {title}
        </h2>
        <p className="text-[13px] text-haba-muted">{note}</p>
      </div>

      {/*
        Fixed column counts rather than the artboard's auto-fit `minmax(195px,
        1fr)`. The artboard draws exactly five rows, which filled one line; the
        verified list carries six (it also has 1070 for forest fires), so
        auto-fit resolved to five columns and left the sixth cell alone beside
        four empty tracks. Three columns also stop the longer French names
        ("Direction Générale des Forêts") wrapping to three lines.
      */}
      <HairlineGrid className={cn("grid-cols-1 min-[560px]:grid-cols-2 desktop:grid-cols-3", lastSpan)}>
        {items.map((item) => (
          <a
            key={item.number}
            href={`tel:${item.number.replace(/\s/g, "")}`}
            className="flex items-center justify-between gap-4 bg-haba-surface px-4 py-3.5 text-haba-ink hover:bg-haba-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-haba-green desktop:px-5 desktop:py-[18px]"
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-snug">{item.name}</span>
              <span className="mt-0.5 block text-[11.5px] leading-snug text-haba-muted desktop:text-xs">
                {item.sub}
              </span>
            </span>
            <span
              dir="ltr"
              className={cn(
                "shrink-0 font-bold leading-none tabular-nums text-haba-red",
                "text-[26px] desktop:text-[30px]",
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
