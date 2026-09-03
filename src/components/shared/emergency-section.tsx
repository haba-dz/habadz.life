import { EmergencyNumbers, SECTION, SHELL } from "@/components/site";
import { emergencyNumberRows } from "@/lib/emergency";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { cn } from "@/lib/utils";

/**
 * The emergency-numbers block that closes every public page. design.md §3.17
 * Wrapped here so pages don't each repeat the locale/dictionary plumbing.
 */
export async function EmergencySection({ className }: { className?: string }) {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";

  return (
    <div className={cn(SHELL, SECTION, "pb-2", className)}>
      <EmergencyNumbers
        title={
          isFr
            ? "Numéros d'urgence nationaux (gratuits, 24h/24)"
            : "أرقام الطوارئ الوطنية (مجانية على مدار الساعة)"
        }
        note={isFr ? "Appelez-les directement, pas la plateforme" : "اتصل بها مباشرة، وليس بالمنصة"}
        items={emergencyNumberRows(locale, t.home.emergency.greenNumberPrefix)}
      />
    </div>
  );
}
