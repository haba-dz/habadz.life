import { EmergencySection } from "@/components/shared/emergency-section";
import { PlatformNotice } from "@/components/shared/platform-notice";
import { Icon, type IconName } from "@/components/icons";
import {
  Action,
  Chip,
  HairlineCell,
  HairlineGrid,
  HairlineRail,
  SECTION,
  SHELL,
  SectionHeader,
  StatTile,
  StatusDot,
  UpdateCard,
  severityTone,
} from "@/components/site";
import { siteConfig } from "@/config/site";
import { formatRelativeTime } from "@/lib/constants";
import {
  getAffectedAreas,
  getOfficialUpdates,
  getPublicMedicalVolunteers,
  getShelters,
  getStatOverview,
} from "@/lib/data/public";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";

  const [stats, updates, shelters, areas, medicalVolunteers] = await Promise.all([
    getStatOverview(),
    getOfficialUpdates(4),
    getShelters(),
    getAffectedAreas(),
    getPublicMedicalVolunteers(),
  ]);

  const wilayaName = (a: (typeof areas)[number]) =>
    (isFr && a.wilaya_fr ? a.wilaya_fr : a.wilaya) ?? a.wilaya;
  const communeName = (a: (typeof areas)[number]) =>
    (isFr && a.commune_fr ? a.commune_fr : a.commune) ?? a.commune;

  // One row per recorded spot, so a count of rows is a count of hotspots.
  const byWilaya = new Map<string, { count: number; severe: number }>();
  for (const a of areas) {
    const key = wilayaName(a);
    const cur = byWilaya.get(key) ?? { count: 0, severe: 0 };
    cur.count += 1;
    if (severityTone[a.severity] === "red") cur.severe += 1;
    byWilaya.set(key, cur);
  }
  const wilayas = [...byWilaya.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.count - a.count);

  const communes = [...areas
    .reduce((m, a) => {
      const n = communeName(a);
      return m.set(n, (m.get(n) ?? 0) + 1);
    }, new Map<string, number>())
    .entries()]
    .map(([name, n]) => ({ name, n }))
    .sort((a, b) => b.n - a.n);

  const doctors = medicalVolunteers.filter((v) => v.specialty !== "veterinarian").length;
  const vets = medicalVolunteers.filter((v) => v.specialty === "veterinarian").length;

  const tiles: { href: string; icon: IconName; cat: string; title: string; desc: string; danger?: boolean }[] = [
    { href: "/help", icon: "alert-02", ...t.home.tiles.help, danger: true },
    { href: "/donate", icon: "gift", ...t.home.tiles.donate },
    { href: "/volunteers", icon: "user-group", ...t.home.tiles.field },
    { href: "/transport", icon: "truck-delivery", ...t.home.tiles.transport },
    { href: "/medical", icon: "stethoscope", ...t.home.tiles.medical },
    { href: "/map", icon: "location-01", ...t.home.tiles.map },
  ];

  const steps = [
    t.home.howItWorks.step1,
    t.home.howItWorks.step2,
    t.home.howItWorks.step3,
    t.home.howItWorks.step4,
  ];

  return (
    <>
      {/* ─────────────────────────────── hero — design.md §5.1(3) */}
      <section className="bg-haba-surface">
        <div className={`${SHELL} grid gap-6 py-6 desktop:grid-cols-[repeat(auto-fit,minmax(min(330px,100%),1fr))] desktop:gap-[clamp(22px,3vw,56px)] desktop:pt-[clamp(26px,4vw,56px)] desktop:pb-[clamp(26px,3.5vw,48px)]`}>
          <div>
            <Chip tone="red" fill="outline" size="sm" className="desktop:hidden">
              <StatusDot tone="red" />
              {t.home.hero.eyebrowMobile}
            </Chip>
            <Chip tone="red" fill="outline" size="md" className="hidden desktop:inline-flex">
              <StatusDot tone="red" />
              {t.home.hero.eyebrow}
            </Chip>

            <h1 className="mt-3 font-haba-display text-[34px] font-bold leading-[1.1] text-haba-forest desktop:text-[clamp(30px,6.4vw,64px)]">
              <span className="desktop:hidden">{t.home.hero.titleMobile}</span>
              <span className="hidden desktop:inline">{siteConfig.shortName}</span>
            </h1>

            <p className="mt-3 hidden font-semibold leading-snug text-haba-ink desktop:block desktop:text-[clamp(18px,2.2vw,24px)]">
              {t.site.tagline}
            </p>

            <p className="mt-3 max-w-[560px] text-[14.5px] leading-relaxed text-haba-ink-2 desktop:text-[16.5px]">
              {t.home.hero.lede}
            </p>

            <div className="mt-5 grid gap-2.5 desktop:flex desktop:gap-2.5">
              <Action href="/donate" variant="primary" icon="gift">
                {t.home.hero.primaryCta}
              </Action>
              <Action href="/map" variant="outline" icon="maps-location-02">
                {t.home.hero.secondaryCta}
              </Action>
            </div>
          </div>

          {/* field situation panel */}
          <div className="border border-haba-border bg-haba-surface-2">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-haba-surface px-4 py-3.5 desktop:px-[18px]">
              <span className="flex items-center gap-2 text-[14.5px] font-bold text-haba-ink desktop:text-[15px]">
                <Icon name="dashboard-square-02" size={18} className="text-haba-green" />
                {t.home.hero.panelTitle}
              </span>
            </div>
            {/* Fixed 2-up: the panel is ~557px at 1200px, which is 4px short of two
                280px auto-fit tracks, and §5.2 wants 2-up on mobile anyway. */}
            <HairlineGrid cols={2} className="border-s-0 [&>*:nth-child(2n)]:border-e-0">
              <StatTile value={stats.active_points} label={t.home.stats.points} icon="package" tone="green" />
              <StatTile value={communes.length} label={t.home.stats.areas} icon="fire" tone="red" />
              <StatTile value={shelters.length} label={t.home.stats.shelters} icon="home-09" />
              <StatTile value={stats.critical_needs} label={t.home.stats.activeNeeds} icon="alert-02" />
            </HairlineGrid>
            <p className="bg-haba-surface px-4 py-3 text-[12.5px] text-haba-muted desktop:px-[18px]">
              {t.home.hero.panelFootnote}
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────── action tiles — §5.1(4) */}
      <section className={`${SHELL} ${SECTION}`}>
        <h2 className="mb-3 flex items-center gap-2.5 text-[21px] font-bold text-haba-forest desktop:hidden">
          <Icon name="grid-view" size={22} className="text-haba-green" />
          {t.home.tiles.heading}
        </h2>
        {/* 2-up on mobile: a percentage basis, since HairlineGrid wraps with flex
            and a grid-cols utility would be inert there. */}
        <HairlineGrid min={180} className="max-desktop:[--hairline-basis:50%]">
          {tiles.map((tile) => (
            <a
              key={tile.title}
              href={tile.href}
              className={`flex flex-col gap-2.5 p-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-haba-green desktop:px-[18px] desktop:py-[22px] ${
                tile.danger ? "bg-haba-red-50" : "bg-haba-surface"
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon
                  name={tile.icon}
                  size={20}
                  className={tile.danger ? "text-haba-red" : "text-haba-green"}
                />
                <span
                  className={`text-[11.5px] font-semibold ${
                    tile.danger ? "text-haba-red" : "text-haba-green"
                  }`}
                >
                  {tile.cat}
                </span>
              </span>
              <span>
                <span
                  className={`block text-[15px] font-bold desktop:text-[16px] ${
                    tile.danger ? "text-haba-red" : "text-haba-ink"
                  }`}
                >
                  {tile.title}
                </span>
                <span className="mt-0.5 block text-xs text-haba-muted desktop:text-[13px]">
                  {tile.desc}
                </span>
              </span>
            </a>
          ))}
        </HairlineGrid>
      </section>

      {/* ─────────────────────────────── 01 updates — §5.1(5) */}
      <section className={`${SHELL} ${SECTION}`}>
        <SectionHeader
          index={1}
          eyebrow={t.home.sections.bulletin}
          icon="news"
          title={t.home.updates.title}
          action={{ href: "/official-information", label: t.home.updates.allInfo }}
        />
        {updates.length > 0 ? (
          <HairlineGrid min={280}>
            {updates.map((u) => (
              <UpdateCard
                key={u.id}
                item={u}
                locale={locale}
                relativeTime={formatRelativeTime(u.published_at, locale)}
                sourcePrefix={t.home.updates.sourcePrefix}
                originalSourceLabel={t.home.originalSource}
              />
            ))}
          </HairlineGrid>
        ) : (
          <EmptyRow>{t.home.noUpdates}</EmptyRow>
        )}
      </section>

      {/* ─────────────────────────────── 02 geography — §5.1(6) */}
      <section className={`${SHELL} ${SECTION}`}>
        <SectionHeader
          index={2}
          eyebrow={t.home.sections.geography}
          icon="map-pinpoint-02"
          title={t.home.affectedAreas.title}
          action={{ href: "/affected-areas", label: t.home.affectedAreas.fullList }}
        />

        {wilayas.length > 0 ? (
          <>
            {/* horizontal rail on mobile, hairline grid on desktop — §5.2 */}
            <HairlineRail className="border border-haba-border desktop:hidden">
              {wilayas.map((w) => (
                <HairlineCell key={w.name} className="w-[62%] shrink-0 p-4">
                  <WilayaCard {...w} prefix={t.home.affectedAreas.wilayaPrefix} unit={t.home.hotspots} severeLabel={t.home.affectedAreas.severeCount} />
                </HairlineCell>
              ))}
            </HairlineRail>

            <HairlineGrid min={215} className="max-desktop:hidden">
              {wilayas.map((w) => (
                <HairlineCell key={w.name} className="p-[22px]">
                  <WilayaCard {...w} prefix={t.home.affectedAreas.wilayaPrefix} unit={t.home.hotspots} severeLabel={t.home.affectedAreas.severeCount} />
                </HairlineCell>
              ))}
            </HairlineGrid>

            {communes.length > 0 && (
              <div className="mt-5 border border-haba-border bg-haba-surface p-4 desktop:px-[22px] desktop:py-5">
                <p className="text-[15px] font-bold text-haba-ink">{t.home.communes.title}</p>
                <p className="mt-0.5 text-[13px] text-haba-muted">{t.home.communes.subtitle}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {communes.map((c) => (
                    <Chip key={c.name} tone="neutral" fill="tint" size="md">
                      {c.name}
                      <span className="font-bold text-haba-red">{c.n}</span>
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyRow>{t.home.noAreas}</EmptyRow>
        )}
      </section>

      {/* ─────────────────────────────── 03 shelters — §5.1(7) */}
      <section className={`${SHELL} ${SECTION}`}>
        <SectionHeader
          index={3}
          eyebrow={t.home.sections.sheltering}
          icon="home-09"
          title={t.home.shelters.title}
          action={{ href: "/map", label: t.home.shelters.onMap, icon: "maps-location-02" }}
        />
        {shelters.length > 0 ? (
          <div className="border border-haba-border bg-haba-surface">
            <div className="hidden grid-cols-[2fr_1.2fr_1.2fr_1fr_1fr] gap-3 bg-haba-bg px-5 py-3 text-[12.5px] font-semibold text-haba-muted desktop:grid">
              <span>{t.home.shelterTable.center}</span>
              <span>{t.home.shelterTable.commune}</span>
              <span>{t.home.shelterTable.accepts}</span>
              <span>{t.home.shelterTable.status}</span>
              <span>{t.home.shelterTable.phone}</span>
            </div>
            {shelters.map((s) => (
              <div
                key={s.id}
                className="grid gap-1.5 border-t border-haba-border p-4 text-[14.5px] first:border-t-0 desktop:grid-cols-[2fr_1.2fr_1.2fr_1fr_1fr] desktop:items-center desktop:gap-3 desktop:px-5 desktop:py-4 desktop:first:border-t"
              >
                <span className="flex items-center gap-2 font-semibold text-haba-ink">
                  <Icon name="building-03" size={18} className="text-haba-green" />
                  {s.name}
                </span>
                <span className="text-haba-ink-2">{s.commune}</span>
                <span className="text-[13.5px] text-haba-ink-2">{s.capacity_note || "—"}</span>
                <span className="flex items-center gap-2 text-[13px] font-semibold text-haba-green">
                  <StatusDot tone="green" />
                  {t.home.shelterTable.open}
                </span>
                {s.phone ? (
                  <a
                    href={`tel:${s.phone.replace(/\s/g, "")}`}
                    dir="ltr"
                    className="flex items-center gap-2 font-bold text-haba-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-haba-green desktop:text-left"
                  >
                    <Icon name="call-02" size={16} />
                    {s.phone}
                  </a>
                ) : (
                  <span className="text-haba-muted">—</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyRow>{t.home.shelterTable.empty}</EmptyRow>
        )}
      </section>

      {/* ─────────────────────────────── 04 volunteers — §5.1(8) */}
      <section className={`${SHELL} ${SECTION}`}>
        <HairlineGrid min={280}>
          <HairlineCell tone="forest" className="p-5 desktop:px-[clamp(18px,2.6vw,36px)] desktop:py-[clamp(22px,3vw,40px)]">
            <p className="text-xs font-semibold text-haba-green-300">
              04 — {t.home.sections.volunteers}
            </p>
            <h2 className="mt-1.5 font-haba-display text-[22px] font-bold leading-tight text-white desktop:text-[clamp(22px,3.2vw,34px)]">
              {t.home.volunteerPanel.title}
            </h2>
            <p className="mt-2.5 text-[15px] leading-relaxed text-haba-green-100">
              {t.home.volunteerPanel.desc}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Action href="/volunteers" variant="onDark" size="md">
                {t.home.volunteerPanel.cta}
              </Action>
              <Action href="/map" variant="onDarkOutline" size="md">
                {t.home.volunteerPanel.altCta}
              </Action>
            </div>
          </HairlineCell>

          <HairlineCell className="p-5 desktop:px-[clamp(18px,2.6vw,36px)] desktop:py-[clamp(22px,3vw,40px)]">
            <p className="text-xs font-semibold text-haba-green">
              {t.home.volunteerPanel.medicalEyebrow}
            </p>
            <h2 className="mt-1.5 font-haba-display text-[22px] font-bold leading-tight text-haba-forest desktop:text-[clamp(22px,3.2vw,34px)]">
              {t.home.volunteerPanel.medicalTitle}
            </h2>
            <p className="mt-2.5 text-[15px] leading-relaxed text-haba-ink-2">
              {t.home.volunteerPanel.medicalDesc}
            </p>
            <div className="my-4 flex gap-6">
              <span>
                <span className="block text-[28px] font-bold leading-none text-haba-green">{doctors}</span>
                <span className="mt-1 block text-[12.5px] text-haba-muted">{t.home.volunteerPanel.doctors}</span>
              </span>
              <span>
                <span className="block text-[28px] font-bold leading-none text-haba-green">{vets}</span>
                <span className="mt-1 block text-[12.5px] text-haba-muted">{t.home.volunteerPanel.vets}</span>
              </span>
            </div>
            <Action href="/medical" variant="primary" size="md">
              {t.home.volunteerPanel.medicalCta}
            </Action>
          </HairlineCell>
        </HairlineGrid>
      </section>

      {/* ─────────────────────────────── 05 housing — §5.1(9) */}
      <section className={`${SHELL} ${SECTION}`}>
        <SectionHeader
          index={5}
          eyebrow={t.home.sections.housing}
          icon="house-04"
          title={t.home.housingSection.title}
          caption={t.home.housingSection.caption}
        />
        <HairlineGrid min={280}>
          <HairlineCell className="p-5 desktop:px-[clamp(18px,2.2vw,30px)] desktop:py-[clamp(22px,2.6vw,32px)]">
            <p className="text-xs font-semibold text-haba-red">{t.home.housingSection.damageEyebrow}</p>
            <h3 className="mt-1.5 text-[20px] font-bold text-haba-ink desktop:text-[22px]">
              {t.home.housingSection.damageTitle}
            </h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-haba-ink-2">
              {t.home.housingSection.damageDesc}
            </p>
            <Action href="/help/damage-assessment" variant="primary" size="md" className="mt-4">
              {t.home.reconstruction.damageBtn}
            </Action>
          </HairlineCell>

          <HairlineCell className="p-5 desktop:px-[clamp(18px,2.2vw,30px)] desktop:py-[clamp(22px,2.6vw,32px)]">
            <p className="text-xs font-semibold text-haba-green">{t.home.housingSection.artisanEyebrow}</p>
            <h3 className="mt-1.5 text-[20px] font-bold text-haba-ink desktop:text-[22px]">
              {t.home.housingSection.artisanTitle}
            </h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-haba-ink-2">
              {t.home.housingSection.artisanDesc}
            </p>
            <Action href="/artisans" variant="outline" size="md" className="mt-4">
              {t.home.reconstruction.artisanBtn}
            </Action>
          </HairlineCell>
        </HairlineGrid>
      </section>

      {/* ─────────────────────────────── 06 how it works — §5.1(10) */}
      <section className={`${SHELL} ${SECTION}`}>
        <SectionHeader
          index={6}
          eyebrow={t.home.sections.method}
          icon="workflow-square-10"
          title={t.home.howItWorks.title}
        />
        <HairlineGrid min={215}>
          {steps.map((step, i) => (
            <HairlineCell key={step.title} className="p-5 desktop:px-6 desktop:py-7">
              {/* Deliberately recessive (§5.1(10)), but the border colour it was
                  drawn in fails AA at 1.48:1 — haba-numeral is the same hue at
                  3.10:1. design.md §8.5 */}
              <span className="block text-[32px] font-bold leading-none text-haba-numeral desktop:text-[clamp(32px,4vw,44px)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-2 block text-[17px] font-bold text-haba-ink">{step.title}</span>
              <span className="mt-1.5 block text-sm leading-relaxed text-haba-ink-2">{step.desc}</span>
            </HairlineCell>
          ))}
        </HairlineGrid>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border border-haba-border bg-haba-surface p-4 desktop:px-[clamp(16px,2.2vw,26px)] desktop:py-[clamp(18px,2vw,22px)]">
          <div>
            <p className="text-[17px] font-bold text-haba-ink">{t.home.transparencyCallout.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-haba-ink-2">
              {t.home.transparencyCallout.desc}
            </p>
          </div>
          <Action href="/transparency" variant="outline" size="sm">
            {t.home.transparencyCallout.btn}
          </Action>
        </div>
      </section>

      {/* ─────────────────────────────── notice + emergency — §5.1(11,12) */}
      <div className={`${SHELL} ${SECTION}`}>
        <PlatformNotice locale={locale} />
      </div>

      <EmergencySection />
    </>
  );
}

function WilayaCard({
  name,
  count,
  severe,
  prefix,
  unit,
  severeLabel,
}: {
  name: string;
  count: number;
  severe: number;
  prefix: string;
  unit: string;
  severeLabel: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[15.5px] font-bold text-haba-ink desktop:text-[18px]">
          <Icon name="location-05" size={18} className="text-haba-green" />
          {prefix} {name}
        </p>
        <p className="mt-1 text-[11.5px] text-haba-muted desktop:text-[13px]">
          {severe > 0 ? `${severe} ${severeLabel}` : unit}
        </p>
      </div>
      <span className="text-[26px] font-bold leading-none text-haba-red desktop:text-[clamp(23px,3.4vw,36px)]">
        {count}
      </span>
    </div>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-haba-border bg-haba-surface p-6 text-center text-sm text-haba-muted">
      {children}
    </p>
  );
}
