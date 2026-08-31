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
    <footer className="mt-20 border-t border-border/80 bg-card/60 backdrop-blur-md pb-24 lg:pb-8">
      {/* Top Emergency Strip */}
      <div className="border-b border-border/60 bg-muted/40 px-4 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-priority-critical/10 text-priority-critical">
                <PhoneCall className="size-4 animate-pulse" />
              </span>
              <div>
                <p className="text-sm font-black text-foreground">
                  {isFr ? "Numéros d'urgence nationaux gratuits (24h/24 & 7j/7)" : "أرقام الطوارئ الوطنية المجانية (تعمل على مدار الساعة)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isFr ? "Appel direct et gratuit depuis n'importe quel opérateur" : "اتصال مباشر ومجاني من كافة الشبكات والهواتف الثابتة والنقالة"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {emergencyHotlines.map((hl) => (
              <a
                key={hl.number}
                href={`tel:${hl.number}`}
                className={`flex items-center justify-between rounded-2xl border p-3 transition-all active:scale-95 ${hl.color}`}
              >
                <div>
                  <p className="text-xs font-bold leading-tight">{hl.name}</p>
                  <p className="text-[10px] opacity-80">{hl.desc}</p>
                </div>
                <span className="text-lg font-black tabular-nums ms-2">{hl.number}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-8">
        <div className="grid gap-10 md:grid-cols-4 sm:grid-cols-2">
          {/* Brand & About */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-black text-lg group w-fit">
              <span className="flex size-10 items-center justify-center rounded-xl bg-algeria-green text-white shadow-xs group-hover:scale-105 transition-transform">
                <HeartHandshake className="size-6" />
              </span>
              <div>
                <span className="text-lg font-black tracking-tight text-foreground block">
                  {siteConfig.name}
                </span>
                <span className="text-xs font-medium text-algeria-green block -mt-0.5">
                  {isFr ? "Plateforme citoyenne solidaire" : "منصة تضامنية مفتوحة لتنسيق الإغاثة"}
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
              {siteConfig.description}
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-algeria-green/30 bg-algeria-green/10 px-3.5 py-1 text-xs font-bold text-algeria-green">
              <Flame className="size-3.5 text-amber-500" />
              <span>{isFr ? "Campagne active : Wilayas du Nord-Est" : "تغطية تضامنية نشطة لولايات الشرق والشمال"}</span>
            </div>
          </div>

          {/* Column 1: Solidarity & Volunteering */}
          <div className="space-y-3">
            <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <HeartHandshake className="size-4 text-algeria-green" />
              <span>{isFr ? "Solidarité & Bénévolat" : "سبل المساعدة والتطوع"}</span>
            </p>
            <ul className="space-y-2">
              {solidarityLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:translate-x-0.5"
                    >
                      <Icon className="size-3.5 text-muted-foreground/60 transition-colors group-hover:text-algeria-green" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 2: Information & Tracking */}
          <div className="space-y-3">
            <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-algeria-green" />
              <span>{isFr ? "Suivi & Transparence" : "المتابعة والبيانات"}</span>
            </p>
            <ul className="space-y-2">
              {infoLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:translate-x-0.5"
                    >
                      <Icon className="size-3.5 text-muted-foreground/60 transition-colors group-hover:text-algeria-green" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Legal & Attribution */}
        <div className="mt-12 border-t border-border/70 pt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs text-muted-foreground">
          <div className="space-y-1">
            <p>{siteConfig.legalNotice}</p>
            <p className="text-[11px] text-muted-foreground/80">
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

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 font-bold text-foreground transition-all hover:bg-muted active:scale-95 shadow-2xs"
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
