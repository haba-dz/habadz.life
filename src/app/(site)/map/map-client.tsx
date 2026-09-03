"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Search,
  X,
  Home,
  Package,
  HeartHandshake,
  Layers,
  LayoutGrid,
  Map as MapIcon,
  RotateCcw,
  SlidersHorizontal,
  Phone,
  Navigation,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PointCard, type PointCardData } from "@/components/shared/point-card";
import { EmptyState } from "@/components/shared/empty-state";
import { campaignWilayas } from "@/config/site";
import { WilayaSelect } from "@/components/ui/wilaya-select";
import { CommuneSelect } from "@/components/ui/commune-select";
import { PointStatusBadge } from "@/components/shared/status-badge";
import { VerificationBadge } from "@/components/shared/verification-badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { priorityWilayas, getCommunesByWilaya } from "@/lib/algeria-cities";
import type { AvailableLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

const ReliefMap = dynamic(
  () => import("@/components/map/relief-map").then((m) => m.ReliefMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted/40 border border-border min-h-[420px]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-algeria-green border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">جاري تحميل الخريطة التفاعلية...</p>
        </div>
      </div>
    ),
  },
);

type KindFilter = "all" | "shelter" | "relief_hub" | "collection_point";

export function MapClient({
  points,
  locale = "ar",
}: {
  points: PointCardData[];
  locale?: AvailableLocale;
}) {
  const isFr = locale === "fr";

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedKind, setSelectedKind] = useState<KindFilter>("all");
  const [selectedWilaya, setSelectedWilaya] = useState<string>("all");
  const [selectedCommune, setSelectedCommune] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // View States
  const [viewMode, setViewMode] = useState<"split" | "map" | "grid">("split");
  const [mobileTab, setMobileTab] = useState<"map" | "list">("map");

  const availableCommunes = useMemo(() => {
    if (selectedWilaya === "all") return [];
    return getCommunesByWilaya(selectedWilaya);
  }, [selectedWilaya]);

  const handleWilayaChange = (wilaya: string) => {
    setSelectedWilaya(wilaya);
    setSelectedCommune("all");
  };

  // Filter Logic
  const filteredPoints = useMemo(() => {
    const q = search.trim().toLowerCase();

    return points.filter((p) => {
      // Kind Filter
      if (selectedKind !== "all" && p.kind !== selectedKind) return false;

      // Wilaya Filter
      if (selectedWilaya !== "all" && p.wilaya !== selectedWilaya) return false;

      // Commune Filter
      if (selectedCommune !== "all") {
        const normCommune = (p.commune || "").trim().toLowerCase();
        const normSelected = selectedCommune.trim().toLowerCase();
        if (
          normCommune !== normSelected &&
          !normCommune.includes(normSelected) &&
          !normSelected.includes(normCommune)
        ) {
          return false;
        }
      }

      // Status Filter
      if (selectedStatus !== "all" && p.status !== selectedStatus) return false;

      // Search Query Filter
      if (q) {
        const inName = p.name.toLowerCase().includes(q);
        const inCommune = p.commune.toLowerCase().includes(q);
        const inWilaya = p.wilaya.toLowerCase().includes(q);
        const inAddress = p.address ? p.address.toLowerCase().includes(q) : false;
        const inCats = p.acceptedCategories ? p.acceptedCategories.some((c) => c.toLowerCase().includes(q)) : false;
        if (!inName && !inCommune && !inWilaya && !inAddress && !inCats) {
          return false;
        }
      }

      return true;
    });
  }, [points, search, selectedKind, selectedWilaya, selectedCommune, selectedStatus]);

  // Dynamic Counts scoped to current location selection
  const counts = useMemo(() => {
    const scope = points.filter((p) => {
      if (selectedWilaya !== "all" && p.wilaya !== selectedWilaya) return false;
      if (selectedCommune !== "all") {
        const normCommune = (p.commune || "").trim().toLowerCase();
        const normSelected = selectedCommune.trim().toLowerCase();
        if (!normCommune.includes(normSelected) && !normSelected.includes(normCommune)) return false;
      }
      return true;
    });

    return {
      all: scope.length,
      shelters: scope.filter((p) => p.kind === "shelter").length,
      reliefHubs: scope.filter((p) => p.kind === "relief_hub").length,
      collectionPoints: scope.filter((p) => p.kind === "collection_point").length,
    };
  }, [points, selectedWilaya, selectedCommune]);

  const selectedPoint = useMemo(() => {
    if (!selectedPointId) return null;
    return points.find((p) => p.id === selectedPointId) ?? null;
  }, [points, selectedPointId]);

  const activeFilterCount =
    (selectedKind !== "all" ? 1 : 0) +
    (selectedWilaya !== "all" ? 1 : 0) +
    (selectedCommune !== "all" ? 1 : 0) +
    (selectedStatus !== "all" ? 1 : 0) +
    (search.trim() !== "" ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setSelectedKind("all");
    setSelectedWilaya("all");
    setSelectedCommune("all");
    setSelectedStatus("all");
    setSelectedPointId(null);
  }, []);

  const handleSelectPointFromList = useCallback((point: PointCardData) => {
    setSelectedPointId(point.id);
    setMobileTab("map");
    // Scroll map into view on mobile
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      window.scrollTo({ top: 180, behavior: "smooth" });
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* 1. Location, Search & Kind Filter Panel */}
      <div className=" border border-border bg-card p-3.5 sm:p-4 space-y-3">
        {/* Search & Wilaya Dropdown */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isFr
                  ? "Rechercher par nom, commune, quartier ou matériel..."
                  : "ابحث بالاسم، البلدية، الحي، أو نوع المساعدات..."
              }
              className="h-11 bg-background/80 px-10 text-sm shadow-inner"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rtl:left-3.5 rtl:right-auto ltr:right-3.5 ltr:left-auto cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Wilaya & Commune Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <WilayaSelect
              locale={locale}
              includeAllOption={true}
              value={selectedWilaya}
              onChange={(e) => handleWilayaChange(e.target.value)}
              className="w-full sm:w-auto min-w-[160px] h-11 cursor-pointer font-bold"
            />

            {selectedWilaya !== "all" && (
              <CommuneSelect
                wilaya={selectedWilaya}
                locale={locale}
                includeAllOption={true}
                value={selectedCommune}
                onChange={(e) => setSelectedCommune(e.target.value)}
                className="w-full sm:w-auto min-w-[160px] h-11 cursor-pointer animate-in fade-in"
              />
            )}

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-11 text-xs font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive gap-1.5 cursor-pointer shrink-0"
              >
                <RotateCcw className="size-3.5" />
                <span>{isFr ? "Effacer" : "مسح"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Priority Affected Wilayas Quick Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar pt-0.5">
          <span className="text-xs font-bold text-priority-critical flex items-center gap-1 shrink-0">
            <span className="inline-block size-2 bg-priority-critical animate-pulse" />
            {isFr ? "Priorité :" : "الولايات الأكثر تضرراً:"}
          </span>
          {priorityWilayas.map((pw) => {
            const active = selectedWilaya === pw.name_ar;
            return (
              <button
                key={pw.code}
                type="button"
                onClick={() => handleWilayaChange(active ? "all" : pw.name_ar)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer border min-h-[36px]",
                  active
                    ? "bg-priority-critical text-white border-priority-critical scale-102"
                    : "bg-priority-critical/10 text-priority-critical border-priority-critical/30 hover:bg-priority-critical/20 active:scale-95",
                )}
              >
                <span>⚡</span>
                <span>{isFr ? `${pw.codeStr} - ${pw.name_fr}` : `${pw.codeStr} - ${pw.name_ar}`}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Commune Chips Bar when a specific Wilaya is active */}
        {selectedWilaya !== "all" && availableCommunes.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar pt-1 border-t border-border/50 animate-in fade-in">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 shrink-0">
              <span>📍</span>
              <span>{isFr ? "Communes :" : "بلديات الولاية:"}</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedCommune("all")}
              className={cn(
                "inline-flex shrink-0 items-center gap-1 px-2.5 py-1 text-xs font-bold transition-all cursor-pointer border min-h-[34px]",
                selectedCommune === "all"
                  ? "bg-algeria-green text-white border-algeria-green"
                  : "bg-muted/70 text-foreground border-border hover:bg-muted active:scale-95"
              )}
            >
              {isFr ? "Toutes" : "كل البلديات"}
            </button>
            {availableCommunes.map((c) => {
              const active = selectedCommune === c.name_ar;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCommune(active ? "all" : c.name_ar)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer border min-h-[34px]",
                    active
                      ? "bg-algeria-green text-white border-algeria-green font-bold scale-102"
                      : "bg-background text-foreground border-border hover:border-algeria-green/50 hover:bg-algeria-green/5 active:scale-95"
                  )}
                >
                  <span>{isFr ? c.name_fr : c.name_ar}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. Type Filter Buttons (مراكز إيواء، مراكز استقبال، نقاط تجميع) - POSITIONED DIRECTLY AFTER WILAYA */}
        <div className="pt-2.5 border-t border-border/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">
              {isFr ? "Type de centre / aide :" : "نوع المركز والمساعدة :"}
            </span>
            {selectedWilaya !== "all" && (
              <span className="text-xs font-bold text-algeria-green">
                📍 {isFr ? `Wilaya de ${selectedWilaya}` : `ولاية ${selectedWilaya}`}
                {selectedCommune !== "all" ? ` - ${selectedCommune}` : ""}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* All Points */}
            <button
              type="button"
              onClick={() => setSelectedKind("all")}
              className={cn(
                "flex items-center justify-between border p-2.5 sm:p-3 text-start transition-all cursor-pointer min-h-[46px] active:scale-98",
                selectedKind === "all"
                  ? "border-foreground bg-foreground/10 ring-2 ring-foreground/20 font-bold"
                  : "border-border bg-background hover:bg-muted/60"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center bg-foreground/10 text-foreground">
                  <Layers className="size-4" />
                </div>
                <span className="text-xs font-bold">{isFr ? "Tous" : "الكل"}</span>
              </div>
              <span className="text-sm font-black tabular-nums">{counts.all}</span>
            </button>

            {/* Shelters */}
            <button
              type="button"
              onClick={() => setSelectedKind(selectedKind === "shelter" ? "all" : "shelter")}
              className={cn(
                "flex items-center justify-between border p-2.5 sm:p-3 text-start transition-all cursor-pointer min-h-[46px] active:scale-98",
                selectedKind === "shelter"
                  ? "border-[#7c3aed] bg-[#7c3aed]/15 ring-2 ring-[#7c3aed]/30 font-bold"
                  : "border-border bg-background hover:border-[#7c3aed]/40 hover:bg-[#7c3aed]/5"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center bg-[#7c3aed]/15 text-[#7c3aed]">
                  <Home className="size-4" />
                </div>
                <span className="text-xs font-bold text-[#7c3aed]">{isFr ? "Hébergement" : "مراكز إيواء"}</span>
              </div>
              <span className="text-sm font-black tabular-nums text-[#7c3aed]">{counts.shelters}</span>
            </button>

            {/* Relief Hubs */}
            <button
              type="button"
              onClick={() => setSelectedKind(selectedKind === "relief_hub" ? "all" : "relief_hub")}
              className={cn(
                "flex items-center justify-between border p-2.5 sm:p-3 text-start transition-all cursor-pointer min-h-[46px] active:scale-98",
                selectedKind === "relief_hub"
                  ? "border-[#1d4ed8] bg-[#1d4ed8]/15 ring-2 ring-[#1d4ed8]/30 font-bold"
                  : "border-border bg-background hover:border-[#1d4ed8]/40 hover:bg-[#1d4ed8]/5"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center bg-[#1d4ed8]/15 text-[#1d4ed8]">
                  <HeartHandshake className="size-4" />
                </div>
                <span className="text-xs font-bold text-[#1d4ed8]">{isFr ? "Accueil" : "مراكز استقبال"}</span>
              </div>
              <span className="text-sm font-black tabular-nums text-[#1d4ed8]">{counts.reliefHubs}</span>
            </button>

            {/* Collection Points */}
            <button
              type="button"
              onClick={() => setSelectedKind(selectedKind === "collection_point" ? "all" : "collection_point")}
              className={cn(
                "flex items-center justify-between border p-2.5 sm:p-3 text-start transition-all cursor-pointer min-h-[46px] active:scale-98",
                selectedKind === "collection_point"
                  ? "border-algeria-green bg-algeria-green/15 ring-2 ring-algeria-green/30 font-bold"
                  : "border-border bg-background hover:border-algeria-green/40 hover:bg-algeria-green/5"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center bg-algeria-green/15 text-algeria-green">
                  <Package className="size-4" />
                </div>
                <span className="text-xs font-bold text-algeria-green">{isFr ? "Collecte" : "نقاط تجميع"}</span>
              </div>
              <span className="text-sm font-black tabular-nums text-algeria-green">{counts.collectionPoints}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sticky View Switcher & Result Count */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground font-semibold">
          <span className="font-black text-foreground tabular-nums text-base">
            {filteredPoints.length}
          </span>
          <span>{isFr ? "points et centres disponibles" : "نقطة ومركز متاح"}</span>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex lg:hidden bg-muted p-1 border border-border/80">
          <button
            type="button"
            onClick={() => setMobileTab("map")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all min-h-[36px] cursor-pointer",
              mobileTab === "map"
                ? "bg-background text-foreground scale-102"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MapIcon className="size-3.5 text-algeria-green" />
            <span>{isFr ? "Carte" : "الخريطة"}</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("list")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all min-h-[36px] cursor-pointer",
              mobileTab === "list"
                ? "bg-background text-foreground scale-102"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="size-3.5 text-algeria-green" />
            <span>{isFr ? "Liste" : "القائمة"}</span>
            <span className=" bg-algeria-green/15 text-algeria-green px-1.5 py-0.2 text-[10px] font-black">
              {filteredPoints.length}
            </span>
          </button>
        </div>

        {/* Desktop View Switcher */}
        <div className="hidden lg:flex items-center gap-1 bg-muted p-1">
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
              viewMode === "split"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={isFr ? "Vue combinée (Carte & Liste)" : "عرض مدمج (خريطة + قائمة)"}
          >
            <SlidersHorizontal className="size-3.5" />
            <span>{isFr ? "Split" : "عرض مدمج"}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
              viewMode === "map"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={isFr ? "Carte seule" : "الخريطة فقط"}
          >
            <MapIcon className="size-3.5" />
            <span>{isFr ? "Carte" : "الخريطة"}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
              viewMode === "grid"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={isFr ? "Grille seule" : "البطاقات فقط"}
          >
            <LayoutGrid className="size-3.5" />
            <span>{isFr ? "Grille" : "البطاقات"}</span>
          </button>
        </div>
      </div>

      {/* 4. Main Responsive Display Area */}
      {filteredPoints.length === 0 ? (
        <EmptyState
          title={isFr ? "Aucun point ne correspond à vos critères" : "لم يتم العثور على أي نقاط مطابقة"}
          description={
            isFr
              ? "Essayez d'élargir votre recherche ou de réinitialiser les filtres."
              : "جرب تغيير مصطلحات البحث أو إعادة تعيين الفلاتر لعرض كافة النقاط."
          }
        />
      ) : (
        <>
          {/* Mobile Display: Tabbed with Floating Marker Card Overlay */}
          <div className="block lg:hidden">
            {mobileTab === "map" ? (
              <div className="relative space-y-3">
                {/* Full-Height Responsive Map Container */}
                <div className="relative h-[calc(100dvh-270px)] min-h-[460px] w-full overflow-hidden border border-border">
                  <ReliefMap
                    points={filteredPoints}
                    selectedPointId={selectedPointId}
                    onSelectPoint={(p) => setSelectedPointId(p.id)}
                    locale={locale}
                  />

                  {/* Floating Action Hint */}
                  {!selectedPoint && (
                    <div className="absolute top-3 inset-x-3 pointer-events-none flex justify-center z-10">
                      <div className=" bg-background/90 backdrop-blur px-3.5 py-1 text-[11px] font-bold text-muted-foreground border border-border">
                        {isFr ? "Touchez un marqueur pour voir les détails" : "اضغط على أي علامة في الخريطة لعرض التفاصيل"}
                      </div>
                    </div>
                  )}

                  {/* Interactive Floating Bottom Preview Sheet on Map */}
                  {selectedPoint && (
                    <div className="absolute bottom-3 inset-x-3 z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className=" border border-border/80 bg-background/98 backdrop-blur p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <PointStatusBadge status={selectedPoint.status} locale={locale} />
                              <VerificationBadge level={selectedPoint.verificationLevel} locale={locale} />
                            </div>
                            <h3 className="text-sm font-black text-foreground">{selectedPoint.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <span className="font-bold text-foreground">ولاية {selectedPoint.wilaya}</span>
                              <span>•</span>
                              <span>بلدية {selectedPoint.commune}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedPointId(null)}
                            className=" p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                            aria-label="إغلاق"
                          >
                            <X className="size-4" />
                          </button>
                        </div>

                        {/* Quick 1-Tap Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {selectedPoint.phone ? (
                            <a
                              href={`tel:${selectedPoint.phone}`}
                              className="flex items-center justify-center gap-2 bg-algeria-green text-white h-11 px-3 text-xs font-bold active:scale-95 transition-transform"
                            >
                              <Phone className="size-4" />
                              <span>{isFr ? "Appeler" : "اتصال مباشر"}</span>
                            </a>
                          ) : (
                            <div className="flex items-center justify-center bg-muted text-muted-foreground h-11 px-3 text-[11px] font-semibold">
                              {isFr ? "Sans téléphone" : "لا يوجد هاتف"}
                            </div>
                          )}

                          <a
                            href={
                              selectedPoint.lat != null && selectedPoint.lng != null
                                ? `https://www.google.com/maps/dir/?api=1&destination=${selectedPoint.lat},${selectedPoint.lng}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    `${selectedPoint.name} ${selectedPoint.commune} ${selectedPoint.wilaya}`
                                  )}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 border border-border bg-card text-foreground hover:bg-muted h-11 px-3 text-xs font-bold active:scale-95 transition-transform"
                          >
                            <Navigation className="size-4 text-algeria-green" />
                            <span>{isFr ? "Itinéraire" : "الاتجاهات GPS"}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-3.5 sm:grid-cols-2">
                {filteredPoints.map((p) => (
                  <PointCard
                    key={`${p.kind}-${p.id}`}
                    point={p}
                    locale={locale}
                    isSelected={selectedPointId === p.id}
                    onShowOnMap={handleSelectPointFromList}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop Display: Split / Map Focus / Grid Focus */}
          <div className="hidden lg:block">
            {viewMode === "split" && (
              <div className="grid grid-cols-12 gap-6 items-start">
                {/* Scrollable Cards Sidebar */}
                <div className="col-span-5 max-h-[750px] overflow-y-auto space-y-4 pr-1 pl-1">
                  {filteredPoints.map((p) => (
                    <div
                      key={`${p.kind}-${p.id}`}
                      onClick={() => setSelectedPointId(p.id)}
                      className="transition-transform"
                    >
                      <PointCard
                        point={p}
                        locale={locale}
                        isSelected={selectedPointId === p.id}
                        onShowOnMap={handleSelectPointFromList}
                      />
                    </div>
                  ))}
                </div>

                {/* Sticky Interactive Map */}
                <div className="col-span-7 sticky top-20 h-[750px]">
                  <ReliefMap
                    points={filteredPoints}
                    selectedPointId={selectedPointId}
                    onSelectPoint={(p) => setSelectedPointId(p.id)}
                    locale={locale}
                  />
                </div>
              </div>
            )}

            {viewMode === "map" && (
              <div className="h-[750px] w-full">
                <ReliefMap
                  points={filteredPoints}
                  selectedPointId={selectedPointId}
                  onSelectPoint={(p) => setSelectedPointId(p.id)}
                  locale={locale}
                />
              </div>
            )}

            {viewMode === "grid" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPoints.map((p) => (
                  <PointCard
                    key={`${p.kind}-${p.id}`}
                    point={p}
                    locale={locale}
                    isSelected={selectedPointId === p.id}
                    onShowOnMap={handleSelectPointFromList}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

