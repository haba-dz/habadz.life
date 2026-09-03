import type { Metadata } from "next";

import { EmergencySection } from "@/components/shared/emergency-section";
import type { PointCardData } from "@/components/shared/point-card";
import { Action, PageHero, SECTION, SHELL } from "@/components/site";
import { getPublicCollectionPoints, getPublicReliefHubs } from "@/lib/data/public";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { MapClient } from "./map-client";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.nav.map,
    description: t.map.pageSubtitle,
  };
}

/** design.md §5.5 */
export default async function MapPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";

  const [collectionPoints, reliefHubs] = await Promise.all([
    getPublicCollectionPoints(),
    getPublicReliefHubs(),
  ]);

  const points: PointCardData[] = [
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

  return (
    <>
      <PageHero
        eyebrow={
          isFr
            ? "Centres et points de secours vérifiés"
            : "المراكز ونقاط الإغاثة الميدانية الموثّقة"
        }
        eyebrowIcon="location-01"
        title={t.map.pageTitle}
        lede={t.map.pageSubtitle}
      />

      <div className={`${SHELL} ${SECTION}`}>
        <MapClient points={points} locale={locale} />
      </div>

      {/* pre-visit advisory — §5.5 */}
      <div className={`${SHELL} ${SECTION}`}>
        <div className="flex flex-col gap-4 border border-haba-border bg-haba-surface-2 p-4 desktop:flex-row desktop:items-center desktop:justify-between desktop:px-5">
          <div>
            <p className="text-sm font-bold text-haba-ink">
              {isFr ? "Avant de vous rendre dans un centre" : "قبل التوجّه إلى أي مركز"}
            </p>
            <p className="mt-1 max-w-[640px] text-[13px] leading-relaxed text-haba-ink-2">
              {isFr
                ? "Appelez le responsable pour confirmer les horaires et ce qui est réellement demandé — les besoins changent plusieurs fois par jour."
                : "اتصل برقم المسؤول للتأكد من المواقيت والمواد المطلوبة حالياً — الاحتياجات تتغير عدة مرات في اليوم."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Action href="/donate" variant="primary" size="sm" icon="gift">
              {t.cta.haveAid}
            </Action>
            <Action href="/help" variant="outline" size="sm" icon="alert-02">
              {t.cta.needHelp}
            </Action>
          </div>
        </div>
      </div>

      <EmergencySection />
    </>
  );
}
