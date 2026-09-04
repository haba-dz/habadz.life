import type { Metadata } from "next";
import { EmergencySection } from "@/components/shared/emergency-section";
import { PageHero, SECTION } from "@/components/site";
import { HelpRequestForm } from "./help-request-form";
import { getLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFr = locale === "fr";
  return {
    title: isFr ? "Demande d'aide et d'assistance" : "طلب مساعدة وإغاثة عاجلة",
    description: isFr
      ? "Enregistrement des besoins urgents pour les familles et personnes sinistrées."
      : "تسجيل الاحتياجات العاجلة للأسر والعائلات المتضررة من الحرائق.",
  };
}

/** design.md §5.6 — form pages are 900px, narrower than the 1200px shell. */
export default async function HelpPage() {
  const locale = await getLocale();
  const isFr = locale === "fr";

  return (
    <>
      <PageHero
        tone="red"
        eyebrow={
          isFr
            ? "Espace d'assistance aux familles sinistrées"
            : "فضاء استقبال طلبات الأسر والعائلات المتضررة"
        }
        eyebrowIcon="alert-02"
        title={isFr ? "Demande d'aide et d'assistance" : "طلب مساعدة وإغاثة عاجلة"}
        lede={
          isFr
            ? "Si votre foyer ou votre entourage est touché par les incendies, enregistrez vos besoins (vivres, eau, couchage, santé, abri) pour une prise en charge coordonnée."
            : "إذا تضرر منزلك أو عائلتك من الحرائق، سجّل احتياجاتكم العاجلة (أغذية، مياه، أفرشة، أدوية، مأوى) ليتم توجيهها مباشرة لفرق الإغاثة الميدانية."
        }
      />

      <div className={`mx-auto w-full max-w-[900px] px-4 desktop:px-6 ${SECTION}`}>
        <HelpRequestForm locale={locale} />
      </div>

      <EmergencySection />
    </>
  );
}
