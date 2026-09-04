"use client";

import { useState } from "react";

import { Icon, type IconName } from "@/components/icons";
import {
  Chip,
  FieldInput,
  FOCUS_RING,
  HairlineCell,
  HairlineGrid,
  SectionHeader,
} from "@/components/site";
import { findWilaya } from "@/lib/algeria-cities";
import { cn } from "@/lib/utils";
import type { AvailableLocale } from "@/i18n/locales";

export interface Volunteer {
  id: string;
  full_name: string;
  specialty: string;
  commune_id: string;
  wilaya_code?: string;
  phone: string | null;
  current_workplace?: string | null;
  can_teleconsult?: boolean;
}

type Filter = "all" | "human" | "vet";

function FilterChip({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: IconName;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 border px-3 py-[7px] text-[13px] transition-colors",
        active
          ? "border-haba-green bg-haba-green font-bold text-white"
          : "border-haba-border bg-haba-surface font-semibold text-haba-ink hover:border-haba-green hover:text-haba-green",
        FOCUS_RING,
      )}
    >
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  );
}

/** No artboard — design.md §7.3, restyle-and-keep. */
export function MedicalVolunteersList({
  volunteers,
  locale = "ar",
}: {
  volunteers: Volunteer[];
  locale?: AvailableLocale;
}) {
  const isFr = locale === "fr";
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<Filter>("all");

  if (!volunteers || volunteers.length === 0) {
    return null;
  }

  const filtered = volunteers.filter((v) => {
    const term = search.toLowerCase();
    const matchesSearch =
      v.full_name.toLowerCase().includes(term) ||
      v.specialty.toLowerCase().includes(term) ||
      v.commune_id.toLowerCase().includes(term);

    // Kept verbatim from before the restyle — this is the existing predicate,
    // not a new one.
    const isVet = v.specialty.includes("بيطر") || v.specialty.toLowerCase().includes("vet");

    if (filterType === "vet") return matchesSearch && isVet;
    if (filterType === "human") return matchesSearch && !isVet;
    return matchesSearch;
  });

  return (
    <section className="pt-8 desktop:pt-[clamp(30px,4.8vw,64px)]">
      <SectionHeader
        icon="stethoscope"
        title={
          isFr
            ? "Personnel médical et vétérinaire bénévole"
            : "الأطقم الطبية والبيطرية المتطوعة"
        }
        caption={
          isFr
            ? "Annuaire des professionnels inscrits"
            : "قائمة الكوادر المسجلة للتدخل السريع"
        }
      />

      <div className="mb-4 flex flex-col gap-3 border border-haba-border bg-haba-surface p-4 desktop:p-5">
        <div className="relative">
          {/* Logical inset: this used `right-3`, which put the icon over the
              text once the page flipped to LTR French. */}
          <Icon
            name="search-01"
            size={16}
            className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-haba-muted"
          />
          <FieldInput
            aria-label={
              isFr ? "Rechercher un professionnel de santé" : "البحث عن كادر صحي"
            }
            placeholder={
              isFr
                ? "Rechercher par nom, spécialité ou commune..."
                : "ابحث بالاسم، التخصص أو البلدية..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pe-10"
          />
        </div>

        <div role="group" className="flex flex-wrap gap-2">
          <FilterChip active={filterType === "all"} onClick={() => setFilterType("all")}>
            {isFr ? `Tous (${volunteers.length})` : `الكل (${volunteers.length})`}
          </FilterChip>
          <FilterChip
            active={filterType === "human"}
            onClick={() => setFilterType("human")}
            icon="stethoscope"
          >
            {isFr ? "Médecine humaine" : "طب بشري"}
          </FilterChip>
          <FilterChip
            active={filterType === "vet"}
            onClick={() => setFilterType("vet")}
            icon="horse"
          >
            {isFr ? "Médecine vétérinaire" : "طب بيطري"}
          </FilterChip>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="border border-haba-border bg-haba-surface p-6 text-center text-sm text-haba-muted">
          {isFr
            ? "Aucun résultat ne correspond à votre recherche."
            : "لا توجد نتائج مطابقة لبحثك."}
        </p>
      ) : (
        <HairlineGrid min={300}>
          {filtered.map((v) => {
            const wilaya = v.wilaya_code ? findWilaya(v.wilaya_code) : null;
            const wilayaName = wilaya
              ? (isFr ? wilaya.name_fr : wilaya.name_ar)
              : v.wilaya_code;

            return (
              <HairlineCell key={v.id} className="flex flex-col gap-2 p-4 desktop:p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-2 font-bold text-haba-ink">
                    <Icon name="stethoscope" size={16} className="shrink-0 text-haba-green" />
                    {v.full_name}
                  </p>
                  <Chip tone="green" fill="tint" size="xs" className="shrink-0">
                    {v.specialty}
                  </Chip>
                </div>

                <p className="flex items-center gap-2 text-[13.5px] text-haba-ink-2">
                  <Icon name="location-01" size={14} className="shrink-0 text-haba-muted" />
                  {v.commune_id}
                  {wilayaName ? `، ${wilayaName}` : ""}
                </p>

                {v.phone && (
                  <p className="flex items-center gap-2 text-[13.5px]">
                    <Icon name="call-02" size={14} className="shrink-0 text-haba-muted" />
                    <a
                      href={`tel:${v.phone}`}
                      dir="ltr"
                      className={cn("font-semibold text-haba-green hover:underline", FOCUS_RING)}
                    >
                      {v.phone}
                    </a>
                  </p>
                )}

                {v.current_workplace && (
                  <p className="flex items-center gap-2 text-[13.5px] text-haba-ink-2">
                    <Icon name="building-06" size={14} className="shrink-0 text-haba-muted" />
                    {v.current_workplace}
                  </p>
                )}

                {v.can_teleconsult && (
                  <Chip tone="green" fill="outline" size="xs" className="mt-0.5">
                    <Icon name="call-ringing-02" size={12} />
                    {isFr ? "Téléconsultation disponible" : "متاح للاستشارة الهاتفية"}
                  </Chip>
                )}
              </HairlineCell>
            );
          })}
        </HairlineGrid>
      )}
    </section>
  );
}
