"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Package } from "lucide-react";

import { Icon } from "@/components/icons";
import { FOCUS_RING } from "@/components/site";
import {
  categoryIcon,
  getCategoryLabel,
  getPriorityLabel,
  priorityIcon,
  type PriorityLevel,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AvailableLocale } from "@/i18n/locales";
import type { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["categories"]["Row"];

const PRIORITY_KEYS: PriorityLevel[] = ["critical", "high", "medium", "low"];

/**
 * Toggle chip. Square and hairline like the rest of the system — the rounded
 * pill it replaced predates the redesign. design.md §3.8
 *
 * A real <button aria-pressed>, not a link: these toggle, and a pressed state
 * is what assistive tech needs to hear.
 */
function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 border px-3 py-[7px] text-[13px] transition-colors",
        active
          ? "border-haba-green bg-haba-green font-bold text-white"
          : "border-haba-border bg-haba-surface font-semibold text-haba-ink hover:border-haba-green hover:text-haba-green",
        FOCUS_RING,
      )}
    >
      {children}
    </button>
  );
}

function Group({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p id={id} className="mb-2 text-[13px] font-semibold text-haba-ink-2">
        {heading}
      </p>
      <div role="group" aria-labelledby={id} className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
}

export function NeedsFilters({
  categories,
  communes,
  locale = "ar",
  labels,
}: {
  categories: Category[];
  communes: string[];
  locale?: AvailableLocale;
  labels?: {
    priority: string;
    commune: string;
    category: string;
    clearFilters: string;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFr = locale === "fr";

  const current = {
    category: searchParams.get("category"),
    commune: searchParams.get("commune"),
    priority: searchParams.get("priority"),
  };
  const hasFilters = Boolean(current.category || current.commune || current.priority);

  function toggle(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) params.delete(key);
    else params.set(key, value);
    router.push(params.toString() ? `${pathname}?${params}` : pathname, { scroll: false });
  }

  const priorityHeading = labels?.priority ?? (isFr ? "Priorité" : "الأولوية");
  const communeHeading = labels?.commune ?? (isFr ? "Commune" : "البلدية");
  const categoryHeading = labels?.category ?? (isFr ? "Catégorie" : "نوع المادة");
  const clearFiltersText = labels?.clearFilters ?? (isFr ? "Effacer les filtres" : "مسح كل الفلاتر");

  return (
    <div className="flex flex-col gap-4 border border-haba-border bg-haba-surface p-4 desktop:p-5">
      <Group id="needs-filter-priority" heading={priorityHeading}>
        {PRIORITY_KEYS.map((value) => {
          const PriorityGlyph = priorityIcon[value];
          return (
            <FilterChip
              key={value}
              active={current.priority === value}
              onClick={() => toggle("priority", value)}
            >
              <PriorityGlyph className="size-3" fill="currentColor" aria-hidden />
              {getPriorityLabel(value, locale)}
            </FilterChip>
          );
        })}
      </Group>

      {communes.length > 0 && (
        <Group id="needs-filter-commune" heading={communeHeading}>
          {communes.map((c) => (
            <FilterChip
              key={c}
              active={current.commune === c}
              onClick={() => toggle("commune", c)}
            >
              {c}
            </FilterChip>
          ))}
        </Group>
      )}

      <Group id="needs-filter-category" heading={categoryHeading}>
        {categories.map((c) => {
          const CategoryGlyph = categoryIcon[c.slug] ?? Package;
          return (
            <FilterChip
              key={c.id}
              active={current.category === c.slug}
              onClick={() => toggle("category", c.slug)}
            >
              <CategoryGlyph className="size-3.5" aria-hidden />
              {getCategoryLabel(c.slug, c.name_ar, locale)}
            </FilterChip>
          );
        })}
      </Group>

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className={cn(
            "inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-haba-red",
            FOCUS_RING,
          )}
        >
          <Icon name="cancel-01" size={15} />
          {clearFiltersText}
        </button>
      )}
    </div>
  );
}
