import { POINT_KINDS, type PointKind } from "@/components/map/point-kind";
import type { AvailableLocale } from "@/i18n/locales";

const ORDER: PointKind[] = ["shelter", "relief_hub", "collection_point"];

/** 10px squares under the map panel. design.md §5.5 */
export function MapLegend({ locale = "ar" }: { locale?: AvailableLocale }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-haba-ink-2">
      {ORDER.map((kind) => {
        const k = POINT_KINDS[kind];
        return (
          <li key={kind} className="flex items-center gap-2">
            <span aria-hidden className={`size-2.5 ${k.bg}`} />
            {k.label[locale] ?? k.label.ar}
          </li>
        );
      })}
    </ul>
  );
}
