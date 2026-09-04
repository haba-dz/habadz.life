// أرقام الطوارئ الرسمية في الجزائر — مجانية وتعمل على مدار الساعة.
// تم التحقق منها من مصادر رسمية (المديرية العامة للحماية المدنية، المديرية العامة للأمن
// الوطني، المديرية العامة للغابات) — أغسطس 2026.
import { Ambulance, Shield, ShieldAlert, TreePine, type LucideIcon } from "lucide-react";

export interface EmergencyContact {
  /** رقم النجدة القصير */
  number: string;
  /** الرقم الأخضر المجاني (إن وُجد) */
  greenNumber?: string;
  label: string;
  label_fr?: string;
  hint?: string;
  hint_fr?: string;
  icon: LucideIcon;
}

export const emergencyContacts: EmergencyContact[] = [
  {
    number: "14",
    greenNumber: "1021",
    label: "الحماية المدنية",
    label_fr: "Protection Civile",
    hint: "إسعاف وإنقاذ وإخماد حرائق",
    hint_fr: "Secours, sauvetage et extinction des incendies",
    icon: Ambulance,
  },
  {
    number: "1055",
    label: "الدرك الوطني",
    label_fr: "Gendarmerie Nationale",
    hint: "المناطق الريفية والطرق",
    hint_fr: "Zones rurales et axes routiers",
    icon: Shield,
  },
  {
    number: "17",
    greenNumber: "1548",
    label: "الشرطة الجزائرية",
    label_fr: "Police / Sûreté Nationale",
    hint: "الأمن الوطني — المناطق الحضرية",
    hint_fr: "Sûreté nationale — Zones urbaines",
    icon: ShieldAlert,
  },
  {
    number: "1070",
    label: "المديرية العامة للغابات",
    label_fr: "Direction Générale des Forêts",
    hint: "التبليغ عن حرائق الغابات",
    hint_fr: "Signalement des feux de forêt",
    icon: TreePine,
  },
];

/**
 * Flattens the contacts into the row shape the emergency-numbers block renders
 * (design.md §3.17): the short number, plus a second row for the toll-free
 * number where one exists, labelled as such with the authority beneath it.
 *
 * The artboards hardcode five rows; this derives them from the verified list
 * above, which also carries 1070 (forest fires).
 */
export function emergencyNumberRows(
  locale: "ar" | "fr",
  greenLabel: string,
): { number: string; name: string; sub: string }[] {
  return emergencyContacts.flatMap((c) => {
    const name = (locale === "fr" ? c.label_fr : c.label) ?? c.label;
    const sub = ((locale === "fr" ? c.hint_fr : c.hint) ?? "") as string;
    const rows = [{ number: c.number, name, sub }];
    if (c.greenNumber) rows.push({ number: c.greenNumber, name: greenLabel, sub: name });
    return rows;
  });
}
