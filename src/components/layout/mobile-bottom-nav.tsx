"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Gift, TriangleAlert, Menu } from "lucide-react";
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
      href: "/help",
      label: isFr ? "Besoin d'aide" : "طلب إغاثة",
      icon: TriangleAlert,
      active: pathname === "/help",
      tone: "text-priority-critical",
    },
    {
      href: "/donate",
      label: isFr ? "Faire un don" : "تقديم مساعدة",
      icon: Gift,
      active: pathname === "/donate",
      isCta: true,
    },
    {
      href: "/map",
      label: isFr ? "Carte" : "الخريطة",
      icon: MapPin,
      active: pathname === "/map",
    },
  ];

  return (
    <>
      <nav
        aria-label={isFr ? "Navigation mobile principale" : "شريط التنقل السفلي"}
        className="fixed bottom-0 inset-x-0 z-40 block lg:hidden border-t border-border/80 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/90 shadow-lg safe-area-pb"
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
                      "flex size-12 items-center justify-center rounded-full bg-algeria-green text-white shadow-lg shadow-algeria-green/25 transition-transform duration-200 active:scale-95 group-hover:scale-105",
                      item.active && "scale-105 shadow-algeria-green/40"
                    )}
                  >
                    <Icon className="size-6 shrink-0" />
                  </div>
                  <span
                    className={cn(
                      "mt-1 text-[10px] font-bold truncate leading-tight transition-colors",
                      item.active ? "text-algeria-green font-extrabold" : "text-algeria-green"
                    )}
                  >
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
                    ? (item.tone || "text-algeria-green") + " font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("size-5 transition-transform", item.active && "scale-110", !item.active && item.tone ? "text-priority-critical/70" : "")} />
                <span className="mt-1 text-[10px] font-semibold leading-none truncate">
                  {item.label}
                </span>
                {item.active && (
                  <span className={cn("mt-0.5 size-1 rounded-full", item.tone ? "bg-priority-critical" : "bg-algeria-green")} />
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
