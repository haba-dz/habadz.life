import type { IconName } from "@/components/icons";
import type { PointStatus, VerificationLevel } from "@/lib/constants";
import type { AvailableLocale } from "@/i18n/locales";

export type PointKind = "collection_point" | "relief_hub" | "shelter";

/**
 * One description of the three centre kinds, shared by the counters, the
 * table, the cards, the legend and the maplibre markers. design.md §5.5
 *
 * `hex` duplicates the token because the markers and their popups are built as
 * raw DOM inside maplibre, where a Tailwind class never applies. The values are
 * the literal token colours; they must be edited together.
 */
export const POINT_KINDS: Record<
  PointKind,
  {
    icon: IconName;
    /** Chip / text tone in the design system. */
    tone: "ink" | "green" | "amber";
    text: string;
    bg: string;
    hex: string;
    label: Record<AvailableLocale, string>;
  }
> = {
  shelter: {
    icon: "house-01",
    tone: "ink",
    text: "text-haba-ink",
    bg: "bg-haba-ink",
    hex: "#15201B",
    label: { ar: "مركز إيواء", fr: "Centre d'hébergement" },
  },
  relief_hub: {
    icon: "heart-check",
    tone: "green",
    text: "text-haba-green",
    bg: "bg-haba-green",
    hex: "#0B5D3B",
    label: { ar: "مركز استقبال", fr: "Centre d'accueil" },
  },
  collection_point: {
    icon: "package",
    tone: "amber",
    text: "text-haba-amber",
    bg: "bg-haba-amber",
    hex: "#856419",
    label: { ar: "نقطة تجميع", fr: "Point de collecte" },
  },
};

export function getKindLabel(kind: PointKind, locale: AvailableLocale = "ar") {
  return POINT_KINDS[kind].label[locale] ?? POINT_KINDS[kind].label.ar;
}

/**
 * Status and verification tones. Local maps rather than the shared
 * PointStatusBadge / VerificationBadge, which /admin renders too. design.md §3.8
 */
export const pointStatusTone: Record<PointStatus, "green" | "amber" | "ink" | "red"> = {
  open: "green",
  full: "amber",
  paused: "ink",
  closed: "red",
};

export const verificationTone: Record<VerificationLevel, "green" | "amber" | "neutral"> = {
  unverified: "neutral",
  pending: "amber",
  verified: "green",
  field_verified: "green",
};
