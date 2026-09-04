import { cn } from "@/lib/utils";

import { Icon, type IconName } from "@/components/icons";
import type { AvailableLocale } from "@/i18n/locales";

export type UpdateItem = {
  id?: string;
  title: string;
  body?: string | null;
  source: string;
  url?: string | null;
  update_type?: string;
  published_at: string;
  wilaya?: string | null;
  authority?: string | null;
  is_urgent?: boolean | null;
};

/**
 * Official-source labelling, keyed on `source`.
 *
 * This is now the only copy: components/shared/official-update-card.tsx held a
 * second one in the pre-redesign visual language and was retired in step 7,
 * once /official-information had moved onto this card. The one remaining
 * parallel map is the free-text `inferAuthority` in
 * app/(site)/official-information/[id]/page.tsx, which keys on different input.
 */
const sources: Record<
  string,
  { ar: string; fr: string; icon: IconName; tone: "red" | "green" | "ink" | "amber" }
> = {
  protection_civile_jijel: { ar: "الحماية المدنية - جيجل", fr: "Protection Civile - Jijel", icon: "fire", tone: "red" },
  protection_civile: { ar: "الحماية المدنية", fr: "Protection Civile", icon: "fire", tone: "red" },
  gendarmerie: { ar: "الدرك الوطني", fr: "Gendarmerie Nationale", icon: "road-01", tone: "ink" },
  forets: { ar: "محافظة الغابات", fr: "Conservation des Forêts", icon: "tree-06", tone: "green" },
  police: { ar: "الأمن الوطني", fr: "Sûreté Nationale", icon: "police-badge", tone: "ink" },
  wilaya: { ar: "خلية الأزمة الولائية", fr: "Cellule de Crise", icon: "shield-01", tone: "green" },
  meteo: { ar: "الديوان الوطني للأرصاد الجوية", fr: "Office National de Météorologie", icon: "cloud-fast-wind", tone: "amber" },
};

const toneClass = {
  red: "text-haba-red",
  green: "text-haba-green",
  ink: "text-haba-ink",
  amber: "text-haba-amber",
} as const;

/** design.md §5.1(5) — also used by /official-information (§5.3). */
export function UpdateCard({
  item,
  locale,
  relativeTime,
  sourcePrefix,
  originalSourceLabel,
  compact = false,
  className,
}: {
  item: UpdateItem;
  locale: AvailableLocale;
  /** Pre-formatted; formatting needs the request's clock, not the card's. */
  relativeTime: string;
  sourcePrefix: string;
  originalSourceLabel: string;
  compact?: boolean;
  className?: string;
}) {
  const meta = sources[item.source];
  const name = meta ? meta[locale === "fr" ? "fr" : "ar"] : (item.authority ?? item.source);

  return (
    /*
      Flex column so the source row can be pushed to the bottom. The cards sit
      in a stretch row, so without this the "original source" link lands at a
      different height in every card, following whatever the body text does.
      No h-full: an explicit height cancels the flex stretch that gives the card
      the row's height in the first place.
    */
    <article
      className={cn("flex flex-col bg-haba-surface p-4 desktop:px-6 desktop:py-6", className)}
    >
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-haba-muted desktop:text-xs">
        <span className={cn("inline-flex items-center gap-1.5 font-bold", meta ? toneClass[meta.tone] : "text-haba-ink")}>
          {meta && <Icon name={meta.icon} size={16} />}
          {name}
        </span>
        <span aria-hidden>·</span>
        <span>{relativeTime}</span>
      </div>

      <h3 className="mt-2 text-[15.5px] font-bold leading-snug text-haba-ink desktop:text-[19px]">
        {item.title}
      </h3>

      {item.body && (
        <p className="mt-2 text-[13.5px] leading-relaxed text-haba-ink-2 desktop:text-[14.5px]">
          {item.body}
        </p>
      )}

      {!compact && (
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3 text-[13px]">
          <span className="text-haba-muted">
            {sourcePrefix}
            {name}
          </span>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-haba-green hover:text-haba-green-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-haba-green"
            >
              <Icon name="link-square-02" size={16} />
              {originalSourceLabel}
            </a>
          )}
        </div>
      )}
    </article>
  );
}
