import Link from "next/link";

import { siteConfig } from "@/config/site";
import { Icon, type IconName } from "@/components/icons";
import { FlagStripe, FOCUS_RING } from "@/components/site";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { cn } from "@/lib/utils";

/** design.md §3.5 */
export async function SiteFooter() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";

  /**
   * The artboards show four links per column. The extra routes are kept: they
   * are already reachable and already shared in the field, and consolidating
   * them is an IA decision, not a visual one (design.md §7.3).
   */
  const solidarity: { href: string; label: string; icon: IconName }[] = [
    { href: "/help", label: isFr ? "Demande d'aide (familles sinistrées)" : "طلب مساعدة لعائلة متضررة", icon: "alert-02" },
    { href: "/donate", label: isFr ? "Faire un don de matériel" : "تقديم مساعدات وتبرعات عينية", icon: "gift" },
    { href: "/volunteers", label: isFr ? "Volontariat de terrain" : "المتطوعون وسواعد الإغاثة", icon: "user-group" },
    { href: "/transport", label: isFr ? "Transport & logistique" : "عروض النقل والشحن اللوجستي", icon: "truck-delivery" },
    { href: "/medical", label: isFr ? "Bénévoles médicaux & vétérinaires" : "الطواقم الطبية والبيطرية", icon: "stethoscope" },
    { href: "/artisans", label: isFr ? "Artisans & réparations" : "الحرفيون وترميم السكنات", icon: "building-06" },
  ];

  const tracking: { href: string; label: string; icon: IconName }[] = [
    { href: "/map", label: isFr ? "Carte des centres & secours" : "خريطة المراكز ونقاط الإغاثة", icon: "maps-location-02" },
    { href: "/affected-areas", label: isFr ? "Communes et zones sinistrées" : "المناطق والبلديات المتضررة", icon: "map-pinpoint-02" },
    { href: "/official-information", label: isFr ? "Communiqués & alertes" : "البيانات الرسمية والمستجدات", icon: "news" },
    { href: "/transparency", label: isFr ? "Journal de transparence" : "سجل الشفافية وتوزيع المساعدات", icon: "shield-01" },
    { href: "/news", label: isFr ? "Actualités & rapports" : "الأخبار والتقارير الميدانية", icon: "radio" },
  ];

  const linkClass = cn(
    "flex items-center gap-2 py-1 text-sm text-haba-green-100 hover:text-white",
    FOCUS_RING,
  );

  return (
    <footer className="mt-12 bg-haba-forest text-haba-green-100 desktop:mt-16">
      <FlagStripe />

      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 pt-8 pb-6 desktop:grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] desktop:gap-10 desktop:px-6 desktop:pt-12">
        <div>
          <Link href="/" className={cn("flex w-fit items-center gap-3", FOCUS_RING)}>
            <span className="flex size-10 items-center justify-center bg-white text-haba-forest">
              <Icon name="heart-check" size={22} />
            </span>
            <span className="font-haba-display text-2xl font-bold text-white">
              {siteConfig.shortName}
            </span>
          </Link>
          <p className="mt-3 max-w-[360px] text-sm leading-relaxed">
            {t.chrome.footer.description}
          </p>
        </div>

        <FooterColumn title={t.chrome.footer.solidarity}>
          {solidarity.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              <Icon name={item.icon} size={16} className="text-haba-green-300" />
              {item.label}
            </Link>
          ))}
        </FooterColumn>

        <FooterColumn title={t.chrome.footer.tracking}>
          {tracking.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              <Icon name={item.icon} size={16} className="text-haba-green-300" />
              {item.label}
            </Link>
          ))}
        </FooterColumn>

        <FooterColumn title={t.chrome.footer.platform}>
          <a
            href={siteConfig.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            <Icon name="github" size={16} className="text-haba-green-300" />
            {t.chrome.footer.sourceCode}
          </a>
          <Link href="/admin/login" className={linkClass}>
            <Icon name="shield-user" size={16} className="text-haba-green-300" />
            {t.footer.staffLogin}
          </Link>
        </FooterColumn>
      </div>

      <div className="border-t border-haba-green-400/30">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-4 text-[12.5px] text-haba-green-300 desktop:px-6">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
            <span>
              © {new Date().getFullYear()} {siteConfig.shortName} — {t.chrome.footer.copyright}
            </span>
            <span>{t.chrome.footer.pledges}</span>
          </div>
          <p className="leading-relaxed">{siteConfig.legalNotice}</p>
          <p className="leading-relaxed">
            {t.footer.dataCreditBefore}{" "}
            <a
              href="https://sanad-ca736.web.app"
              target="_blank"
              rel="noopener noreferrer"
              className={cn("font-bold text-white hover:underline", FOCUS_RING)}
            >
              {t.footer.dataCreditLink}
            </a>{" "}
            {t.footer.dataCreditAfter}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2.5 text-sm font-bold text-white">{title}</h2>
      {/* Three unlabelled <nav> landmarks in one footer are indistinguishable
          in a screen reader's landmark list. Name each after its column. */}
      <nav aria-label={title} className="flex flex-col gap-[9px]">
        {children}
      </nav>
    </div>
  );
}
