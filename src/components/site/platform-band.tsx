import { cn } from "@/lib/utils";

import { StatusDot } from "./chip";

/**
 * The strip above the header. design.md §3.3
 *
 * It states plainly that the platform is independent and non-governmental —
 * the same thing the footer says. The artboards put
 * "الجمهورية الجزائرية — منصة التضامن الوطني" here, which claims state
 * affiliation the footer denies; see design.md §0.1 for why that was dropped.
 *
 * `alertLevel` and `updatedAt` are optional on purpose. The artboards show a
 * hardcoded "حالة تأهب: مرتفعة · تحديث 16:55"; rendering a fabricated alert
 * level or update time on a disaster platform is worse than showing neither.
 * Pass them once a real source exists (design.md §8.2).
 */
export function PlatformBand({
  independence,
  independenceShort,
  emergencyLabel,
  alertLevel,
  updatedAt,
  languageSwitcher,
  className,
}: {
  independence: string;
  independenceShort: string;
  emergencyLabel: string;
  alertLevel?: string;
  updatedAt?: string;
  languageSwitcher?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-haba-forest text-haba-green-50 max-desktop:hidden",
        className,
      )}
    >
      <div className="mx-auto flex h-9 max-w-[1200px] items-center justify-between gap-4 px-4 text-[12.5px] desktop:px-6">
        <div className="flex min-w-0 items-center gap-5">
          <span className="truncate font-semibold text-white">
            {/* The disclaimer is the load-bearing half — it survives the squeeze. */}
            <span className="max-wide:hidden">{independence}</span>
            <span className="wide:hidden">{independenceShort}</span>
          </span>
          {updatedAt && <span className="shrink-0 max-wide:hidden">{updatedAt}</span>}
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {alertLevel && (
            <span className="flex items-center gap-1.5">
              <StatusDot tone="red" />
              {alertLevel}
            </span>
          )}
          {languageSwitcher}
          <span dir="ltr" className="max-wide:hidden">
            {emergencyLabel}: 14 · 1021
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile equivalent, ≤860px. design.md §3.3 — carries no affiliation claim, so
 * it stays as the artboard drew it apart from the optional alert level.
 */
export function StatusBand({
  alertLevel,
  updatedAt,
  languageSwitcher,
  emergencyLabel,
}: {
  alertLevel?: string;
  updatedAt?: string;
  languageSwitcher?: React.ReactNode;
  emergencyLabel: string;
}) {
  return (
    <div className="bg-haba-forest px-4 py-[7px] text-[11.5px] text-haba-green-50 desktop:hidden">
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          {alertLevel ? (
            <>
              <StatusDot tone="red" />
              {alertLevel}
              {updatedAt && <span className="opacity-80">· {updatedAt}</span>}
            </>
          ) : (
            <span dir="ltr">{emergencyLabel}: 14 · 1021</span>
          )}
        </span>
        {languageSwitcher}
      </div>
    </div>
  );
}
