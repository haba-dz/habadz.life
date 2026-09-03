"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Info, Share2, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/shared/link-button";
import { PriorityBadge } from "@/components/shared/priority-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatQuantity, formatRelativeTime, getCategoryName, getUnitLabel } from "@/lib/constants";
import { CategoryIcon } from "@/components/shared/category-icon";
import { splitNeedNotes } from "@/lib/notes";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";
import type { AvailableLocale } from "@/i18n/locales";

type Need = Database["public"]["Tables"]["needs"]["Row"] & {
  categories: { slug: string; name_ar: string; default_unit: string } | null;
};

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
  const wilayaText = isFr ? `Wilaya de ${need.wilaya}` : `ولاية ${need.wilaya}`;

  async function share() {
    const text = `${title} — ${need.commune}، ${wilayaText}`;
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
      <Card
        onClick={() => setOpen(true)}
        className={cn(
          "group h-full cursor-pointer transition-all",
          "hover:-translate-y-0.5 hover:border-algeria-green/50 hover:shadow-md",
        )}
      >
        <CardContent className="flex h-full flex-col gap-3 px-5">
          <div className="flex items-start justify-between gap-2">
            <PriorityBadge priority={need.priority} locale={locale} />
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(need.updated_at, locale)}
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-algeria-green/10 text-algeria-green">
              <CategoryIcon slug={need.categories?.slug} className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-bold leading-tight">{title}</p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                {need.commune}، {wilayaText}
              </p>
            </div>
          </div>

          {hasQuantities ? (
            <div className="mt-1 space-y-2">
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/60 p-3 text-center">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {isFr ? "Besoin" : "الاحتياج"}
                  </p>
                  <p className="text-sm font-bold tabular-nums">{formatQuantity(needed, locale)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {isFr ? "Disponible" : "المتوفر"}
                  </p>
                  <p className="text-sm font-bold tabular-nums">{formatQuantity(available, locale)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {isFr ? "Manque" : "النقص"}
                  </p>
                  <p className="text-sm font-bold tabular-nums text-priority-critical">
                    {formatQuantity(deficit, locale)}
                  </p>
                </div>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={coverage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="نسبة تغطية الاحتياج"
              >
                <div
                  className="h-full rounded-full bg-algeria-green transition-[width] duration-500"
                  style={{ width: `${coverage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isFr ? `Couvert à ${coverage}% · Unité : ${unit}` : `تمت تغطية ${coverage}% · الوحدة: ${unit}`}
              </p>
            </div>
          ) : (
            <div className="mt-1 flex items-start gap-2 rounded-lg bg-muted/60 p-3">
              <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {isFr
                  ? "Quantité non spécifiée — besoin signalé sur le terrain. Contactez le point de coordination avant tout envoi."
                  : "الكمية غير محددة — احتياج ميداني مُبلَّغ عنه. تواصل مع نقطة التنسيق لتحديد الكمية المناسبة قبل الإرسال."}
              </p>
            </div>
          )}

          <div className="mt-auto flex gap-2 pt-1">
            <LinkButton
              href={`/donate?category=${need.categories?.slug ?? ""}`}
              className="flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              {isFr ? "Je souhaite fournir cette aide" : "أريد توفير هذه الحاجة"}
            </LinkButton>
            <Button
              variant="outline"
              size="icon"
              aria-label={isFr ? "Partager" : "مشاركة"}
              onClick={(e) => {
                e.stopPropagation();
                void share();
              }}
            >
              {copied ? <Check className="size-4 text-algeria-green" /> : <Share2 className="size-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-algeria-green/10 text-algeria-green">
                <CategoryIcon slug={need.categories?.slug} className="size-4" />
              </span>
              <DialogTitle>{title}</DialogTitle>
            </div>
            <DialogDescription className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {need.commune}، {wilayaText}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={need.priority} locale={locale} />
            <span className="text-xs text-muted-foreground">
              {isFr ? "Dernière mise à jour " : "آخر تحديث "}
              {formatRelativeTime(need.updated_at, locale)}
            </span>
          </div>

          {hasQuantities && (
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/60 p-3 text-center">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{isFr ? "Besoin" : "الاحتياج"}</p>
                <p className="font-bold tabular-nums">
                  {formatQuantity(needed, locale)} {unit}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{isFr ? "Disponible" : "المتوفر"}</p>
                <p className="font-bold tabular-nums">{formatQuantity(available, locale)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{isFr ? "Manque" : "النقص"}</p>
                <p className="font-bold tabular-nums text-priority-critical">
                  {formatQuantity(deficit, locale)}
                </p>
              </div>
            </div>
          )}

          {detail && (
            <div className="rounded-lg border border-border p-3">
              <p className="mb-1 text-xs font-semibold text-muted-foreground">
                {isFr ? "Détails du terrain" : "تفاصيل ميدانية"}
              </p>
              <p className="text-sm leading-relaxed">{detail}</p>
            </div>
          )}

          {source && (
            <p className="text-xs text-muted-foreground">
              {isFr ? `Source : ${source}` : `المصدر: ${source}`}
            </p>
          )}

          <div className="flex gap-2">
            <LinkButton
              href={`/donate?category=${need.categories?.slug ?? ""}`}
              size="lg"
              className="flex-1"
            >
              {isFr ? "Je souhaite fournir cette aide" : "أريد توفير هذه الحاجة"}
            </LinkButton>
            <Button
              variant="outline"
              size="icon-lg"
              aria-label={isFr ? "Partager" : "مشاركة"}
              onClick={() => void share()}
            >
              {copied ? <Check className="size-4 text-algeria-green" /> : <Share2 className="size-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
