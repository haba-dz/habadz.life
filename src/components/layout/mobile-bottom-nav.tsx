"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/icons";
import { FOCUS_RING } from "@/components/site";
import { useMobileMenu } from "./mobile-menu-context";

export type TabBarLabels = {
  label: string;
  home: string;
  donate: string;
  help: string;
  map: string;
  menu: string;
};

/**
 * Five-item tab bar, ≤860px. design.md §3.6
 *
 * The middle item is inverted — red ground, white text — so the emergency
 * action is the visual anchor of the bar. Flat, not a floating circle.
 *
 * The artboard says `position: sticky`; that only works because the artboard is
 * one scrolling column. `fixed` is what actually pins it in the real layout,
 * paired with the 74px body padding in globals.css.
 */
export function MobileBottomNav({ labels }: { labels: TabBarLabels }) {
  const pathname = usePathname();
  const { open, toggle } = useMobileMenu();

  if (pathname?.startsWith("/admin")) return null;

  const items: { href: string; label: string; icon: IconName; cta?: boolean }[] = [
    { href: "/", label: labels.home, icon: "home-09" },
    { href: "/donate", label: labels.donate, icon: "gift" },
    { href: "/help", label: labels.help, icon: "alert-02", cta: true },
    { href: "/map", label: labels.map, icon: "maps-location-02" },
  ];

  return (
    <nav
      aria-label={labels.label}
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-haba-border bg-haba-surface desktop:hidden"
    >
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-[5px] px-1 py-2.5 text-center text-[10.5px] leading-tight",
              item.cta
                ? "bg-haba-red font-bold text-white"
                : active
                  ? "font-bold text-haba-green"
                  : "font-semibold text-haba-muted",
              FOCUS_RING,
            )}
          >
            <Icon name={item.icon} size={20} />
            {item.label}
          </Link>
        );
      })}

      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        className={cn(
          "flex flex-col items-center justify-center gap-[5px] px-1 py-2.5 text-center text-[10.5px] font-semibold leading-tight",
          open ? "text-haba-green" : "text-haba-muted",
          FOCUS_RING,
        )}
      >
        <Icon name="menu-01" size={20} />
        {labels.menu}
      </button>
    </nav>
  );
}
