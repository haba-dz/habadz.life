"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/icons";
import { Action, BrandMark, FlagStripe, FOCUS_RING } from "@/components/site";
import { useMobileMenu } from "./mobile-menu-context";

export type NavItem = {
  href: string;
  label: string;
  /** Shown below 1200px when the full label does not fit. design.md §8.4 */
  labelCompact?: string;
  icon: IconName;
};

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
          className={cn("flex min-w-0 items-center gap-2.5 desktop:gap-3.5", FOCUS_RING)}
        >
          <span className="flex size-9.5 items-center justify-center bg-haba-green text-white desktop:size-11.5">
            <BrandMark size={22} />
          </span>
          <span className="min-w-0">
            <span className="block font-haba-display text-[21px] font-bold leading-none text-haba-forest desktop:text-[clamp(20px,2.4vw,26px)]">
              {brand}
            </span>
            <span className="mt-1 hidden truncate text-xs text-haba-muted wide:block">
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
                  // The 3px underline is the state, not the green: at 14.5px a
                  // colour swap alone is easy to miss, and colour on its own is
                  // not an allowed carrier of state. design.md §8.5
                  "relative whitespace-nowrap py-1.5",
                  "after:absolute after:inset-x-0 after:-bottom-1 after:h-[3px] after:bg-haba-green",
                  active
                    ? "font-bold text-haba-green"
                    : "text-haba-ink hover:text-haba-green after:scale-x-0 hover:after:scale-x-100 after:bg-haba-green/40 after:transition-transform",
                  FOCUS_RING,
                )}
              >
                {item.labelCompact ? (
                  <>
                    <span className="max-wide:hidden">{item.label}</span>
                    <span className="wide:hidden">{item.labelCompact}</span>
                  </>
                ) : (
                  item.label
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 desktop:gap-2">
          {/*
            Only ≥1200px. Below that the tab bar carries "تقديم مساعدة" (≤860px),
            and in the 861–1199px band the header has no room for it: brand +
            nav + both CTAs measure 1064px against 789px of usable width in
            French. The red emergency CTA is the one that survives the squeeze.
            design.md §8.4
          */}
          <Action href="/donate" variant="primary" size="sm" icon="gift" className="max-wide:hidden">
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
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 border-s-[3px] px-4 py-3.5 text-[14.5px]",
                active
                  ? "border-haba-green bg-haba-green-tint font-bold text-haba-green"
                  : "border-transparent font-semibold text-haba-ink",
                FOCUS_RING,
              )}
            >
              <Icon name={item.icon} size={20} className="text-haba-green" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
