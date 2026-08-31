import Link from "next/link";
import {
  HeartHandshake,
  Gift,
  Users,
  Truck,
  Stethoscope,
  Hammer,
  MapPin,
  TriangleAlert,
  Newspaper,
  ShieldCheck,
  PhoneCall,
  Lock,
  ExternalLink,
  Flame,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";

export async function SiteFooter() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";

  const solidarityLinks = [
    { href: "/donate", label: isFr ? "Faire un don de matériel" : "تقديم مساعدات وتبرعات عينية", icon: Gift },
    { href: "/volunteers", label: isFr ? "Volontariat de terrain" : "المتطوعون وسواعد الإغاثة", icon: Users },
    { href: "/transport", label: isFr ? "Transport & Logistique" : "عروض النقل والشحن اللوجستي", icon: Truck },
    { href: "/medical", label: isFr ? "Bénévoles médicaux & vétérinaires" : "الطواقم الطبية والبيطرية", icon: Stethoscope },
    { href: "/artisans", label: isFr ? "Artisans & Travaux de réparation" : "الحرفيون وترميم السكنات", icon: Hammer },
  ];

  const infoLinks = [
    { href: "/map", label: isFr ? "Carte des centres & secours" : "خريطة المراكز ونقاط الإغاثة", icon: MapPin },
    { href: "/affected-areas", label: isFr ? "Communes et zones sinistrées" : "المناطق والبلديات المتضررة", icon: TriangleAlert },
    { href: "/official-information", label: isFr ? "Communiqués & alertes officielles" : "البيانات الرسمية والمستجدات", icon: Newspaper },
    { href: "/transparency", label: isFr ? "Journal de transparence des aides" : "سجل الشفافية وتوزيع المساعدات", icon: ShieldCheck },
    { href: "/news", label: isFr ? "Actualités & Rapports" : "الأخبار والتقارير الميدانية", icon: Newspaper },
  ];

  const emergencyHotlines = [
    {
      name: isFr ? "Protection Civile" : "الحماية المدنية",
      number: "14",
      desc: isFr ? "Incendies & Secours" : "الحرائق والإسعاف",
      color: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/40 hover:bg-red-500/20",
    },
    {
      name: isFr ? "Numéro Vert Forêts" : "الرقم الأخضر للغابات",
      number: "1021",
      desc: isFr ? "Signalement feux" : "التبليغ عن الحرائق",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-500/20",
    },
    {
      name: isFr ? "Gendarmerie Nationale" : "الدرك الوطني",
      number: "1055",
      desc: isFr ? "Sécurité & Routes" : "الطرقات والمناطق الريفية",
      color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/40 hover:bg-blue-500/20",
    },
    {
      name: isFr ? "Sûreté Nationale" : "الأمن الوطني (الشرطة)",
      number: "1548",
      desc: isFr ? "Secours urbain" : "النجدة في الوسط الحضري",
      color: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900/40 hover:bg-purple-500/20",
    },
  ];

  return (
    <footer className="mt-16 border-t border-border/80 bg-card/60 backdrop-blur-md pb-28 lg:pb-12">
      {/* Top Emergency Strip */}
      <div className="border-b border-border/60 bg-muted/40 px-3.5 sm:px-4 py-5 sm:py-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-priority-critical/10 text-priority-critical shrink-0">
                <PhoneCall className="size-3.5 sm:size-4 animate-pulse" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-black text-foreground">
                  {isFr ? "Numéros d'urgence nationaux gratuits (24h/24 & 7j/7)" : "أرقام الطوارئ الوطنية المجانية (تعمل على مدار الساعة)"}
                </p>
                <p className="text-[11px] sm:text-xs text-muted-foreground">
                  {isFr ? "Appel direct et gratuit depuis tout opérateur" : "اتصال مباشر ومجاني من كافة الشبكات والهواتف"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
            {emergencyHotlines.map((hl) => (
              <a
                key={hl.number}
                href={`tel:${hl.number}`}
                className={`flex items-center justify-between rounded-xl sm:rounded-2xl border p-2.5 sm:p-3 transition-all active:scale-95 ${hl.color}`}
              >
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-bold leading-tight truncate">{hl.name}</p>
                  <p className="text-[9px] sm:text-[10px] opacity-80 truncate">{hl.desc}</p>
                </div>
                <span className="text-base sm:text-lg font-black tabular-nums ms-1.5 shrink-0">{hl.number}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:pt-12 pb-6 sm:pb-8">
        <div className="grid gap-8 sm:gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand & About */}
          <div className="space-y-3.5 sm:space-y-4 sm:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-black text-base sm:text-lg group w-fit">
              <span className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-algeria-green text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <HeartHandshake className="size-5 sm:size-6" />
              </span>
              <div>
                <span className="text-base sm:text-lg font-black tracking-tight text-foreground block leading-tight">
                  {siteConfig.name}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-algeria-green block">
                  {isFr ? "Plateforme citoyenne solidaire" : "منصة تضامنية مفتوحة لتنسيق الإغاثة"}
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
              {siteConfig.description}
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-algeria-green/30 bg-algeria-green/10 px-3 py-1 text-[11px] sm:text-xs font-bold text-algeria-green">
              <Flame className="size-3.5 text-amber-500 shrink-0" />
              <span>{isFr ? "Campagne active : Wilayas du Nord-Est" : "تغطية تضامنية نشطة لولايات الشرق والشمال"}</span>
            </div>
          </div>

          {/* Column 1: Solidarity & Volunteering */}
          <div className="space-y-2.5 sm:space-y-3">
            <p className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
              <HeartHandshake className="size-4 text-algeria-green shrink-0" />
              <span>{isFr ? "Solidarité & Bénévolat" : "سبل المساعدة والتطوع"}</span>
            </p>
            <ul className="space-y-1">
              {solidarityLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground active:text-algeria-green"
                    >
                      <Icon className="size-3.5 text-muted-foreground/60 transition-colors group-hover:text-algeria-green shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 2: Information & Tracking */}
          <div className="space-y-2.5 sm:space-y-3">
            <p className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-algeria-green shrink-0" />
              <span>{isFr ? "Suivi & Transparence" : "المتابعة والبيانات"}</span>
            </p>
            <ul className="space-y-1">
              {infoLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground active:text-algeria-green"
                    >
                      <Icon className="size-3.5 text-muted-foreground/60 transition-colors group-hover:text-algeria-green shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Legal & Attribution */}
        <div className="mt-8 sm:mt-12 border-t border-border/70 pt-5 sm:pt-6 flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between text-[11px] sm:text-xs text-muted-foreground">
          <div className="space-y-1">
            <p className="leading-relaxed">{siteConfig.legalNotice}</p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground/80 leading-relaxed">
              {t.footer.dataCreditBefore}{" "}
              <a
                href="https://sanad-ca736.web.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-foreground hover:underline inline-flex items-center gap-0.5"
              >
                <span>{t.footer.dataCreditLink}</span>
                <ExternalLink className="size-2.5" />
              </a>{" "}
              {t.footer.dataCreditAfter}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 pt-1 md:pt-0">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 font-bold text-foreground transition-all hover:bg-muted active:scale-95 shadow-2xs text-xs"
            >
              <Lock className="size-3 text-algeria-green" />
              <span>{t.footer.staffLogin}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
