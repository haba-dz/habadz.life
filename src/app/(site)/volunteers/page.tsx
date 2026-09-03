import type { Metadata } from "next";
import { EmergencySection } from "@/components/shared/emergency-section";
import { Action, PageHero, SECTION, WarningBlock } from "@/components/site";
import { FieldVolunteerForm } from "./field-volunteer-form";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { getPublicCollectionPoints, getPublicReliefHubs } from "@/lib/data/public";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.fieldVolunteers.pageTitle,
    description: t.fieldVolunteers.pageSubtitle,
  };
}

/** design.md §5.8 */
export default async function VolunteersPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  const [collectionPoints, reliefHubs] = await Promise.all([
    getPublicCollectionPoints(),
    getPublicReliefHubs(),
  ]);

  const activePoints = [
    ...collectionPoints.map((p) => ({
      id: p.id,
      name: p.name,
      commune: p.commune,
      wilaya: p.wilaya,
      phone: p.phone,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
    })),
    ...reliefHubs.map((h) => ({
      id: h.id,
      name: h.name,
      commune: h.commune,
      wilaya: h.wilaya,
      phone: h.phone,
      address: h.address,
      lat: h.lat,
      lng: h.lng,
    })),
  ];

  return (
    <>
      <PageHero
        eyebrow={t.fieldVolunteers.badge}
        eyebrowIcon="user-group"
        title={t.fieldVolunteers.pageTitle}
        lede={t.fieldVolunteers.pageSubtitle}
      />

      <div className={`mx-auto w-full max-w-[1000px] px-4 desktop:px-6 ${SECTION}`}>
        <WarningBlock title={t.fieldVolunteers.introTitle}>
          {t.fieldVolunteers.introDesc}
        </WarningBlock>

        <div className="mt-4">
          <FieldVolunteerForm locale={locale} activePoints={activePoints} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Action href="/map" variant="outline" size="sm" icon="maps-location-02">
            {t.fieldVolunteers.mapBtn}
          </Action>
          <Action href="/donate" variant="neutral" size="sm" icon="gift">
            {t.cta.haveAid}
          </Action>
        </div>
      </div>

      <EmergencySection />
    </>
  );
}
