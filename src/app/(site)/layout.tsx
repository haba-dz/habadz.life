import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { NewsTicker } from "@/components/shared/news-ticker";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileMenuProvider } from "@/components/layout/mobile-menu-context";
import { WelcomeDialog } from "@/components/interactive/welcome-dialog";
import { getLocale } from "@/i18n/server";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    // data-site scopes the public design system. /admin renders in the same
    // <body> and must not inherit it. design.md §8.1
    <div data-site className="flex min-h-screen flex-col">
      <MobileMenuProvider>
        <NewsTicker />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        {/*
          EmergencyFab was removed here: the tab bar's inverted red "طلب إغاثة"
          item is the emergency action on mobile, and the emergency numbers
          block (design.md §3.17) sits on every page. A third fixed element
          competing for the same corner is noise, and it collided with the bar.
        */}
        <MobileBottomNav locale={locale} />
      </MobileMenuProvider>
      <GoogleAnalytics />
      <WelcomeDialog locale={locale} />
    </div>
  );
}
