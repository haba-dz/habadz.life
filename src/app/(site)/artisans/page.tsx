import type { Metadata } from "next";

import { EmergencySection } from "@/components/shared/emergency-section";
import { PageHero, SECTION } from "@/components/site";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { ArtisanForm } from "./artisan-form";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.artisans.pageTitle,
    description: t.artisans.pageSubtitle,
  };
}

/** No artboard — design.md §7.3, restyle-and-keep. */
export default async function ArtisansPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";

  return (
    <>
      <PageHero
        eyebrow={isFr ? "Reconstruction et réparations" : "الترميم وإعادة البناء"}
        eyebrowIcon="house-04"
        title={t.artisans.pageTitle}
        lede={t.artisans.pageSubtitle}
      />

      <div className={`mx-auto w-full max-w-[900px] px-4 desktop:px-6 ${SECTION}`}>
        <ArtisanForm locale={locale} />
      </div>

      <EmergencySection />
    </>
  );
}
