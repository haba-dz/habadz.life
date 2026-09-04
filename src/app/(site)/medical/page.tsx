import type { Metadata } from "next";

import { EmergencySection } from "@/components/shared/emergency-section";
import { PageHero, SECTION } from "@/components/site";
import { createPublicClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { MedicalVolunteerForm } from "./medical-volunteer-form";
import { MedicalVolunteersList } from "./medical-volunteers-list";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.cta.volunteerMedical,
    description: t.medical.pageSubtitle,
  };
}

/** No artboard — design.md §7.3, restyle-and-keep. */
export default async function MedicalPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";

  // Public read: this list is shown to anonymous visitors, so it must not be
  // scoped to the caller's cookies. design.md §8.1b
  const supabase = createPublicClient();
  const { data: volunteers } = await supabase.rpc("get_public_medical_volunteers");

  return (
    <>
      <PageHero
        eyebrow={isFr ? "Équipes de santé bénévoles" : "الأطقم الصحية المتطوعة"}
        eyebrowIcon="stethoscope"
        title={t.medical.pageTitle}
        lede={t.medical.pageSubtitle}
      />

      <div className={`mx-auto w-full max-w-[1000px] px-4 desktop:px-6 ${SECTION}`}>
        <MedicalVolunteerForm locale={locale} />
        <MedicalVolunteersList volunteers={volunteers ?? []} locale={locale} />
      </div>

      <EmergencySection />
    </>
  );
}
