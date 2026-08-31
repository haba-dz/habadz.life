"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, LifeBuoy, Gift, Menu } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import type { AvailableLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

export function MobileBottomNav({ locale }: { locale: AvailableLocale }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isFr = locale === "fr";

  // Hide bottom nav on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const items = [
    {
      href: "/",
      label: isFr ? "Accueil" : "الرئيسية",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/map",
      label: isFr ? "Carte" : "الخريطة",
      icon: MapPin,
      active: pathname === "/map",
    },
    {
      href: "/help",
      label: isFr ? "Urgence" : "طلب إغاثة",
      icon: LifeBuoy,
      active: pathname === "/help" || pathname?.startsWith("/help/"),
      isCta: true,
    },
    {
      href: "/donate",
      label: isFr ? "Dons" : "مساعدات",
      icon: Gift,
      active: pathname === "/donate",
    },
  ];

  return (
    <>
      <nav
        aria-label={isFr ? "Navigation mobile principale" : "شريط التنقل السفلي"}
        className="fixed bottom-0 inset-x-0 z-40 block lg:hidden border-t border-border/80 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/85 safe-area-pb shadow-lg"
      >
        <div className="flex h-16 items-center justify-around px-2 max-w-md mx-auto">
          {items.map((item) => {
            const Icon = item.icon;
            if (item.isCta) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-5 relative group"
                  aria-label={item.label}
                >
                  <div
                    className={cn(
                      "flex size-13 items-center justify-center rounded-2xl bg-priority-critical text-white shadow-md shadow-priority-critical/30 transition-all active:scale-95 group-hover:scale-105",
                      item.active && "ring-4 ring-priority-critical/25 scale-105"
                    )}
                  >
                    <Icon className="size-6 animate-pulse" />
                  </div>
                  <span className="mt-1 text-[10px] font-black text-priority-critical truncate">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center py-1 text-center transition-colors min-h-[48px] rounded-xl active:bg-muted/40",
                  item.active
                    ? "text-algeria-green font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("size-5 transition-transform", item.active && "scale-110")} />
                <span className="mt-1 text-[10px] font-semibold leading-none truncate">
                  {item.label}
                </span>
                {item.active && (
                  <span className="mt-0.5 size-1 rounded-full bg-algeria-green" />
                )}
              </Link>
            );
          })}

          {/* More Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex flex-1 flex-col items-center justify-center py-1 text-center text-muted-foreground hover:text-foreground transition-colors min-h-[48px] rounded-xl active:bg-muted/40 cursor-pointer"
            aria-label={isFr ? "Toutes les rubriques" : "جميع الأقسام والخدمات"}
          >
            <Menu className="size-5" />
            <span className="mt-1 text-[10px] font-semibold leading-none truncate">
              {isFr ? "Menu" : "القائمة"}
            </span>
          </button>
        </div>
      </nav>

      {/* Categorized Drawer Instance */}
      <MobileNav
        locale={locale}
        isOpen={drawerOpen}
        onOpenChange={setDrawerOpen}
        trigger={null}
      />
    </>
  );
}
