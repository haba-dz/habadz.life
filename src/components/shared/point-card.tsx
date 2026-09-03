"use client";

import { useState } from "react";
import { MapPin, Clock, Phone, Navigation, Home, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PointStatusBadge } from "@/components/shared/status-badge";
import { VerificationBadge } from "@/components/shared/verification-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CategoryIcon } from "@/components/shared/category-icon";
import { splitNeedNotes } from "@/lib/notes";
import { getCategoryName, type PointStatus, type VerificationLevel } from "@/lib/constants";
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

const kindLabelsByLocale: Record<AvailableLocale, Record<PointCardData["kind"], string>> = {
  ar: {
    collection_point: "نقطة تجميع",
    relief_hub: "مركز استقبال",
    shelter: "مركز إيواء",
  },
  fr: {
    collection_point: "Point de collecte",
    relief_hub: "Centre d'accueil",
    shelter: "Centre d'hébergement",
  },
};

const kindDot: Record<PointCardData["kind"], string> = {
  collection_point: "bg-[#00843D]",
  relief_hub: "bg-[#1d4ed8]",
  shelter: "bg-[#7c3aed]",
};

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

  const directionsUrl =
    point.lat != null && point.lng != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${point.name} ${point.commune} ${point.wilaya}`,
        )}`;

  const kindLabel = kindLabelsByLocale[locale]?.[point.kind] ?? kindLabelsByLocale.ar[point.kind];
  const wilayaText = isFr ? `Wilaya de ${point.wilaya}` : `ولاية ${point.wilaya}`;

  return (
    <>
      <Card
        onClick={() => setOpen(true)}
        className={cn(
          "group h-full cursor-pointer transition-all hover:-translate-y-0.5",
          isSelected
            ? "border-2 border-algeria-green bg-algeria-green/5 ring-2 ring-algeria-green/20"
            : "hover:border-algeria-green/50",
          className,
        )}
      >
        <CardContent className="flex h-full flex-col justify-between space-y-2 px-5 py-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <span className={`size-2.5 ${kindDot[point.kind]}`} aria-hidden />
                  {kindLabel}
                </p>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(true);
                  }}
                  className="mt-1 text-start font-bold leading-tight text-foreground transition-colors group-hover:text-algeria-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-algeria-green"
                >
                  {point.name}
                </button>
              </div>
              <PointStatusBadge status={point.status} locale={locale} />
            </div>

            <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/80" />
              {point.address ?? `${point.commune}، ${wilayaText}`}
            </p>

            {point.openingHours && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5 shrink-0" /> {point.openingHours}
              </p>
            )}

            {point.acceptedCategories && point.acceptedCategories.length > 0 && (
              <p className="flex flex-wrap gap-1 text-base" aria-label={isFr ? "Articles acceptés" : "المواد المقبولة"}>
                {point.acceptedCategories.map((slug) => (
                  <span key={slug} title={getCategoryName(slug, slug, locale)}>
                    <CategoryIcon slug={slug} className="size-4" />
                  </span>
                ))}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
            <VerificationBadge level={point.verificationLevel} locale={locale} />

            <div className="flex items-center gap-2">
              {onShowOnMap && point.lat !== null && point.lng !== null && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowOnMap(point);
                  }}
                  className="inline-flex items-center gap-1 bg-muted/80 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-algeria-green hover:text-white transition-colors"
                  title={isFr ? "Voir sur la carte" : "عرض على الخريطة"}
                >
                  <Navigation className="size-3" />
                  <span>{isFr ? "Carte" : "الخريطة"}</span>
                </button>
              )}

              {point.phone && (
                <a
                  href={`tel:${point.phone.replace(/\s/g, "")}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-sm font-semibold text-algeria-green hover:underline"
                  dir="ltr"
                >
                  <Phone className="size-3.5" />
                  {point.phone}
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span className={`size-2 ${kindDot[point.kind]}`} aria-hidden />
              {kindLabel}
            </p>
            <DialogTitle className="flex items-center gap-2">
              {point.kind === "shelter" && <Home className="size-4 text-[#7c3aed]" />}
              {point.name}
            </DialogTitle>
            <DialogDescription className="flex items-start gap-1">
              <MapPin className="mt-0.5 size-3.5 shrink-0" />
              {point.address ?? `${point.commune}، ${wilayaText}`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2">
            <PointStatusBadge status={point.status} locale={locale} />
            <VerificationBadge level={point.verificationLevel} locale={locale} />
          </div>

          {point.openingHours && (
            <p className="flex items-center gap-2 text-sm">
              <Clock className="size-4 text-muted-foreground" /> {point.openingHours}
            </p>
          )}

          {point.capacityNote && (
            <div className="flex items-start gap-2 bg-muted/60 p-3">
              <Package className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm leading-relaxed">{point.capacityNote}</p>
            </div>
          )}

          {point.acceptedCategories && point.acceptedCategories.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
                {isFr ? "Articles acceptés" : "المواد المقبولة"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {point.acceptedCategories.map((slug) => (
                  <span
                    key={slug}
                    className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 text-xs"
                  >
                    <CategoryIcon slug={slug} className="size-3.5" /> {getCategoryName(slug, slug, locale)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {detail && <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>}
          {source && (
            <p className="text-xs text-muted-foreground">
              {isFr ? `Source : ${source}` : `المصدر: ${source}`}
            </p>
          )}

          <div className="flex gap-2">
            {point.phone ? (
              <Button
                size="lg"
                className="flex-1"
                nativeButton={false}
                render={<a href={`tel:${point.phone.replace(/\s/g, "")}`} />}
              >
                <Phone className="size-4" /> {isFr ? "Appeler" : "اتصال"}
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              nativeButton={false}
              render={<a href={directionsUrl} target="_blank" rel="noopener noreferrer" />}
            >
              <Navigation className="size-4" /> {isFr ? "Itinéraire" : "الاتجاهات"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
