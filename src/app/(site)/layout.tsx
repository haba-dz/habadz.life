import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { NewsTicker } from "@/components/shared/news-ticker";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileMenuProvider } from "@/components/layout/mobile-menu-context";
import { WelcomeDialog } from "@/components/interactive/welcome-dialog";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    // data-site scopes the public design system. /admin renders in the same
    // <body> and must not inherit it. design.md §8.1
    <div data-site className="flex min-h-screen flex-col">
      {/*
        Three sticky strips (ticker, band, header) plus a five-item nav sit
        ahead of the content on every page. Without this, reaching the page
        body by keyboard costs ~10 tabs per navigation. design.md §8.5
      */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-50 focus:bg-haba-green focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:outline-2 focus:outline-offset-2 focus:outline-haba-forest"
      >
        {t.chrome.nav.skipToContent}
      </a>

      <MobileMenuProvider>
        <NewsTicker />
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <SiteFooter />
        {/*
          EmergencyFab was removed here: the tab bar's inverted red "طلب إغاثة"
          item is the emergency action on mobile, and the emergency numbers
          block (design.md §3.17) sits on every page. A third fixed element
          competing for the same corner is noise, and it collided with the bar.
        */}
        <MobileBottomNav labels={t.chrome.tabbar} />
      </MobileMenuProvider>
      <GoogleAnalytics />
      <WelcomeDialog locale={locale} />
    </div>
  );
}
