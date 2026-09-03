"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/icons";
import { Action, FlagStripe, FOCUS_RING } from "@/components/site";
import { useMobileMenu } from "./mobile-menu-context";

export type NavItem = { href: string; label: string; icon: IconName };

/**
 * Header row + the inline mobile menu. design.md §3.4
 *
 * The mobile menu is an inline stacked panel under the header, not a sheet —
 * that is what the artboard draws, and it keeps the emergency CTA visible
 * while the menu is open.
 */
export function SiteHeaderBar({
  brand,
  brandSubtitle,
  homeLabel,
  navLabel,
  openMenuLabel,
  closeMenuLabel,
  items,
  haveAidLabel,
  needHelpLabel,
}: {
  brand: string;
  brandSubtitle: string;
  homeLabel: string;
  navLabel: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  items: NavItem[];
  haveAidLabel: string;
  needHelpLabel: string;
}) {
  const pathname = usePathname();
  const { open, toggle } = useMobileMenu();

  return (
    <header className="sticky top-0 z-40 bg-haba-surface max-desktop:shadow-none">
      <div className="mx-auto flex h-15 max-w-[1200px] items-center justify-between gap-3 px-4 desktop:h-19 desktop:px-6">
        <Link
          href="/"
          aria-label={homeLabel}
          className={cn("flex shrink-0 items-center gap-2.5 desktop:gap-3.5", FOCUS_RING)}
        >
          <span className="flex size-9.5 items-center justify-center bg-haba-green text-white desktop:size-11.5">
            <Icon name="heart-check" size={22} />
          </span>
          <span>
            <span className="block font-haba-display text-[21px] font-bold leading-none text-haba-forest desktop:text-[clamp(20px,2.4vw,26px)]">
              {brand}
            </span>
            <span className="mt-1 hidden text-xs text-haba-muted wide:block">
              {brandSubtitle}
            </span>
          </span>
        </Link>

        <nav
          aria-label={navLabel}
          className="hidden items-center gap-4.5 text-[14.5px] font-medium desktop:flex wide:gap-7"
        >
          {items.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap py-1.5",
                  active ? "font-semibold text-haba-green" : "text-haba-ink hover:text-haba-green",
                  FOCUS_RING,
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 desktop:gap-2">
          {/* Hidden on mobile: the tab bar already carries "تقديم مساعدة". */}
          <Action href="/donate" variant="primary" size="sm" icon="gift" className="max-desktop:hidden">
            {haveAidLabel}
          </Action>
          <Action href="/help" variant="danger" size="sm" icon="alert-02">
            {needHelpLabel}
          </Action>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            aria-label={open ? closeMenuLabel : openMenuLabel}
            className={cn(
              "flex size-10 items-center justify-center border border-haba-border bg-haba-surface text-haba-forest desktop:hidden",
              FOCUS_RING,
            )}
          >
            <Icon name={open ? "cancel-01" : "menu-01"} size={20} />
          </button>
        </div>
      </div>

      <FlagStripe />

      <div
        id="site-mobile-menu"
        hidden={!open}
        className="border-b border-haba-border bg-haba-surface py-2 desktop:hidden"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 px-4 py-3.5 text-[14.5px] font-semibold text-haba-ink",
              FOCUS_RING,
            )}
          >
            <Icon name={item.icon} size={20} className="text-haba-green" />
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
