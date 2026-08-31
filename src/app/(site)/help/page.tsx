import type { Metadata } from "next";
import { HandHeart, ShieldCheck, PhoneCall, TriangleAlert } from "lucide-react";
import { HelpRequestForm } from "./help-request-form";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/i18n/dictionaries";
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

export default async function HelpPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-priority-critical/30 bg-priority-critical/10 px-3.5 py-1 text-xs font-bold text-priority-critical">
          <TriangleAlert className="size-3.5 animate-pulse" />
          <span>{isFr ? "Espace d'assistance aux familles sinistrées" : "فضاء استقبال طلبات الأسر والعائلات المتضررة"}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
          {isFr ? "Demande d'aide et d'assistance" : "طلب مساعدة وإغاثة عاجلة"}
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
          {isFr
            ? "Si votre foyer ou votre entourage est touché par les incendies, enregistrez vos besoins (vivres, eau, couchage, santé) pour une prise en charge coordonnée."
            : "إذا تضرر منزلك أو عائلتك من الحرائق، سجّل احتياجاتكم العاجلة (أغذية، مياه، أفرشة، أدوية، مأوى) ليتم توجيهها مباشرة لفرق الإغاثة الميدانية."}
        </p>
      </div>

      {/* Form */}
      <HelpRequestForm locale={locale} />
    </div>
  );
}
