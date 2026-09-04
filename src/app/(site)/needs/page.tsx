import type { Metadata } from "next";

import { EmergencySection } from "@/components/shared/emergency-section";
import { EmptyState } from "@/components/shared/empty-state";
import { NeedCard } from "@/components/shared/need-card";
import { Icon } from "@/components/icons";
import { Action, Chip, PageHero, SECTION, SHELL } from "@/components/site";
import { getAllActiveNeeds, getCategories } from "@/lib/data/public";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { NeedsFilters } from "./needs-filters";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.nav.needs,
    description: t.needs.pageSubtitle,
  };
}

/** No artboard — design.md §7.3, restyle-and-keep. */
export default async function NeedsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; commune?: string; priority?: string }>;
}) {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";
  const params = await searchParams;
  const [needs, categories] = await Promise.all([getAllActiveNeeds(), getCategories()]);

  const communes = [...new Set(needs.map((n) => n.commune))].sort();
  const usedCategorySlugs = new Set(needs.map((n) => n.categories?.slug).filter(Boolean));
  const relevantCategories = categories.filter((c) => usedCategorySlugs.has(c.slug));

  const filtered = needs.filter((n) => {
    if (params.category && n.categories?.slug !== params.category) return false;
    if (params.commune && n.commune !== params.commune) return false;
    if (params.priority && n.priority !== params.priority) return false;
    return true;
  });

  const veterinaryNeedsCount = needs.filter(
    (n) => n.categories?.slug === "veterinary" || n.category_id === "veterinary",
  ).length;

  return (
    <>
      <PageHero
        eyebrow={isFr ? "Besoins de terrain — mis à jour en continu" : "احتياجات ميدانية — تُحدَّث باستمرار"}
        eyebrowIcon="package"
        title={t.needs.pageTitle}
        lede={t.needs.pageSubtitle}
      />

      {/* Veterinary appeal — a standing call-out, not a filter chip. */}
      <div className={`${SHELL} ${SECTION}`}>
        <section className="border border-haba-green bg-haba-green-tint p-4 desktop:p-5">
          <div className="flex flex-col gap-4 desktop:flex-row desktop:items-center desktop:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center bg-haba-green text-white">
                <Icon name="horse" size={20} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[17px] font-bold text-haba-forest">
                    {t.needs.animalMedications.title}
                  </h2>
                  <Chip tone="green" fill="outline" size="xs">
                    {t.needs.animalMedications.badge}
                  </Chip>
                  {veterinaryNeedsCount > 0 && (
                    <Chip tone="red" fill="tint" size="xs">
                      {veterinaryNeedsCount} {t.needs.animalMedications.activeCount}
                    </Chip>
                  )}
                </div>
                <p className="mt-1.5 max-w-[760px] text-sm leading-relaxed text-haba-ink-2">
                  {t.needs.animalMedications.desc}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Action href="/donate?category=veterinary" variant="primary" size="sm" icon="horse">
                {t.needs.animalMedications.provideBtn}
              </Action>
              <Action
                href={params.category === "veterinary" ? "/needs" : "/needs?category=veterinary"}
                variant="outline"
                size="sm"
              >
                {params.category === "veterinary"
                  ? t.needs.animalMedications.allNeedsBtn
                  : t.needs.animalMedications.filterBtn}
              </Action>
            </div>
          </div>
        </section>
      </div>

      <div className={`${SHELL} ${SECTION}`}>
        <NeedsFilters
          categories={relevantCategories}
          communes={communes}
          locale={locale}
          labels={{
            priority: t.needs.filterPriority,
            commune: t.needs.filterCommune,
            category: t.needs.filterCategory,
            clearFilters: t.needs.clearFilters,
          }}
        />

        <p className="mt-4 text-[13.5px] text-haba-muted">
          {t.needs.showingPrefix} <strong className="text-haba-ink">{filtered.length}</strong>{" "}
          {t.needs.outOf} {needs.length} {t.needs.activeNeedsCount}
        </p>

        {filtered.length === 0 ? (
          <EmptyState title={t.needs.emptyTitle} description={t.needs.emptyDesc} className="mt-4" />
        ) : (
          <div className="mt-4 grid gap-4 desktop:grid-cols-2 wide:grid-cols-3">
            {filtered.map((need) => (
              <NeedCard key={need.id} need={need} locale={locale} />
            ))}
          </div>
        )}
      </div>

      <EmergencySection />
    </>
  );
}
