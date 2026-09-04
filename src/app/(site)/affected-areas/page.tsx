import type { Metadata } from "next";

import { EmergencySection } from "@/components/shared/emergency-section";
import { Icon } from "@/components/icons";
import {
  Action,
  Chip,
  HairlineCell,
  HairlineGrid,
  PageHero,
  SECTION,
  SHELL,
  severityTone,
} from "@/components/site";
import { getSeverityLabel, severityRank } from "@/lib/constants";
import { getAffectedAreas } from "@/lib/data/public";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { AreasFilters } from "./areas-filters";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.nav.affectedAreas,
    description: t.affectedAreas.pageSubtitle,
  };
}

/** design.md §5.4 */
export default async function AffectedAreasPage({
  searchParams,
}: {
  searchParams: Promise<{ wilaya?: string; severity?: string; q?: string }>;
}) {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";
  const [params, areas] = await Promise.all([searchParams, getAffectedAreas()]);

  const wilayaName = (a: (typeof areas)[number]) => (isFr && a.wilaya_fr ? a.wilaya_fr : a.wilaya);
  const communeName = (a: (typeof areas)[number]) =>
    isFr && a.commune_fr ? a.commune_fr : a.commune;

  const wilayas = [...new Set(areas.map((a) => a.wilaya))];
  const severities = [...new Set(areas.map((a) => a.severity))].sort(
    (a, b) => severityRank[a] - severityRank[b],
  );

  const q = (params.q ?? "").trim().toLowerCase();
  const filtered = areas.filter((a) => {
    if (params.wilaya && a.wilaya !== params.wilaya) return false;
    if (params.severity && a.severity !== params.severity) return false;
    if (q && !`${a.commune} ${a.commune_fr ?? ""} ${a.daira} ${a.spot ?? ""}`.toLowerCase().includes(q))
      return false;
    return true;
  });

  /**
   * The artboard's table is one row per commune with a hotspot count; the table
   * stores one row per recorded spot. Aggregate to match, taking the worst
   * severity and the field note that goes with it.
   */
  const rows = [...filtered
    .reduce((m, a) => {
      const key = `${a.wilaya}/${a.commune}`;
      const cur = m.get(key);
      if (!cur) {
        m.set(key, { commune: communeName(a), wilaya: wilayaName(a), severity: a.severity, count: 1, note: a.notes ?? a.spot ?? "" });
      } else {
        cur.count += 1;
        if (severityRank[a.severity] < severityRank[cur.severity]) {
          cur.severity = a.severity;
          cur.note = a.notes ?? a.spot ?? cur.note;
        }
      }
      return m;
    }, new Map<string, { commune: string; wilaya: string; severity: (typeof areas)[number]["severity"]; count: number; note: string }>())
    .values()]
    .sort((x, y) => severityRank[x.severity] - severityRank[y.severity] || y.count - x.count);

  const summary = [...areas
    .reduce((m, a) => {
      const key = wilayaName(a);
      const cur = m.get(key) ?? { count: 0, severe: 0 };
      cur.count += 1;
      if (severityTone[a.severity] === "red") cur.severe += 1;
      return m.set(key, cur);
    }, new Map<string, { count: number; severe: number }>())
    .entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.count - a.count);

  const totalCommunes = new Set(areas.map((a) => `${a.wilaya}/${a.commune}`)).size;

  return (
    <>
      <PageHero
        tone="red"
        eyebrow={isFr ? "Géographie de la campagne — données vérifiées" : "جغرافيا الحملة — بيانات موثّقة"}
        eyebrowIcon="alert-02"
        title={t.affectedAreas.pageTitle}
        lede={
          isFr
            ? `${totalCommunes} communes enregistrées sur ${wilayas.length} wilayas. Chaque zone est classée par niveau de dégâts et nombre de foyers ; les données sont mises à jour à chaque communiqué officiel.`
            : `${totalCommunes} بلدية مسجَّلة عبر ${wilayas.length} ولايات. تُصنَّف كل منطقة حسب مستوى الضرر وعدد البؤر المسجَّلة، وتُحدَّث البيانات مع كل بيان رسمي جديد.`
        }
      />

      {summary.length > 0 && (
        <section className={`${SHELL} ${SECTION}`}>
          <HairlineGrid min={215}>
            {summary.map((w) => (
              <HairlineCell key={w.name} className="flex items-start justify-between gap-3 p-4 desktop:p-[22px]">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[15.5px] font-bold text-haba-ink desktop:text-[18px]">
                    <Icon name="location-05" size={18} className="text-haba-green" />
                    {t.home.affectedAreas.wilayaPrefix} {w.name}
                  </p>
                  <p className="mt-1 text-[13px] text-haba-muted">
                    {w.severe} {t.home.affectedAreas.severeCount}
                  </p>
                </div>
                <span className="text-[26px] font-bold leading-none text-haba-red desktop:text-[clamp(23px,3.4vw,36px)]">
                  {w.count}
                </span>
              </HairlineCell>
            ))}
          </HairlineGrid>
        </section>
      )}

      <section className={`${SHELL} ${SECTION}`}>
        <AreasFilters
          wilayas={wilayas}
          severities={severities}
          locale={locale}
          shown={rows.length}
          total={totalCommunes}
        />

        <div className="mt-4 border border-haba-border bg-haba-surface">
          <div className="hidden grid-cols-[1.4fr_1fr_.9fr_.8fr_1.8fr] gap-3 bg-haba-bg px-5 py-3 text-[12.5px] font-semibold text-haba-muted desktop:grid">
            <span>{isFr ? "Commune / zone" : "البلدية / المنطقة"}</span>
            <span>{isFr ? "Wilaya" : "الولاية"}</span>
            <span>{isFr ? "Niveau" : "مستوى الضرر"}</span>
            <span>{isFr ? "Foyers" : "البؤر"}</span>
            <span>{isFr ? "Situation" : "الوضع الميداني"}</span>
          </div>

          {rows.length === 0 ? (
            <p className="p-8 text-center text-sm text-haba-muted">
              {isFr
                ? "Aucune zone ne correspond à ces filtres."
                : "لا توجد مناطق مطابقة لهذه الفلاتر."}
            </p>
          ) : (
            rows.map((r) => (
              /*
                One markup, two layouts. Below 861px the five table cells were
                each taking a full-width line, so every row was five stacked
                lines against an empty half — and the bare count had no column
                header left to explain it. On mobile the row is placed as a
                compact card instead: name and count on the first line, wilaya
                and severity on the second, the field note across the third.
              */
              <div
                key={`${r.wilaya}/${r.commune}`}
                className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 border-t border-haba-border p-4 text-[14.5px] first:border-t-0 desktop:grid-cols-[1.4fr_1fr_.9fr_.8fr_1.8fr] desktop:gap-3 desktop:px-[22px] desktop:py-[15px] desktop:first:border-t"
              >
                <span className="col-start-1 row-start-1 flex items-center gap-2 font-semibold text-haba-ink desktop:row-auto">
                  <Icon name="location-05" size={18} className="text-haba-green" />
                  {r.commune}
                </span>
                <span className="col-start-1 row-start-2 text-haba-ink-2 desktop:col-auto desktop:row-auto">
                  {r.wilaya}
                </span>
                <span className="col-start-2 row-start-2 justify-self-end desktop:col-auto desktop:row-auto desktop:justify-self-start">
                  <Chip tone={severityTone[r.severity]} fill="tint" size="sm">
                    {getSeverityLabel(r.severity, locale)}
                  </Chip>
                </span>
                <span className="col-start-2 row-start-1 justify-self-end whitespace-nowrap desktop:col-auto desktop:row-auto desktop:justify-self-start">
                  <span className="font-bold text-haba-red">{r.count}</span>
                  {/* The desktop column header carries this; on mobile there is none. */}
                  <span className="text-[12px] text-haba-muted desktop:hidden">
                    {" "}
                    {isFr ? "foyers" : "بؤرة"}
                  </span>
                </span>
                {r.note ? (
                  <span className="col-span-2 row-start-3 text-[13.5px] text-haba-ink-2 desktop:col-auto desktop:row-auto">
                    {r.note}
                  </span>
                ) : (
                  <span className="hidden text-[13.5px] text-haba-ink-2 desktop:block">—</span>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* CTA panel — §5.4 */}
      <section className={`${SHELL} ${SECTION}`}>
        <div className="flex flex-col gap-5 border border-haba-border bg-haba-forest p-5 text-white desktop:flex-row desktop:items-center desktop:justify-between desktop:gap-[clamp(20px,2.6vw,32px)] desktop:px-[clamp(18px,2.4vw,32px)] desktop:py-[clamp(22px,2.8vw,34px)]">
          <div>
            <h2 className="font-haba-display text-[22px] font-bold leading-tight desktop:text-[clamp(22px,3vw,30px)]">
              {isFr
                ? "Vous souhaitez contribuer au secours de ces zones ?"
                : "هل ترغب في المساهمة في إغاثة هذه المناطق؟"}
            </h2>
            <p className="mt-2 max-w-[620px] text-[15px] leading-relaxed text-haba-green-100">
              {isFr
                ? "Enregistrez le matériel dont vous disposez, ou proposez votre véhicule pour acheminer l'aide vers les centres de collecte les plus proches."
                : "سجّل ما يتوفر لديك من مواد إغاثية، أو تطوّع بمركبتك لنقل المساعدات مباشرة إلى مراكز التجميع الأقرب للمناطق المتضررة."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Action href="/donate" variant="onDark" size="md" icon="gift">
              {t.cta.haveAid}
            </Action>
            <Action href="/transport" variant="onDarkOutline" size="md" icon="truck-delivery">
              {t.cta.canTransport}
            </Action>
          </div>
        </div>
      </section>

      <EmergencySection />
    </>
  );
}
