import type { Metadata } from "next";
import { getCategories } from "@/lib/data/public";
import { EmergencySection } from "@/components/shared/emergency-section";
import { PageHero, SECTION } from "@/components/site";
import { DonationForm } from "./donation-form";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.cta.haveAid,
    description: t.donate.pageSubtitle,
  };
}

/** design.md §5.7 */
export default async function DonatePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";
  const [categories, params] = await Promise.all([getCategories(), searchParams]);

  return (
    <>
      <PageHero
        eyebrow={isFr ? "Pour les donateurs — dons en nature" : "للمتبرعين — مساعدات عينية"}
        eyebrowIcon="gift"
        title={t.donate.pageTitle}
        lede={t.donate.pageSubtitle}
      />

      <div className={`mx-auto w-full max-w-[900px] px-4 desktop:px-6 ${SECTION}`}>
        <DonationForm
          categories={categories}
          defaultCategorySlug={params.category}
          locale={locale}
        />
      </div>

      <EmergencySection />
    </>
  );
}
