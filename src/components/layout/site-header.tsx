import { siteConfig } from "@/config/site";
import { PlatformBand, StatusBand } from "@/components/site/platform-band";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SiteHeaderBar, type NavItem } from "@/components/layout/site-header-bar";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";

export async function SiteHeader() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";

  // design.md §3.4 — five items, in this order.
  const items: NavItem[] = [
    { href: "/", label: t.nav.home, icon: "home-09" },
    {
      href: "/official-information",
      label: isFr ? "Communiqués & données" : "المستجدات والبيانات",
      icon: "news",
    },
    { href: "/affected-areas", label: t.nav.affectedAreas, icon: "map-pinpoint-02" },
    {
      href: "/map",
      label: isFr ? "Carte des centres" : "خريطة المراكز",
      icon: "maps-location-02",
    },
    {
      href: "/volunteers",
      label: isFr ? "Bénévoles" : "المتطوعون",
      icon: "user-group",
    },
  ];

  const switcher = <LanguageSwitcher current={locale} label={t.language.change} variant="band" />;

  return (
    <>
      <PlatformBand
        independence={t.chrome.band.independence}
        independenceShort={t.chrome.band.independenceShort}
        emergencyLabel={t.chrome.band.emergency}
        languageSwitcher={switcher}
      />
      <StatusBand emergencyLabel={t.chrome.band.emergency} languageSwitcher={switcher} />
      <SiteHeaderBar
        brand={siteConfig.shortName}
        brandSubtitle={t.chrome.brand.subtitle}
        homeLabel={t.chrome.brand.home}
        navLabel={t.chrome.nav.label}
        openMenuLabel={t.chrome.nav.openMenu}
        closeMenuLabel={t.chrome.nav.closeMenu}
        items={items}
        haveAidLabel={t.cta.haveAid}
        needHelpLabel={t.cta.needHelp}
      />
    </>
  );
}
