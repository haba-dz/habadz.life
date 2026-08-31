import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { NewsTicker } from "@/components/shared/news-ticker";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { EmergencyFab } from "@/components/interactive/emergency-fab";
import { WelcomeDialog } from "@/components/interactive/welcome-dialog";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <NewsTicker />
      <SiteHeader />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <SiteFooter />
      <MobileBottomNav locale={locale} />
      <EmergencyFab locale={locale} />
      <GoogleAnalytics />
      <WelcomeDialog locale={locale} />
    </div>
  );
}
