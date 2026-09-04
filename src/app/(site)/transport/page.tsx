import type { Metadata } from "next";

import { EmergencySection } from "@/components/shared/emergency-section";
import { PageHero, SECTION } from "@/components/site";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { TransportForm } from "./transport-form";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.cta.canTransport,
    description: t.transport.pageSubtitle,
  };
}

/**
 * No artboard for this route — design.md §7.3. Restyled with the system's own
 * primitives and kept reachable rather than folded into /volunteers, because
 * the link has already been shared in the field.
 */
export default async function TransportPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";

  return (
    <>
      <PageHero
        eyebrow={isFr ? "Logistique et acheminement" : "اللوجستيك ونقل المساعدات"}
        eyebrowIcon="truck-delivery"
        title={t.transport.pageTitle}
        lede={t.transport.pageSubtitle}
      />

      <div className={`mx-auto w-full max-w-[900px] px-4 desktop:px-6 ${SECTION}`}>
        <TransportForm locale={locale} />
      </div>

      <EmergencySection />
    </>
  );
}
