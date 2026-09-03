"use client";

import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import {
  priorityWilayas,
  otherWilayas,
  getWilayaName,
  type WilayaItem,
} from "@/lib/algeria-cities";
import type { AvailableLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

export interface WilayaSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  locale?: AvailableLocale;
  includeAllOption?: boolean;
  allOptionLabel?: string;
  className?: string;
}

export const WilayaSelect = forwardRef<HTMLSelectElement, WilayaSelectProps>(
  (
    {
      locale = "ar",
      includeAllOption = false,
      allOptionLabel,
      className,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const isFr = locale === "fr";

    return (
      <div className="relative w-full">
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-border bg-background ps-3.5 pe-10 py-2 text-sm font-medium text-foreground shadow-2xs transition-colors focus:border-algeria-green focus:outline-none focus:ring-2 focus:ring-algeria-green/20 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        >
          {includeAllOption && (
            <option value="all">
              {allOptionLabel ?? (isFr ? "Toutes les wilayas" : "كل الولايات")}
            </option>
          )}

          {/* 🚨 Priority Affected Wilayas */}
          <optgroup
            label={isFr ? "🚨 ZONES SINISTRÉES (PRIORITAIRES)" : "🚨 الولايات المتضررة (أولوية الإغاثة)"}
            className="font-bold text-priority-critical bg-priority-critical/5"
          >
            {priorityWilayas.map((w: WilayaItem) => (
              <option
                key={w.code}
                value={w.name_ar}
                className="font-bold text-priority-critical py-1"
              >
                {getWilayaName(w, locale)}
              </option>
            ))}
          </optgroup>

          {/* 📍 Other Algerian Wilayas */}
          <optgroup label={isFr ? "── Autres wilayas ──" : "── باقي الولايات ──"}>
            {otherWilayas.map((w: WilayaItem) => (
              <option key={w.code} value={w.name_ar} className="py-1">
                {getWilayaName(w, locale)}
              </option>
            ))}
          </optgroup>
        </select>

        <div className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center justify-center">
          <ChevronDown className="size-4 opacity-70" />
        </div>
      </div>
    );
  },
);

WilayaSelect.displayName = "WilayaSelect";
