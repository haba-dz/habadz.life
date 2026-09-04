"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import { Icon, type IconName } from "@/components/icons";
import {
  POINT_KINDS,
  getKindLabel,
  pointStatusTone,
  type PointKind,
} from "@/components/map/point-kind";
import { PointCard, type PointCardData } from "@/components/shared/point-card";
import {
  Chip,
  CommuneSelect,
  FOCUS_RING,
  StatusDot,
  WilayaSelect,
} from "@/components/site";
import {
  formatWilaya,
  getCommuneName,
  getCommunesByWilaya,
  priorityWilayas,
} from "@/lib/algeria-cities";
import { getPointStatusLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AvailableLocale } from "@/i18n/locales";
import { MapLegend } from "./map-legend";

const ReliefMap = dynamic(() => import("@/components/map/relief-map").then((m) => m.ReliefMap), {
  ssr: false,
  loading: () => (
    <div className="flex size-full min-h-[300px] items-center justify-center bg-haba-map">
      <span className="size-5 animate-pulse bg-haba-green-400" />
    </div>
  ),
});

type KindFilter = "all" | PointKind;
type View = "split" | "map" | "cards";

const KIND_ORDER: PointKind[] = ["shelter", "relief_hub", "collection_point"];

export function MapClient({
  points,
  locale = "ar",
}: {
  points: PointCardData[];
  locale?: AvailableLocale;
}) {
  const isFr = locale === "fr";

  const [search, setSearch] = useState("");
  const [selectedKind, setSelectedKind] = useState<KindFilter>("all");
  const [selectedWilaya, setSelectedWilaya] = useState("all");
  const [selectedCommune, setSelectedCommune] = useState("all");
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [view, setView] = useState<View>("split");
  const [expanded, setExpanded] = useState(false);

  const availableCommunes = useMemo(
    () => (selectedWilaya === "all" ? [] : getCommunesByWilaya(selectedWilaya)),
    [selectedWilaya],
  );

  const selectWilaya = useCallback((wilaya: string) => {
    setSelectedWilaya(wilaya);
    setSelectedCommune("all");
  }, []);

  // Unchanged from the pre-redesign filter: the commune match is deliberately
  // fuzzy in both directions because the imported commune names and the ones
  // typed into the admin do not always agree on prefixes.
  const matchesLocation = useCallback(
    (p: PointCardData) => {
      if (selectedWilaya !== "all" && p.wilaya !== selectedWilaya) return false;
      if (selectedCommune !== "all") {
        const commune = (p.commune || "").trim().toLowerCase();
        const wanted = selectedCommune.trim().toLowerCase();
        if (!commune.includes(wanted) && !wanted.includes(commune)) return false;
      }
      return true;
    },
    [selectedWilaya, selectedCommune],
  );

  const filteredPoints = useMemo(() => {
    const q = search.trim().toLowerCase();

    return points.filter((p) => {
      if (selectedKind !== "all" && p.kind !== selectedKind) return false;
      if (!matchesLocation(p)) return false;
      if (!q) return true;

      return (
        p.name.toLowerCase().includes(q) ||
        p.commune.toLowerCase().includes(q) ||
        p.wilaya.toLowerCase().includes(q) ||
        (p.address?.toLowerCase().includes(q) ?? false) ||
        (p.acceptedCategories?.some((c) => c.toLowerCase().includes(q)) ?? false)
      );
    });
  }, [points, search, selectedKind, matchesLocation]);

  /** Counts ignore the kind filter — they are how you *pick* a kind. */
  const counts = useMemo(() => {
    const scope = points.filter(matchesLocation);
    return {
      all: scope.length,
      shelter: scope.filter((p) => p.kind === "shelter").length,
      relief_hub: scope.filter((p) => p.kind === "relief_hub").length,
      collection_point: scope.filter((p) => p.kind === "collection_point").length,
    };
  }, [points, matchesLocation]);

  /** Centres the marker loop cannot place. */
  const unplottable = useMemo(
    () => filteredPoints.filter((p) => p.lat === null || p.lng === null).length,
    [filteredPoints],
  );

  const activeFilterCount =
    (selectedKind !== "all" ? 1 : 0) +
    (selectedWilaya !== "all" ? 1 : 0) +
    (selectedCommune !== "all" ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const resetFilters = useCallback(() => {
    setSearch("");
    setSelectedKind("all");
    setSelectedWilaya("all");
    setSelectedCommune("all");
    setSelectedPointId(null);
  }, []);

  /** Selecting from the list flies the map; below 861px the map is above it. */
  const showOnMap = useCallback((point: PointCardData) => {
    setSelectedPointId(point.id);
    if (typeof window !== "undefined" && window.innerWidth < 861) {
      document.getElementById("map-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [expanded]);

  const views: { id: View; label: string; icon: IconName }[] = [
    { id: "split", label: isFr ? "Vue combinée" : "عرض مدمج", icon: "layout-2-column" },
    { id: "map", label: isFr ? "Carte" : "الخريطة", icon: "maps" },
    { id: "cards", label: isFr ? "Fiches" : "البطاقات", icon: "grid-view" },
  ];

  const mapPanel = (
    <section
      id="map-panel"
      aria-label={isFr ? "Carte de terrain" : "الخريطة الميدانية"}
      className={cn(
        "flex flex-col border border-haba-border bg-haba-surface",
        expanded
          ? "fixed inset-0 z-50"
          : view === "split"
            ? "max-desktop:order-first desktop:sticky desktop:top-[130px]"
            : "",
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-haba-border px-4 py-3">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-haba-forest">
          <Icon name="maps" size={18} className="text-haba-green" />
          {isFr ? "Carte de terrain" : "الخريطة الميدانية"}
        </h2>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className={cn(
            "inline-flex items-center gap-1.5 text-[13px] font-semibold text-haba-green hover:text-haba-green-dark",
            FOCUS_RING,
          )}
        >
          <Icon name={expanded ? "cancel-01" : "square-arrow-expand-01"} size={16} />
          {expanded
            ? isFr
              ? "Réduire"
              : "تصغير"
            : isFr
              ? "Plein écran"
              : "فتح بحجم كامل"}
        </button>
      </div>

      <div
        className={cn(
          "relative w-full",
          expanded ? "flex-1" : "h-[380px] desktop:h-[520px]",
        )}
      >
        <ReliefMap
          points={filteredPoints}
          selectedPointId={selectedPointId}
          onSelectPoint={(p) => setSelectedPointId(p.id)}
          locale={locale}
        />
      </div>

      <div className="border-t border-haba-border px-4 py-3">
        <MapLegend locale={locale} />
        {/*
          A centre with no lat/lng is dropped by the marker loop, so the map can
          plot fewer centres than the list holds with nothing to say why — which
          reads as "there is nothing near me". Name the gap and point at the list.
        */}
        {unplottable > 0 && (
          <p className="mt-2.5 flex items-start gap-1.5 text-[12px] leading-relaxed text-haba-muted">
            <Icon name="alert-circle" size={13} className="mt-0.5" />
            {isFr
              ? `${unplottable} centre${unplottable > 1 ? "s" : ""} sans coordonnées ne ${unplottable > 1 ? "sont" : "est"} pas affiché${unplottable > 1 ? "s" : ""} sur la carte. ${unplottable > 1 ? "Ils figurent" : "Il figure"} dans la liste.`
              : `${unplottable} من المراكز بدون إحداثيات ولا تظهر على الخريطة. تجدها في القائمة.`}
          </p>
        )}
      </div>
    </section>
  );

  return (
    <div className="space-y-4 desktop:space-y-5">
      {/* ---- filters --------------------------------------------------- */}
      <div className="border border-haba-border bg-haba-surface">
        <div className="flex flex-col gap-2.5 p-4 desktop:flex-row desktop:items-center desktop:px-5">
          <div className="relative min-w-0 flex-1">
            <Icon
              name="search-01"
              size={18}
              className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-haba-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={isFr ? "Rechercher un centre" : "البحث عن مركز"}
              placeholder={
                isFr
                  ? "Nom, commune, quartier ou type d'aide…"
                  : "ابحث بالاسم، البلدية، الحي، أو نوع المساعدات…"
              }
              className={cn(
                "w-full border border-haba-border bg-haba-surface py-[11px] pe-3.5 ps-11 text-[14.5px] text-haba-ink placeholder:text-haba-muted",
                "[&::-webkit-search-cancel-button]:appearance-none",
                FOCUS_RING,
              )}
            />
          </div>

          <div className="desktop:w-[190px]">
            <WilayaSelect
              aria-label={isFr ? "Filtrer par wilaya" : "التصفية حسب الولاية"}
              locale={locale}
              includeAllOption
              value={selectedWilaya}
              onChange={(e) => selectWilaya(e.target.value)}
            />
          </div>

          {selectedWilaya !== "all" && (
            <div className="desktop:w-[190px]">
              <CommuneSelect
                aria-label={isFr ? "Filtrer par commune" : "التصفية حسب البلدية"}
                wilaya={selectedWilaya}
                locale={locale}
                includeAllOption
                value={selectedCommune}
                onChange={(e) => setSelectedCommune(e.target.value)}
              />
            </div>
          )}

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className={cn(
                "inline-flex shrink-0 items-center justify-center gap-2 border border-haba-border bg-haba-surface px-4 py-[11px] text-[13px] font-semibold text-haba-ink-2 hover:bg-haba-surface-2",
                FOCUS_RING,
              )}
            >
              <Icon name="refresh" size={16} />
              {isFr ? `Effacer (${activeFilterCount})` : `مسح (${activeFilterCount})`}
            </button>
          )}
        </div>

        {/* worst-hit wilayas */}
        <div className="flex items-center gap-2.5 border-t border-haba-border px-4 py-3 desktop:px-5">
          <span className="flex shrink-0 items-center gap-2 text-[12.5px] font-bold text-haba-red">
            <span aria-hidden className="size-2 bg-haba-red" />
            {isFr ? "Wilayas prioritaires :" : "الولايات الأكثر تضرراً:"}
          </span>
          <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {priorityWilayas.map((w) => {
              const active = selectedWilaya === w.name_ar;
              return (
                <button
                  key={w.code}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectWilaya(active ? "all" : w.name_ar)}
                  className={FOCUS_RING}
                >
                  <Chip
                    tone="red"
                    fill={active ? "solid" : "tint"}
                    size="sm"
                    className={cn(!active && "hover:bg-haba-red-50")}
                  >
                    <Icon name="flash" size={13} />
                    {w.codeStr} — {isFr ? w.name_fr : w.name_ar}
                  </Chip>
                </button>
              );
            })}
          </div>
        </div>

        {/* communes of the chosen wilaya */}
        {selectedWilaya !== "all" && availableCommunes.length > 0 && (
          <div className="flex items-center gap-2.5 border-t border-haba-border px-4 py-3 desktop:px-5">
            <span className="flex shrink-0 items-center gap-2 text-[12.5px] font-bold text-haba-muted">
              <Icon name="location-01" size={14} />
              {isFr ? "Communes :" : "بلديات الولاية:"}
            </span>
            <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                aria-pressed={selectedCommune === "all"}
                onClick={() => setSelectedCommune("all")}
                className={FOCUS_RING}
              >
                <Chip tone="green" fill={selectedCommune === "all" ? "solid" : "outline"} size="sm">
                  {isFr ? "Toutes" : "كل البلديات"}
                </Chip>
              </button>
              {availableCommunes.map((c) => {
                const active = selectedCommune === c.name_ar;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedCommune(active ? "all" : c.name_ar)}
                    className={FOCUS_RING}
                  >
                    <Chip tone="green" fill={active ? "solid" : "outline"} size="sm">
                      {isFr ? c.name_fr : c.name_ar}
                    </Chip>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ---- type counters --------------------------------------------- */}
      <div>
        <p className="mb-2 text-[12.5px] font-semibold text-haba-muted">
          {isFr ? "Type de centre et d'aide" : "نوع المركز والمساعدة"}
        </p>
        <div className="grid grid-cols-2 border-s border-t border-haba-border desktop:grid-cols-4">
          <KindTile
            active={selectedKind === "all"}
            icon="layers-01"
            label={isFr ? "Tous" : "الكل"}
            count={counts.all}
            tone="ink"
            onClick={() => setSelectedKind("all")}
          />
          {KIND_ORDER.map((kind) => (
            <KindTile
              key={kind}
              active={selectedKind === kind}
              icon={POINT_KINDS[kind].icon}
              label={getKindLabel(kind, locale)}
              count={counts[kind]}
              tone={POINT_KINDS[kind].tone}
              onClick={() => setSelectedKind(selectedKind === kind ? "all" : kind)}
            />
          ))}
        </div>
      </div>

      {/* ---- result bar + view switcher -------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14.5px] text-haba-ink-2" aria-live="polite">
          <strong className="text-[19px] font-bold tabular-nums text-haba-ink">
            {filteredPoints.length}
          </strong>{" "}
          {isFr ? "points et centres disponibles" : "نقطة ومركز متاح حالياً"}
        </p>

        <div
          role="group"
          aria-label={isFr ? "Mode d'affichage" : "طريقة العرض"}
          className="flex border border-haba-border bg-haba-surface"
        >
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={view === v.id}
              onClick={() => setView(v.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-semibold",
                "border-e border-haba-border last:border-e-0",
                v.id === "split" && "max-desktop:hidden",
                view === v.id
                  ? "bg-haba-forest text-white"
                  : "text-haba-ink-2 hover:bg-haba-surface-2",
                FOCUS_RING,
              )}
            >
              <Icon name={v.icon} size={15} />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- results ---------------------------------------------------- */}
      {filteredPoints.length === 0 ? (
        <div className="border border-haba-border bg-haba-surface px-5 py-12 text-center">
          <p className="text-[15px] font-bold text-haba-ink">
            {isFr
              ? "Aucun point ne correspond à vos critères"
              : "لم يتم العثور على أي نقاط مطابقة"}
          </p>
          <p className="mx-auto mt-1.5 max-w-[420px] text-[13.5px] leading-relaxed text-haba-muted">
            {isFr
              ? "Élargissez la recherche ou réinitialisez les filtres."
              : "جرب تغيير مصطلحات البحث أو إعادة تعيين الفلاتر لعرض كافة النقاط."}
          </p>
        </div>
      ) : view === "cards" ? (
        <div className="grid gap-4 desktop:grid-cols-2 wide:grid-cols-3">
          {filteredPoints.map((p) => (
            <PointCard
              key={`${p.kind}-${p.id}`}
              point={p}
              locale={locale}
              isSelected={selectedPointId === p.id}
              onShowOnMap={showOnMap}
            />
          ))}
        </div>
      ) : view === "map" ? (
        mapPanel
      ) : (
        <div className="grid items-start gap-5 desktop:grid-cols-[minmax(min(330px,100%),1fr)_1.15fr]">
          <PointTable
            points={filteredPoints}
            locale={locale}
            selectedPointId={selectedPointId}
            onSelect={showOnMap}
          />
          {mapPanel}
        </div>
      )}
    </div>
  );
}

/** One of the four counters. design.md §5.5 */
function KindTile({
  active,
  icon,
  label,
  count,
  tone,
  onClick,
}: {
  active: boolean;
  icon: IconName;
  label: string;
  count: number;
  tone: "ink" | "green" | "amber";
  onClick: () => void;
}) {
  const toneText = { ink: "text-haba-ink", green: "text-haba-green", amber: "text-haba-amber" }[
    tone
  ];
  const toneBar = {
    ink: "before:bg-haba-ink",
    green: "before:bg-haba-green",
    amber: "before:bg-haba-amber",
  }[tone];

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        // The 3px cap, not the fill, is what says "selected": the tint alone is
        // a 2% lightness step and does not survive a bright screen. §8.5
        "relative flex items-center justify-between gap-2 border-b border-e border-haba-border px-3.5 py-3 text-start",
        active ? "bg-haba-surface-2" : "bg-haba-surface hover:bg-haba-surface-2",
        active && "before:absolute before:inset-x-0 before:top-0 before:h-[3px]",
        active && toneBar,
        FOCUS_RING,
      )}
    >
      <span className={cn("flex min-w-0 items-center gap-2 text-[13px]", toneText)}>
        <Icon name={icon} size={18} />
        <span className={cn("truncate", active ? "font-bold" : "font-semibold")}>{label}</span>
      </span>
      <span className={cn("text-[22px] font-bold tabular-nums desktop:text-[26px]", toneText)}>
        {count}
      </span>
    </button>
  );
}

/**
 * The centre list. One markup for both widths: a stacked hairline list below
 * 861px, the 1.9fr/1fr/1.1fr table above it. design.md §5.5
 */
function PointTable({
  points,
  locale,
  selectedPointId,
  onSelect,
}: {
  points: PointCardData[];
  locale: AvailableLocale;
  selectedPointId: string | null;
  onSelect: (point: PointCardData) => void;
}) {
  const isFr = locale === "fr";
  const cols = "desktop:grid desktop:grid-cols-[1.9fr_1fr_1.1fr] desktop:items-start desktop:gap-4";

  return (
    <div className="border border-haba-border bg-haba-surface">
      <div
        className={cn(
          "hidden border-b border-haba-border bg-haba-surface-2 px-4 py-2.5 text-[12px] font-bold text-haba-muted",
          cols,
        )}
      >
        <span>{isFr ? "Centre" : "المركز"}</span>
        <span>{isFr ? "Commune" : "البلدية والولاية"}</span>
        <span>{isFr ? "Horaires et contact" : "المواعيد والاتصال"}</span>
      </div>

      <ul className="max-h-[720px] overflow-y-auto">
        {points.map((p) => {
          const kind = POINT_KINDS[p.kind];
          const selected = selectedPointId === p.id;
          return (
            <li
              key={`${p.kind}-${p.id}`}
              className={cn(
                "border-b border-haba-border px-4 py-3.5 last:border-b-0",
                cols,
                selected && "bg-haba-green-tint",
              )}
            >
              <div className="min-w-0">
                <Chip tone={kind.tone} fill="tint" size="xs">
                  <Icon name={kind.icon} size={12} />
                  {getKindLabel(p.kind, locale)}
                </Chip>
                <button
                  type="button"
                  onClick={() => onSelect(p)}
                  className={cn(
                    "mt-1.5 block text-start text-[14.5px] font-bold leading-snug text-haba-ink hover:text-haba-green",
                    FOCUS_RING,
                  )}
                >
                  {p.name}
                </button>
                {p.address && (
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-haba-muted">{p.address}</p>
                )}
              </div>

              <p className="mt-2 text-[13px] leading-relaxed text-haba-ink-2 desktop:mt-0">
                <span className="font-semibold">
                  {getCommuneName(p.commune, locale, p.wilaya)}
                </span>
                <span className="block text-haba-muted">{formatWilaya(p.wilaya, locale)}</span>
              </p>

              <div className="mt-2 text-[13px] desktop:mt-0">
                <p className="flex items-center gap-1.5 text-haba-ink-2">
                  <Icon name="clock-01" size={14} className="text-haba-muted" />
                  {p.openingHours ?? (isFr ? "Horaires non précisés" : "المواقيت غير محددة")}
                </p>
                {p.phone ? (
                  <a
                    href={`tel:${p.phone.replace(/\s/g, "")}`}
                    dir="ltr"
                    className={cn(
                      "mt-1 inline-flex items-center gap-1.5 font-bold text-haba-green hover:underline",
                      FOCUS_RING,
                    )}
                  >
                    <Icon name="call-02" size={14} />
                    {p.phone}
                  </a>
                ) : (
                  <p className="mt-1 text-haba-muted">
                    {isFr ? "Pas de téléphone" : "لا يوجد رقم هاتف"}
                  </p>
                )}
                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-haba-muted">
                  <StatusDot tone={pointStatusTone[p.status]} />
                  {getPointStatusLabel(p.status, locale)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
