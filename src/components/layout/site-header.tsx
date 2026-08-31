import Link from "next/link";
import { HeartHandshake, LifeBuoy, Gift, MapPin, TriangleAlert, Users, Newspaper } from "lucide-react";
import { siteConfig } from "@/config/site";
import { LinkButton } from "@/components/shared/link-button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";

export async function SiteHeader() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";

  const primaryNav = [
    { href: "/", label: t.nav.home },
    { href: "/map", label: isFr ? "Carte & Centres" : "خريطة المراكز", icon: MapPin },
    { href: "/affected-areas", label: t.nav.affectedAreas, icon: TriangleAlert },
    { href: "/volunteers", label: isFr ? "Bénévolat" : "المتطوعون", icon: Users },
    { href: "/official-information", label: isFr ? "Communiqués" : "المستجدات والبيانات", icon: Newspaper },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80 shadow-xs">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-3 sm:px-4">
        {/* Brand and Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <MobileNav locale={locale} />
          <Link href="/" className="flex items-center gap-2 font-black shrink-0 group">
            <span className="flex size-9 items-center justify-center rounded-xl bg-algeria-green text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <HeartHandshake className="size-5" />
            </span>
            <span className="font-black text-base sm:text-lg whitespace-nowrap tracking-tight text-foreground">
              {siteConfig.shortName}
            </span>
          </Link>
        </div>

        {/* Simplified Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1" aria-label={isFr ? "Navigation principale" : "التنقل الرئيسي"}>
          {primaryNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95 whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Header Action Buttons & Language Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <LanguageSwitcher current={locale} label={t.language.change} />

          <LinkButton
            href="/help"
            size="sm"
            variant="outline"
            className="hidden md:inline-flex border-priority-critical/40 text-priority-critical hover:bg-priority-critical/10 font-bold rounded-xl h-9 whitespace-nowrap"
          >
            <LifeBuoy className="size-3.5 animate-pulse" />
            <span>{t.cta.needHelp}</span>
          </LinkButton>

          <LinkButton
            href="/donate"
            size="sm"
            className="bg-algeria-green hover:bg-algeria-green/90 text-white font-bold rounded-xl h-9 shadow-xs whitespace-nowrap"
          >
            <Gift className="size-3.5" />
            <span className="hidden xs:inline">{t.cta.haveAid}</span>
            <span className="xs:hidden">{isFr ? "Dons" : "تبرع"}</span>
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
