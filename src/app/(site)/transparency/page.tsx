import type { Metadata } from "next";

import { CategoryIcon } from "@/components/shared/category-icon";
import { EmergencySection } from "@/components/shared/emergency-section";
import { EmptyState } from "@/components/shared/empty-state";
import {
  HairlineCell,
  HairlineGrid,
  PageHero,
  SECTION,
  SHELL,
  SectionHeader,
  StatTile,
} from "@/components/site";
import { formatQuantity, getCategoryName, getUnitLabel } from "@/lib/constants";
import {
  getStatDistributionsByCategory,
  getStatDonationsByCategory,
  getStatOverview,
} from "@/lib/data/public";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.nav.transparency,
    description: t.transparency.pageSubtitle,
  };
}

/**
 * The one route with no artboard at all (design.md §7.3), so the layout is
 * derived from the system rather than copied: hero, a stat pair, and two
 * hairline tables. Totals are grouped by unit and never summed across units.
 */
export default async function TransparencyPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";

  const [stats, donationsByCategory, distributionsByCategory] = await Promise.all([
    getStatOverview(),
    getStatDonationsByCategory(),
    getStatDistributionsByCategory(),
  ]);

  return (
    <>
      <PageHero
        eyebrow={isFr ? "Registre public des mouvements d'aide" : "السجل العلني لحركة المساعدات"}
        eyebrowIcon="dashboard-square-02"
        title={t.transparency.pageTitle}
        lede={t.transparency.pageSubtitle}
      />

      <div className={`${SHELL} ${SECTION}`}>
        <HairlineGrid cols={2}>
          <StatTile
            value={formatQuantity(Number(stats.total_families ?? 0), locale)}
            label={isFr ? "Familles sinistrées enregistrées" : "الأسر المتضررة المسجَّلة"}
            icon="user-group"
            iconPlacement="end"
          />
          <StatTile
            value={formatQuantity(Number(stats.areas_reached ?? 0), locale)}
            label={isFr ? "Zones atteintes par les secours" : "عدد المناطق التي تم الوصول إليها"}
            icon="map-pinpoint-02"
            iconPlacement="end"
            tone="green"
          />
        </HairlineGrid>
      </div>

      <section className={`${SHELL} ${SECTION}`}>
        <SectionHeader
          index={1}
          eyebrow={isFr ? "Entrées" : "الوارد"}
          icon="package"
          title={
            isFr
              ? "Dons matériels enregistrés (par type et unité)"
              : "كمية المساعدات المسجَّلة (حسب النوع والوحدة)"
          }
        />

        {donationsByCategory.length === 0 ? (
          <EmptyState
            title={isFr ? "Aucun don enregistré pour le moment" : "لا توجد مساعدات مسجَّلة بعد"}
          />
        ) : (
          <div className="border border-haba-border bg-haba-surface">
            {donationsByCategory.map((row) => (
              <div
                key={`${row.slug}-${row.unit}`}
                className="flex items-center justify-between gap-3 border-t border-haba-border px-4 py-3.5 text-[14.5px] first:border-t-0 desktop:px-5"
              >
                <span className="flex items-center gap-2.5 font-semibold text-haba-ink">
                  <CategoryIcon slug={row.slug} className="size-4" />
                  {getCategoryName(row.slug, row.name_ar, locale)}
                </span>
                <span className="shrink-0 font-bold tabular-nums text-haba-green">
                  {formatQuantity(Number(row.total_quantity), locale)}{" "}
                  <span className="font-semibold text-haba-ink-2">
                    {getUnitLabel(row.unit, locale)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="mt-2.5 text-[12.5px] leading-relaxed text-haba-muted">
          {isFr
            ? "Les quantités d'unités différentes ne sont pas additionnées (ex : litres d'eau et couvertures ne se cumulent pas)."
            : "لا يتم جمع كميات بوحدات مختلفة معًا (مثال: لا نجمع لترات الماء مع عدد البطانيات)."}
        </p>
      </section>

      <section className={`${SHELL} ${SECTION}`}>
        <SectionHeader
          index={2}
          eyebrow={isFr ? "Sorties" : "الصادر"}
          icon="package-process"
          title={isFr ? "Aides distribuées aux familles" : "كمية المساعدات الموزَّعة على الأسر"}
        />

        {distributionsByCategory.length === 0 ? (
          <EmptyState
            title={
              isFr
                ? "Aucune distribution enregistrée pour le moment"
                : "لا توجد عمليات توزيع مسجَّلة بعد"
            }
            description={
              isFr
                ? "Les bilans apparaîtront dès la première distribution sur le terrain."
                : "ستظهر هنا فور تسجيل أول عملية توزيع ميدانية."
            }
          />
        ) : (
          <HairlineGrid min={280}>
            {distributionsByCategory.map((row) => (
              <HairlineCell key={`${row.slug}-${row.unit}`} className="p-4 desktop:px-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5 text-[14.5px] font-semibold text-haba-ink">
                    <CategoryIcon slug={row.slug} className="size-4" />
                    {getCategoryName(row.slug, row.name_ar, locale)}
                  </span>
                  <span className="shrink-0 font-bold tabular-nums text-haba-green">
                    {formatQuantity(Number(row.total_quantity), locale)}{" "}
                    <span className="font-semibold text-haba-ink-2">
                      {getUnitLabel(row.unit, locale)}
                    </span>
                  </span>
                </div>
                <p className="mt-1.5 text-[12.5px] text-haba-muted">
                  {isFr
                    ? `Bénéficiant à environ ${formatQuantity(Number(row.total_families), locale)} familles`
                    : `استفادت منها ${formatQuantity(Number(row.total_families), locale)} أسرة تقريبًا`}
                </p>
              </HairlineCell>
            ))}
          </HairlineGrid>
        )}
      </section>

      <EmergencySection />
    </>
  );
}
