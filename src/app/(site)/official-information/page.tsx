import type { Metadata } from "next";

import { EmergencySection } from "@/components/shared/emergency-section";
import { Icon } from "@/components/icons";
import { PageHero, SECTION, SHELL } from "@/components/site";
import { emergencyContacts } from "@/lib/emergency";
import { getOfficialUpdates } from "@/lib/data/public";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { OfficialInfoClient } from "./official-info-client";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.nav.officialInformation,
    description: t.officialInformation.pageSubtitle,
  };
}

/** design.md §5.3 */
export default async function OfficialInformationPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";
  const updates = await getOfficialUpdates(50);

  return (
    <>
      <PageHero
        eyebrow={
          isFr ? "Couverture vérifiée des sources officielles" : "تغطية موثّقة للمصادر الرسمية"
        }
        eyebrowIcon="radio"
        title={t.officialInformation.pageTitle}
        lede={t.officialInformation.pageSubtitle}
      />

      {/* direct-dial strip — §5.3 */}
      <div className={`${SHELL} ${SECTION}`}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border border-haba-border bg-haba-surface p-4 desktop:px-5">
          <span className="flex items-center gap-2.5 text-[14.5px] font-bold text-haba-ink">
            <Icon name="call-ringing-02" size={18} className="text-haba-red" />
            {isFr ? "Numéros de secours en cas de danger :" : "أرقام النجدة المباشرة في حالة الخطر:"}
          </span>
          <div className="flex flex-wrap gap-2.5">
            {emergencyContacts.map((c) => (
              <a
                key={c.number}
                href={`tel:${c.number}`}
                className="inline-flex items-center gap-2 border border-haba-border px-3 py-[7px] text-[13.5px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-haba-green"
              >
                <strong dir="ltr" className="text-haba-red">
                  {c.number}
                </strong>
                <span className="text-haba-muted">{(isFr ? c.label_fr : c.label) ?? c.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className={`${SHELL} ${SECTION}`}>
        <OfficialInfoClient initialUpdates={updates} locale={locale} />
      </div>

      <EmergencySection />
    </>
  );
}
