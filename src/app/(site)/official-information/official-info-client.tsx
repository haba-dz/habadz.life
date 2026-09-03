"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Icon } from "@/components/icons";
import { Chip, HairlineGrid, StatTile, UpdateCard } from "@/components/site";
import type { OfficialUpdateItem } from "@/components/shared/official-update-card";
import { formatRelativeTime } from "@/lib/constants";
import { cn } from "@/lib/utils";

import type { AvailableLocale } from "@/i18n/locales";

const authorityFilters = [
  { id: "all", label: "جميع المصادر", label_fr: "Toutes les sources" },
  { id: "protection_civile_jijel", label: "الحماية المدنية (جيجل)", label_fr: "Protection Civile (Jijel)" },
  { id: "protection_civile", label: "الحماية المدنية (الوطنية)", label_fr: "Protection Civile (Nationale)" },
  { id: "gendarmerie", label: "الدرك الوطني / طريقي", label_fr: "Gendarmerie / Tariki" },
  { id: "forets", label: "محافظة الغابات", label_fr: "Conservation des Forêts" },
  { id: "police", label: "الأمن الوطني", label_fr: "Sûreté Nationale (Police)" },
  { id: "wilaya", label: "خلية الأزمة والأرصاد", label_fr: "Cellule de Crise & Météo" },
];

const categoryFilters = [
  { id: "all", label: "الكل", label_fr: "Tous" },
  { id: "fire_alert", label: "حرائق وإخماد", label_fr: "Incendies & Extinction" },
  { id: "road_status", label: "حالة الطرقات", label_fr: "État des routes" },
  { id: "weather_warning", label: "نشرات الطقس", label_fr: "Alertes météo" },
  { id: "safety_guidelines", label: "إرشادات وإجلاء", label_fr: "Consignes & Évacuation" },
];

export function OfficialInfoClient({
  initialUpdates,
  locale = "ar",
}: {
  initialUpdates: OfficialUpdateItem[];
  locale?: AvailableLocale;
}) {
  const [updates, setUpdates] = useState<OfficialUpdateItem[]>(initialUpdates);
  const [search, setSearch] = useState("");
  const [selectedAuthority, setSelectedAuthority] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSyncing, setIsSyncing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const isFr = locale === "fr";

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleSync = async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsSyncing(true);
    try {
      const res = await fetch("/api/news/sync", { method: "POST", signal: abortRef.current.signal });
      if (res.ok) {
        const json = await res.json();
        if (json.items && json.items.length > 0) {
          setUpdates(json.items);
        }
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    } finally {
      setIsSyncing(false);
    }
  };

  const stats = useMemo(() => {
    const fireAlerts = updates.filter((u) => u.update_type === "fire_alert" || (u.is_urgent && u.title.includes("حريق"))).length;
    const roadAlerts = updates.filter((u) => u.update_type === "road_status").length;
    const weatherAlerts = updates.filter((u) => u.update_type === "weather_warning").length;
    return { fireAlerts, roadAlerts, weatherAlerts, total: updates.length };
  }, [updates]);

  const filtered = useMemo(() => {
    return updates.filter((u) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const haystack = `${u.title} ${u.body ?? ""} ${u.source} ${u.wilaya ?? ""} ${u.authority ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (selectedAuthority !== "all") {
        const backendAuth = (u.authority ?? "").toLowerCase();
        if (backendAuth) {
          if (selectedAuthority === "protection_civile_jijel" && backendAuth !== "protection_civile") return false;
          if (selectedAuthority !== "protection_civile_jijel" && backendAuth !== selectedAuthority) return false;
        } else {
          const s = `${u.source} ${u.title}`.toLowerCase();
          if (selectedAuthority === "protection_civile_jijel" && (!s.includes("0018") && !s.includes("جيجل") && !s.includes("عوانة"))) return false;
          if (selectedAuthority === "protection_civile" && !s.includes("حماية")) return false;
          if (selectedAuthority === "gendarmerie" && !s.includes("درك") && !s.includes("طريقي")) return false;
          if (selectedAuthority === "forets" && !s.includes("غابات")) return false;
          if (selectedAuthority === "police" && !s.includes("أمن")) return false;
          if (selectedAuthority === "wilaya" && !s.includes("ولاية") && !s.includes("أزمة") && !s.includes("أرصاد")) return false;
        }
      }

      if (selectedCategory !== "all") {
        if (u.update_type !== selectedCategory) return false;
      }

      return true;
    });
  }, [updates, search, selectedAuthority, selectedCategory]);

  const hasFilters = search || selectedAuthority !== "all" || selectedCategory !== "all";

  return (
    <div className="space-y-6">
      {/* counters — design.md §5.3 */}
      <HairlineGrid min={215}>
        <StatTile
          iconPlacement="end"
          tone="red"
          icon="fire"
          value={stats.fireAlerts}
          label={isFr ? "Alertes incendies" : "بلاغات حرائق نشطة"}
        />
        <StatTile
          iconPlacement="end"
          icon="delivery-truck-02"
          value={stats.roadAlerts}
          label={isFr ? "État des routes & accès" : "حالة الطرقات والمعابر"}
        />
        <StatTile
          iconPlacement="end"
          tone="amber"
          icon="cloud-fast-wind"
          value={stats.weatherAlerts}
          label={isFr ? "Bulletins météo spéciaux" : "نشرات جوية خاصة"}
        />
        <StatTile
          iconPlacement="end"
          tone="green"
          icon="shield-01"
          value={stats.total}
          label={isFr ? "Communiqués vérifiés" : "إجمالي البيانات الموثّقة"}
        />
      </HairlineGrid>

      {/* search + filters — §3.18 */}
      <div className="border border-haba-border bg-haba-surface p-4 desktop:px-5 desktop:py-[18px]">
        <div className="flex flex-col gap-3 desktop:flex-row">
          <div className="flex flex-1 items-center gap-2.5 border border-haba-border px-3.5">
            <Icon name="search-01" size={18} className="text-haba-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isFr
                  ? "Rechercher dans les communiqués, routes, foyers, wilayas…"
                  : "بحث في البيانات، حالة الطرقات، البؤر، والولايات…"
              }
              aria-label={isFr ? "Rechercher" : "بحث"}
              className="w-full border-none py-3 text-[14.5px] outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center justify-center gap-2 border border-haba-green px-[18px] py-3 text-sm font-semibold text-haba-green hover:bg-haba-green-tint disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-haba-green"
          >
            <Icon name="refresh" size={16} className={isSyncing ? "animate-spin" : undefined} />
            {isFr ? "Actualiser les sources" : "تحديث المصادر الرسمية"}
          </button>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[13.5px]">
          <span className="flex items-center gap-1.5 font-semibold text-haba-muted">
            <Icon name="filter" size={16} />
            {isFr ? "Filtrer par autorité :" : "تصفية حسب الجهة الرسمية:"}
          </span>
          {authorityFilters.map((f) => (
            <button key={f.id} type="button" onClick={() => setSelectedAuthority(f.id)}>
              <Chip
                tone={selectedAuthority === f.id ? "green" : "neutral"}
                fill={selectedAuthority === f.id ? "solid" : "tint"}
                size="lg"
              >
                {isFr ? f.label_fr : f.label}
              </Chip>
            </button>
          ))}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1 text-[13.5px]">
          <span className="me-1 font-semibold text-haba-muted">{isFr ? "Type :" : "النوع:"}</span>
          {categoryFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedCategory(f.id)}
              className={cn(
                "px-3 py-[7px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-haba-green",
                selectedCategory === f.id
                  ? "font-bold text-haba-forest"
                  : "font-medium text-haba-ink-2 hover:text-haba-forest",
              )}
            >
              {isFr ? f.label_fr : f.label}
            </button>
          ))}

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedAuthority("all");
                setSelectedCategory("all");
              }}
              className="ms-auto px-3 py-[7px] font-bold text-haba-red hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-haba-green"
            >
              {isFr ? "Réinitialiser les filtres" : "إعادة تعيين الفلاتر"}
            </button>
          )}
        </div>
      </div>

      {/* feed */}
      {filtered.length === 0 ? (
        <div className="border border-haba-border bg-haba-surface p-8 text-center">
          <p className="text-[15px] font-bold text-haba-ink">
            {initialUpdates.length === 0
              ? isFr
                ? "Aucun communiqué officiel enregistré actuellement"
                : "لا توجد بيانات أو بلاغات رسمية مسجلة حالياً"
              : isFr
                ? "Aucun communiqué ne correspond à votre recherche"
                : "لا توجد بيانات مطابقة لخيارات البحث"}
          </p>
          <p className="mx-auto mt-2 max-w-[520px] text-sm leading-relaxed text-haba-muted">
            {initialUpdates.length === 0
              ? isFr
                ? "Les communiqués sont publiés dès diffusion par la Protection Civile, la Gendarmerie et les Forêts."
                : "يتم نشر البيانات فور صدورها من مصالح الحماية المدنية، الدرك الوطني، ومحافظات الغابات."
              : isFr
                ? "Essayez d'autres mots clés ou réinitialisez les filtres."
                : "جرّب تغيير كلمات البحث أو إعادة تعيين الفلاتر."}
          </p>
        </div>
      ) : (
        <HairlineGrid min={280}>
          {filtered.map((u, i) => (
            <UpdateCard
              key={u.id || `upd-${i}`}
              item={u}
              locale={locale}
              relativeTime={formatRelativeTime(u.published_at, locale)}
              sourcePrefix={isFr ? "Source : " : "المصدر: "}
              originalSourceLabel={isFr ? "Source d'origine" : "المصدر الأصلي"}
            />
          ))}
        </HairlineGrid>
      )}
    </div>
  );
}
