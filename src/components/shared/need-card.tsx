"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/icons";
import { Action, Chip, FOCUS_RING } from "@/components/site";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  formatQuantity,
  formatRelativeTime,
  getCategoryName,
  getPriorityLabel,
  getUnitLabel,
} from "@/lib/constants";
import { CategoryIcon } from "@/components/shared/category-icon";
import { splitNeedNotes } from "@/lib/notes";
import { formatPlace } from "@/lib/algeria-cities";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";
import type { AvailableLocale } from "@/i18n/locales";

type Need = Database["public"]["Tables"]["needs"]["Row"] & {
  categories: { slug: string; name_ar: string; default_unit: string } | null;
};

/**
 * components/shared/priority-badge.tsx is imported by /admin, so it is not
 * restyled. The site renders the same information through its own Chip.
 * design.md §7.2
 */
const priorityTone = {
  critical: "red",
  high: "red",
  medium: "amber",
  low: "neutral",
} as const;

const priorityFill = {
  critical: "solid",
  high: "tint",
  medium: "tint",
  low: "tint",
} as const;

export function NeedCard({
  need,
  locale = "ar",
}: {
  need: Need;
  locale?: AvailableLocale;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current !== null) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const needed = Number(need.quantity_needed);
  const available = Number(need.quantity_available);
  const deficit = Math.max(0, needed - available);
  const hasQuantities = needed > 0;
  const coverage = hasQuantities ? Math.min(100, Math.round((available / needed) * 100)) : 0;

  const isFr = locale === "fr";
  const unit = getUnitLabel(need.unit, locale);
  const title =
    need.title ||
    (need.categories ? getCategoryName(need.categories.slug, need.categories.name_ar, locale) : (isFr ? "Besoin" : "احتياج"));
  const { detail, source } = splitNeedNotes(need.notes);
  const placeText = formatPlace(need.commune, need.wilaya, locale);

  async function share() {
    const text = `${title} — ${placeText}`;
    const url = typeof window !== "undefined" ? `${window.location.origin}/needs` : "";
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setCopied(true);
        if (copiedTimeoutRef.current !== null) clearTimeout(copiedTimeoutRef.current);
        copiedTimeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* User cancelled */
    }
  }

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className={cn(
          "group flex h-full cursor-pointer flex-col gap-3 border border-haba-border bg-haba-surface p-4",
          "transition-colors hover:border-haba-green desktop:p-5",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <Chip
            tone={priorityTone[need.priority]}
            fill={priorityFill[need.priority]}
            size="xs"
          >
            {getPriorityLabel(need.priority, locale)}
          </Chip>
          <span className="text-[12.5px] text-haba-muted">
            {formatRelativeTime(need.updated_at, locale)}
          </span>
        </div>

        <div className="flex items-start gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center bg-haba-green-tint text-haba-green">
            <CategoryIcon slug={need.categories?.slug} className="size-5" />
          </span>
          <div className="min-w-0">
            {/*
              The card opens a dialog on click. A <div onClick> has no keyboard
              path, so the title is the real control. design.md §8.5
            */}
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
              className={cn(
                "text-start font-bold leading-tight text-haba-ink group-hover:text-haba-green",
                FOCUS_RING,
              )}
            >
              {title}
            </button>
            <p className="flex items-center gap-1 text-[13.5px] text-haba-muted">
              <Icon name="location-01" size={13} className="shrink-0" />
              {placeText}
            </p>
          </div>
        </div>

        {hasQuantities ? (
          <div className="mt-1 flex flex-col gap-2">
            <div className="grid grid-cols-3 border border-haba-border text-center">
              <div className="border-e border-haba-border p-2.5">
                <p className="text-[11.5px] font-semibold text-haba-muted">
                  {isFr ? "Besoin" : "الاحتياج"}
                </p>
                <p className="text-sm font-bold tabular-nums text-haba-ink">
                  {formatQuantity(needed, locale)}
                </p>
              </div>
              <div className="border-e border-haba-border p-2.5">
                <p className="text-[11.5px] font-semibold text-haba-muted">
                  {isFr ? "Disponible" : "المتوفر"}
                </p>
                <p className="text-sm font-bold tabular-nums text-haba-ink">
                  {formatQuantity(available, locale)}
                </p>
              </div>
              <div className="p-2.5">
                <p className="text-[11.5px] font-semibold text-haba-muted">
                  {isFr ? "Manque" : "النقص"}
                </p>
                <p className="text-sm font-bold tabular-nums text-haba-red">
                  {formatQuantity(deficit, locale)}
                </p>
              </div>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden bg-haba-surface-2"
              role="progressbar"
              aria-valuenow={coverage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={isFr ? "Taux de couverture du besoin" : "نسبة تغطية الاحتياج"}
            >
              <div
                className="h-full bg-haba-green transition-[width] duration-500"
                style={{ width: `${coverage}%` }}
              />
            </div>
            <p className="text-[12.5px] text-haba-muted">
              {isFr
                ? `Couvert à ${coverage}% · Unité : ${unit}`
                : `تمت تغطية ${coverage}% · الوحدة: ${unit}`}
            </p>
          </div>
        ) : (
          <div className="mt-1 flex items-start gap-2 border border-haba-border bg-haba-surface-2 p-3">
            <Icon name="alert-circle" size={15} className="mt-0.5 shrink-0 text-haba-muted" />
            <p className="text-[12.5px] leading-relaxed text-haba-ink-2">
              {isFr
                ? "Quantité non spécifiée — besoin signalé sur le terrain. Contactez le point de coordination avant tout envoi."
                : "الكمية غير محددة — احتياج ميداني مُبلَّغ عنه. تواصل مع نقطة التنسيق لتحديد الكمية المناسبة قبل الإرسال."}
            </p>
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-1">
          <Action
            href={`/donate?category=${need.categories?.slug ?? ""}`}
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            {isFr ? "Je souhaite fournir cette aide" : "أريد توفير هذه الحاجة"}
          </Action>
          <button
            type="button"
            aria-label={isFr ? "Partager" : "مشاركة"}
            onClick={(e) => {
              e.stopPropagation();
              void share();
            }}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center border border-haba-border text-haba-ink hover:border-haba-green hover:text-haba-green",
              FOCUS_RING,
            )}
          >
            <Icon name={copied ? "user-check-01" : "sent"} size={16} />
          </button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-none sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center bg-haba-green-tint text-haba-green">
                <CategoryIcon slug={need.categories?.slug} className="size-4" />
              </span>
              <DialogTitle>{title}</DialogTitle>
            </div>
            <DialogDescription className="flex items-center gap-1">
              <Icon name="location-01" size={14} />
              {placeText}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2">
            <Chip tone={priorityTone[need.priority]} fill={priorityFill[need.priority]} size="xs">
              {getPriorityLabel(need.priority, locale)}
            </Chip>
            <span className="text-[12.5px] text-haba-muted">
              {isFr ? "Dernière mise à jour " : "آخر تحديث "}
              {formatRelativeTime(need.updated_at, locale)}
            </span>
          </div>

          {hasQuantities && (
            <div className="grid grid-cols-3 border border-haba-border text-center">
              <div className="border-e border-haba-border p-3">
                <p className="text-[11.5px] font-semibold text-haba-muted">{isFr ? "Besoin" : "الاحتياج"}</p>
                <p className="font-bold tabular-nums text-haba-ink">
                  {formatQuantity(needed, locale)} {unit}
                </p>
              </div>
              <div className="border-e border-haba-border p-3">
                <p className="text-[11.5px] font-semibold text-haba-muted">{isFr ? "Disponible" : "المتوفر"}</p>
                <p className="font-bold tabular-nums text-haba-ink">{formatQuantity(available, locale)}</p>
              </div>
              <div className="p-3">
                <p className="text-[11.5px] font-semibold text-haba-muted">{isFr ? "Manque" : "النقص"}</p>
                <p className="font-bold tabular-nums text-haba-red">
                  {formatQuantity(deficit, locale)}
                </p>
              </div>
            </div>
          )}

          {detail && (
            <div className="border border-haba-border bg-haba-surface-2 p-3">
              <p className="mb-1 text-[11.5px] font-semibold text-haba-muted">
                {isFr ? "Détails du terrain" : "تفاصيل ميدانية"}
              </p>
              <p className="text-sm leading-relaxed text-haba-ink">{detail}</p>
            </div>
          )}

          {source && (
            <p className="text-[12.5px] text-haba-muted">
              {isFr ? `Source : ${source}` : `المصدر: ${source}`}
            </p>
          )}

          <div className="flex gap-2">
            <Action
              href={`/donate?category=${need.categories?.slug ?? ""}`}
              variant="primary"
              size="md"
              className="flex-1"
            >
              {isFr ? "Je souhaite fournir cette aide" : "أريد توفير هذه الحاجة"}
            </Action>
            <button
              type="button"
              aria-label={isFr ? "Partager" : "مشاركة"}
              onClick={() => void share()}
              className={cn(
                "flex size-11 shrink-0 items-center justify-center border border-haba-border text-haba-ink hover:border-haba-green hover:text-haba-green",
                FOCUS_RING,
              )}
            >
              <Icon name={copied ? "user-check-01" : "sent"} size={18} />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
