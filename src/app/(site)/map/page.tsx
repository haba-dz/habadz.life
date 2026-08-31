import type { Metadata } from "next";
import type { PointCardData } from "@/components/shared/point-card";
import { getPublicCollectionPoints, getPublicReliefHubs } from "@/lib/data/public";
import { MapClient } from "./map-client";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { MapPin, ShieldCheck, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.nav.map,
    description: t.map.pageSubtitle,
  };
}

export default async function MapPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";

  const [collectionPoints, reliefHubs] = await Promise.all([
    getPublicCollectionPoints(),
    getPublicReliefHubs(),
  ]);

  const dbPoints: PointCardData[] = [
    ...collectionPoints.map((p) => ({
      id: p.id,
      kind: "collection_point" as const,
      name: p.name,
      wilaya: p.wilaya,
      commune: p.commune,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
      phone: p.phone,
      openingHours: p.opening_hours,
      capacityNote: p.capacity_note,
      acceptedCategories: p.accepted_categories ?? [],
      status: p.status,
      verificationLevel: p.verification_level,
      notes: p.notes,
    })),
    ...reliefHubs.map((h) => ({
      id: h.id,
      kind: h.is_shelter ? ("shelter" as const) : ("relief_hub" as const),
      name: h.name,
      wilaya: h.wilaya,
      commune: h.commune,
      address: h.address,
      lat: h.lat,
      lng: h.lng,
      phone: h.phone,
      openingHours: h.opening_hours,
      capacityNote: h.capacity_note,
      status: h.status,
      verificationLevel: h.verification_level,
      notes: h.notes,
    })),
  ];

  const points = dbPoints;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-algeria-green/10 px-3 py-1 text-xs font-bold text-algeria-green mb-2.5">
            <MapPin className="size-3.5" />
            <span>{isFr ? "Centres et points de secours vérifiés" : "المراكز ونقاط الإغاثة الميدانية الموثقة"}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t.map.pageTitle}</h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t.map.pageSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/help" />}
            className="rounded-xl font-bold gap-1.5 border-priority-critical/40 hover:bg-priority-critical/10 text-priority-critical"
          >
            <HeartHandshake className="size-4 text-priority-critical" />
            <span>{isFr ? "Besoin d'aide" : "أحتاج مساعدة"}</span>
          </Button>

          <Button
            size="sm"
            render={<Link href="/donate" />}
            className="rounded-xl bg-algeria-green hover:bg-algeria-green/90 text-white font-bold gap-1.5 shadow-xs"
          >
            <HeartHandshake className="size-4" />
            <span>{isFr ? "Enregistrer un don" : "تقديم مساعدات"}</span>
          </Button>
        </div>
      </div>

      {/* Main Interactive Map & Feed Client */}
      <MapClient points={points} locale={locale} />
    </div>
  );
}

