"use client";

import { useState } from "react";

import { Icon } from "@/components/icons";
import {
  POINT_KINDS,
  getKindLabel,
  pointStatusTone,
  verificationTone,
} from "@/components/map/point-kind";
import { actionVariants, Chip, FOCUS_RING, StatusDot } from "@/components/site";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { splitNeedNotes } from "@/lib/notes";
import {
  getCategoryName,
  getPointStatusLabel,
  getVerificationLabel,
  type PointStatus,
  type VerificationLevel,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AvailableLocale } from "@/i18n/locales";

export interface PointCardData {
  id: string;
  kind: "collection_point" | "relief_hub" | "shelter";
  name: string;
  wilaya: string;
  commune: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  openingHours: string | null;
  capacityNote?: string | null;
  acceptedCategories?: string[];
  status: PointStatus;
  verificationLevel: VerificationLevel;
  notes: string | null;
}

function directionsUrl(point: PointCardData) {
  return point.lat != null && point.lng != null
    ? `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${point.name} ${point.commune} ${point.wilaya}`,
      )}`;
}

/**
 * Centre card — the `البطاقات` view of /map. design.md §5.5
 *
 * Flat and hairline like the rest of the system: no Card, no shadow, no lift on
 * hover. The whole card is not a button; the title is, so the phone and
 * directions links inside it stay reachable and there is no nested control.
 */
export function PointCard({
  point,
  locale = "ar",
  isSelected = false,
  onShowOnMap,
  className,
}: {
  point: PointCardData;
  locale?: AvailableLocale;
  isSelected?: boolean;
  onShowOnMap?: (point: PointCardData) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { detail, source } = splitNeedNotes(point.notes);
  const isFr = locale === "fr";
  const kind = POINT_KINDS[point.kind];
  const wilayaText = isFr ? `Wilaya de ${point.wilaya}` : `ولاية ${point.wilaya}`;

  return (
    <>
      <div
        className={cn(
          "flex h-full flex-col justify-between gap-3 border p-4",
          isSelected
            ? "border-haba-green bg-haba-green-tint"
            : "border-haba-border bg-haba-surface",
          className,
        )}
      >
        <div>
          <div className="flex items-start justify-between gap-2">
            <Chip tone={kind.tone} fill="tint" size="xs">
              <Icon name={kind.icon} size={12} />
              {getKindLabel(point.kind, locale)}
            </Chip>
            <span className="flex items-center gap-1.5 text-[12px] text-haba-muted">
              <StatusDot tone={pointStatusTone[point.status]} />
              {getPointStatusLabel(point.status, locale)}
            </span>
          </div>

          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
            className={cn(
              "mt-2 block text-start text-[15px] font-bold leading-snug text-haba-ink hover:text-haba-green",
              FOCUS_RING,
            )}
          >
            {point.name}
          </button>

          <p className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-relaxed text-haba-ink-2">
            <Icon name="location-01" size={14} className="mt-0.5 text-haba-muted" />
            {point.address ?? `${point.commune}، ${wilayaText}`}
          </p>

          {point.openingHours && (
            <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-haba-muted">
              <Icon name="clock-01" size={14} />
              {point.openingHours}
            </p>
          )}

          {point.acceptedCategories && point.acceptedCategories.length > 0 && (
            <p className="mt-2 text-[12.5px] leading-relaxed text-haba-muted">
              <span className="font-semibold text-haba-ink-2">
                {isFr ? "Accepte : " : "يقبل: "}
              </span>
              {point.acceptedCategories
                .map((slug) => getCategoryName(slug, slug, locale))
                .join("، ")}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-haba-border pt-3">
          <Chip tone={verificationTone[point.verificationLevel]} fill="outline" size="xs">
            {getVerificationLabel(point.verificationLevel, locale)}
          </Chip>

          <div className="flex items-center gap-3">
            {onShowOnMap && point.lat !== null && point.lng !== null && (
              <button
                type="button"
                onClick={() => onShowOnMap(point)}
                className={cn(
                  "inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-haba-ink-2 hover:text-haba-green",
                  FOCUS_RING,
                )}
              >
                <Icon name="maps" size={14} />
                {isFr ? "Carte" : "الخريطة"}
              </button>
            )}

            {point.phone && (
              <a
                href={`tel:${point.phone.replace(/\s/g, "")}`}
                dir="ltr"
                className={cn(
                  "inline-flex items-center gap-1.5 text-[13px] font-bold text-haba-green hover:underline",
                  FOCUS_RING,
                )}
              >
                <Icon name="call-02" size={14} />
                {point.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-none border-haba-border sm:max-w-md">
          <DialogHeader>
            <Chip tone={kind.tone} fill="tint" size="xs">
              <Icon name={kind.icon} size={12} />
              {getKindLabel(point.kind, locale)}
            </Chip>
            <DialogTitle className="text-[19px] font-bold text-haba-forest">
              {point.name}
            </DialogTitle>
            <DialogDescription className="flex items-start gap-1.5 text-[13.5px] text-haba-ink-2">
              <Icon name="location-01" size={14} className="mt-0.5 shrink-0 text-haba-muted" />
              {point.address ?? `${point.commune}، ${wilayaText}`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2">
            <Chip tone={pointStatusTone[point.status]} fill="tint" size="xs">
              {getPointStatusLabel(point.status, locale)}
            </Chip>
            <Chip tone={verificationTone[point.verificationLevel]} fill="outline" size="xs">
              {getVerificationLabel(point.verificationLevel, locale)}
            </Chip>
          </div>

          {point.openingHours && (
            <p className="flex items-center gap-2 text-[13.5px] text-haba-ink-2">
              <Icon name="clock-01" size={16} className="text-haba-muted" />
              {point.openingHours}
            </p>
          )}

          {point.capacityNote && (
            <p className="flex items-start gap-2 border border-haba-border bg-haba-surface-2 p-3 text-[13.5px] leading-relaxed text-haba-ink-2">
              <Icon name="package" size={16} className="mt-0.5 shrink-0 text-haba-muted" />
              {point.capacityNote}
            </p>
          )}

          {point.acceptedCategories && point.acceptedCategories.length > 0 && (
            <div>
              <p className="mb-1.5 text-[12.5px] font-semibold text-haba-muted">
                {isFr ? "Articles acceptés" : "المواد المقبولة"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {point.acceptedCategories.map((slug) => (
                  <Chip key={slug} tone="neutral" fill="tint" size="xs">
                    {getCategoryName(slug, slug, locale)}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {detail && (
            <p className="text-[13.5px] leading-relaxed text-haba-ink-2">{detail}</p>
          )}
          {source && (
            <p className="text-[12.5px] text-haba-muted">
              {isFr ? `Source : ${source}` : `المصدر: ${source}`}
            </p>
          )}

          <div className="flex flex-wrap gap-2.5">
            {point.phone && (
              <a
                href={`tel:${point.phone.replace(/\s/g, "")}`}
                className={cn(actionVariants({ variant: "primary", size: "md" }), "flex-1")}
              >
                <Icon name="call-02" size={18} />
                {isFr ? "Appeler" : "اتصال"}
              </a>
            )}
            <a
              href={directionsUrl(point)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(actionVariants({ variant: "outline", size: "md" }), "flex-1")}
            >
              <Icon name="navigation-03" size={18} />
              {isFr ? "Itinéraire" : "الاتجاهات"}
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
