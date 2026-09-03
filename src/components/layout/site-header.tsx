import { siteConfig } from "@/config/site";
import { PlatformBand, StatusBand } from "@/components/site/platform-band";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SiteHeaderBar, type NavItem } from "@/components/layout/site-header-bar";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";

export async function SiteHeader() {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  const n = t.chrome.nav.items;

  // design.md §3.4 — five items, in this order. `labelCompact` is what renders
  // below 1200px, where the French labels do not fit (design.md §8.4).
  const items: NavItem[] = [
    { href: "/", label: n.home, icon: "home-09" },
    {
      href: "/official-information",
      label: n.officialInformation,
      labelCompact: n.officialInformationCompact,
      icon: "news",
    },
    { href: "/affected-areas", label: n.affectedAreas, icon: "map-pinpoint-02" },
    {
      href: "/map",
      label: n.centresMap,
      labelCompact: n.centresMapCompact,
      icon: "maps-location-02",
    },
    { href: "/volunteers", label: n.volunteers, icon: "user-group" },
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
