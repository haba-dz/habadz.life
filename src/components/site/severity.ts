import type { Database } from "@/types/database";

type AffectedSeverity = Database["public"]["Enums"]["affected_severity"];

/**
 * The artboards show a three-level severity badge (مرتفع / متوسط / منخفض).
 * The schema has five levels and no numeric one, so the badge tone is derived
 * rather than stored. The mapping follows `severityEmoji` in lib/constants.ts
 * (🔴 🟠 🟡 🔥 ⚪) so the colour means the same thing it already meant in the
 * product. design.md §8.2
 */
export const severityTone: Record<AffectedSeverity, "red" | "amber" | "neutral"> = {
  ravaged: "red",
  burning: "red",
  evacuated: "amber",
  threatened: "amber",
  unconfirmed: "neutral",
};

/** Counts as "severe" for the wilaya summary. */
export const isSevere = (s: AffectedSeverity) => severityTone[s] === "red";
