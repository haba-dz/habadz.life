import type { Metadata } from "next";
import Link from "next/link";

import { EmergencySection } from "@/components/shared/emergency-section";
import { FOCUS_RING, PageHero, SECTION } from "@/components/site";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { DamageAssessmentForm } from "./damage-assessment-form";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.damageAssessment.pageTitle,
    description: t.damageAssessment.pageSubtitle,
  };
}

/** Sub-route of /help, no artboard — design.md §7.3, restyle-and-keep. */
export default async function DamageAssessmentPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";

  return (
    <>
      <PageHero
        eyebrow={isFr ? "Évaluation des dégâts au logement" : "تقييم أضرار السكن"}
        eyebrowIcon="house-04"
        title={t.damageAssessment.pageTitle}
        lede={t.damageAssessment.pageSubtitle}
      >
        <p className="mt-3 text-[13.5px] text-haba-muted">
          {t.damageAssessment.artisanPrompt}{" "}
          <Link
            href="/artisans"
            className={`font-semibold text-haba-green hover:underline ${FOCUS_RING}`}
          >
            {t.damageAssessment.artisanLink}
          </Link>
          .
        </p>
      </PageHero>

      <div className={`mx-auto w-full max-w-[900px] px-4 desktop:px-6 ${SECTION}`}>
        <DamageAssessmentForm locale={locale} />
      </div>

      <EmergencySection />
    </>
  );
}
