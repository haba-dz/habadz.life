"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Icon } from "@/components/icons";
import { FieldLabel, FieldSelect } from "@/components/site";
import { getSeverityLabel, type AffectedSeverity } from "@/lib/constants";
import type { AvailableLocale } from "@/i18n/locales";

/**
 * Wilaya + severity + commune search, all driven through searchParams so the
 * filtering stays on the server. design.md §5.4
 */
export function AreasFilters({
  wilayas,
  severities,
  locale = "ar",
  shown,
  total,
}: {
  wilayas: string[];
  severities: AffectedSeverity[];
  locale?: AvailableLocale;
  shown: number;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFr = locale === "fr";

  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function apply(next: URLSearchParams) {
    router.replace(next.toString() ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  function set(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    apply(params);
  }

  // Debounced so typing does not push a navigation per keystroke.
  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (query === current) return;
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set("q", query);
      else params.delete("q");
      apply(params);
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex flex-col gap-3.5 border border-haba-border bg-haba-surface p-4 desktop:flex-row desktop:items-end desktop:px-5 desktop:py-[18px]">
      <div className="flex-1">
        <FieldLabel htmlFor="areas-wilaya">{isFr ? "Wilaya" : "الولاية"}</FieldLabel>
        <FieldSelect
          id="areas-wilaya"
          value={searchParams.get("wilaya") ?? ""}
          onChange={(e) => set("wilaya", e.target.value)}
        >
          <option value="">{isFr ? "Toutes les wilayas" : "كل الولايات"}</option>
          {wilayas.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </FieldSelect>
      </div>

      <div className="flex-1">
        <FieldLabel htmlFor="areas-severity">
          {isFr ? "Niveau de dégâts" : "مستوى الضرر"}
        </FieldLabel>
        <FieldSelect
          id="areas-severity"
          value={searchParams.get("severity") ?? ""}
          onChange={(e) => set("severity", e.target.value)}
        >
          <option value="">{isFr ? "Tous les niveaux" : "كل المستويات"}</option>
          {severities.map((s) => (
            <option key={s} value={s}>
              {getSeverityLabel(s, locale)}
            </option>
          ))}
        </FieldSelect>
      </div>

      <div className="flex-[2]">
        <FieldLabel htmlFor="areas-q">
          {isFr ? "Rechercher une commune" : "بحث ببلدية أو قرية"}
        </FieldLabel>
        <div className="flex items-center gap-2.5 border border-haba-border px-3.5">
          <Icon name="search-01" size={18} className="text-haba-muted" />
          <input
            id="areas-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isFr ? "Nom de la commune…" : "اكتب اسم البلدية…"}
            className="w-full border-none py-[11px] text-[14.5px] outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={isFr ? "Effacer" : "مسح"}
              className="text-haba-muted hover:text-haba-ink"
            >
              <Icon name="cancel-01" size={16} />
            </button>
          )}
        </div>
      </div>

      <p className="text-[13.5px] text-haba-muted desktop:pb-3">
        {isFr ? "Affichage de " : "عرض "}
        <strong className="text-haba-ink">{shown}</strong>
        {isFr ? ` sur ${total}` : ` من أصل ${total} منطقة`}
      </p>
    </div>
  );
}
