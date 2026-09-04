"use client";

import { forwardRef, useMemo } from "react";

import { Icon } from "@/components/icons";
import {
  getCommunesByWilaya,
  otherWilayas,
  priorityWilayas,
  getWilayaName,
  type CommuneItem,
  type WilayaItem,
} from "@/lib/algeria-cities";
import type { AvailableLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

import { FOCUS_RING } from "./focus";

/**
 * Wilaya and commune pickers in the site's control metrics. design.md §3.11
 *
 * Deliberately not a restyle of components/ui/{wilaya,commune}-select.tsx —
 * those are shared with /admin, which this redesign does not touch. The option
 * data comes from the same lib, so the two stay in sync by construction; only
 * the chrome differs.
 *
 * pe-10 rather than the shared px-3.5 of controlClass: the native arrow is
 * suppressed and a 16px chevron is drawn in that reserved end gutter, so the
 * longest option label never runs under it.
 */
const selectClass = cn(
  "w-full appearance-none border border-haba-border bg-haba-surface ps-3.5 pe-10 py-[11px]",
  "text-[14.5px] text-haba-ink disabled:cursor-not-allowed disabled:bg-haba-surface-2 disabled:text-haba-muted",
  FOCUS_RING,
);

function SelectShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full">
      {children}
      <Icon
        name="arrow-down-01"
        size={16}
        className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-haba-muted"
      />
    </div>
  );
}

export interface WilayaSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  locale?: AvailableLocale;
  includeAllOption?: boolean;
  allOptionLabel?: string;
}

export const WilayaSelect = forwardRef<HTMLSelectElement, WilayaSelectProps>(
  ({ locale = "ar", includeAllOption = false, allOptionLabel, className, ...props }, ref) => {
    const isFr = locale === "fr";

    return (
      <SelectShell>
        <select ref={ref} className={cn(selectClass, className)} {...props}>
          {includeAllOption && (
            <option value="all">
              {allOptionLabel ?? (isFr ? "Toutes les wilayas" : "كل الولايات")}
            </option>
          )}

          <optgroup label={isFr ? "Wilayas sinistrées" : "الولايات المتضررة"}>
            {priorityWilayas.map((w: WilayaItem) => (
              <option key={w.code} value={w.name_ar}>
                {getWilayaName(w, locale)}
              </option>
            ))}
          </optgroup>

          <optgroup label={isFr ? "Autres wilayas" : "باقي الولايات"}>
            {otherWilayas.map((w: WilayaItem) => (
              <option key={w.code} value={w.name_ar}>
                {getWilayaName(w, locale)}
              </option>
            ))}
          </optgroup>
        </select>
      </SelectShell>
    );
  },
);

WilayaSelect.displayName = "WilayaSelect";

export interface CommuneSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  wilaya?: string | number;
  locale?: AvailableLocale;
  includeAllOption?: boolean;
  allOptionLabel?: string;
}

export const CommuneSelect = forwardRef<HTMLSelectElement, CommuneSelectProps>(
  (
    { wilaya, locale = "ar", includeAllOption = false, allOptionLabel, className, disabled, ...props },
    ref,
  ) => {
    const isFr = locale === "fr";

    const communes = useMemo(() => {
      if (!wilaya || wilaya === "all") return [];
      // Explicit collator locale: an implicit one differs between the server
      // and the client and produces a hydration mismatch.
      return [...getCommunesByWilaya(wilaya)].sort((a, b) =>
        isFr
          ? a.name_fr.localeCompare(b.name_fr, "fr", { sensitivity: "base" })
          : a.name_ar.localeCompare(b.name_ar, "ar", { sensitivity: "base" }),
      );
    }, [wilaya, isFr]);

    const noWilaya = !wilaya || wilaya === "all";

    return (
      <SelectShell>
        <select
          ref={ref}
          disabled={disabled || noWilaya}
          className={cn(selectClass, className)}
          {...props}
        >
          <option value={includeAllOption ? "all" : ""}>
            {includeAllOption
              ? (allOptionLabel ?? (isFr ? "Toutes les communes" : "كل البلديات"))
              : isFr
                ? "Non spécifié (optionnel)"
                : "غير محدد / كامل الولاية (اختياري)"}
          </option>

          {noWilaya ? (
            <option value="" disabled>
              {isFr ? "Choisissez d'abord une wilaya…" : "يرجى اختيار الولاية أولاً…"}
            </option>
          ) : (
            communes.map((c: CommuneItem) => (
              <option key={c.id || c.name_ar} value={c.name_ar}>
                {isFr ? c.name_fr : c.name_ar}
              </option>
            ))
          )}
        </select>
      </SelectShell>
    );
  },
);

CommuneSelect.displayName = "CommuneSelect";
