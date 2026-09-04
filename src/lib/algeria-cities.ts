import algeriaCitiesRaw from "@/data/algeria_cities.json";
import type { AvailableLocale } from "@/i18n/locales";

export interface CommuneItem {
  id: string;
  name_ar: string;
  name_fr: string;
  daira_ar: string;
  daira_fr: string;
  wilaya_code: number;
  wilaya_name_ar: string;
  wilaya_name_fr: string;
  code_commune: number;
  lat: number;
  lng: number;
}

export interface WilayaItem {
  code: number;
  codeStr: string;
  name_ar: string;
  name_fr: string;
  lat: number;
  lng: number;
  isPriority: boolean;
  communesCount: number;
}

/** الولايات الأربع المتضررة المشمولة بالحملة النشطة */
export const PRIORITY_WILAYA_NAMES = ["جيجل", "بجاية", "سكيكدة", "ميلة"] as const;
export const PRIORITY_WILAYA_CODES = [18, 6, 21, 43] as const;

// All Communes parsed and normalized
export const algeriaCommunes: CommuneItem[] = (algeriaCitiesRaw as Array<{
  id: string;
  commune_name: string;
  commune_name_fr: string;
  daira_name: string;
  daira_name_fr: string;
  wilaya_code: number;
  wilaya_name: string;
  wilaya_name_fr: string;
  code_commune: number;
  Lat: number;
  Long: number;
}>).map((c) => ({
  id: c.id,
  name_ar: c.commune_name,
  name_fr: c.commune_name_fr,
  daira_ar: c.daira_name,
  daira_fr: c.daira_name_fr,
  wilaya_code: Number(c.wilaya_code),
  wilaya_name_ar: c.wilaya_name,
  wilaya_name_fr: c.wilaya_name_fr,
  code_commune: Number(c.code_commune),
  lat: Number(c.Lat),
  lng: Number(c.Long),
}));

// Build unique wilayas list
const wilayasMap = new Map<number, WilayaItem>();

algeriaCommunes.forEach((c) => {
  if (!wilayasMap.has(c.wilaya_code)) {
    const isPriority =
      PRIORITY_WILAYA_CODES.includes(c.wilaya_code as (typeof PRIORITY_WILAYA_CODES)[number]) ||
      PRIORITY_WILAYA_NAMES.includes(c.wilaya_name_ar as (typeof PRIORITY_WILAYA_NAMES)[number]);

    wilayasMap.set(c.wilaya_code, {
      code: c.wilaya_code,
      codeStr: String(c.wilaya_code).padStart(2, "0"),
      name_ar: c.wilaya_name_ar,
      name_fr: c.wilaya_name_fr,
      lat: c.lat,
      lng: c.lng,
      isPriority,
      communesCount: 0,
    });
  }
  const w = wilayasMap.get(c.wilaya_code)!;
  w.communesCount += 1;
});

export const allWilayas: WilayaItem[] = Array.from(wilayasMap.values()).sort((a, b) => a.code - b.code);

/** الولايات الأربع ذات الأولوية / المتضررة */
export const priorityWilayas: WilayaItem[] = allWilayas
  .filter((w) => w.isPriority)
  .sort((a, b) => {
    const order = [18, 6, 21, 43];
    return order.indexOf(a.code) - order.indexOf(b.code);
  });

/** باقي الولايات غير المتضررة */
export const otherWilayas: WilayaItem[] = allWilayas.filter((w) => !w.isPriority);

/** كافة الولايات مرتبة مع وضع الولايات المتضررة في الصدارة */
export const wilayasWithPriorityFirst: WilayaItem[] = [...priorityWilayas, ...otherWilayas];

/**
 * الحصول على اسم الولاية حسب اللغة الحالية
 */
export function getWilayaName(w: WilayaItem, locale: AvailableLocale = "ar"): string {
  return locale === "fr" ? w.name_fr : w.name_ar;
}

/**
 * الحصول على اسم الولاية مع رقمها (مثال: 18 - جيجل)
 */
export function getWilayaFormatted(w: WilayaItem, locale: AvailableLocale = "ar"): string {
  const name = getWilayaName(w, locale);
  return `${w.codeStr} - ${name}`;
}

/**
 * البحث عن ولاية بالاسم أو بالرقم
 */
export function findWilaya(query: string | number): WilayaItem | undefined {
  if (typeof query === "number") {
    return allWilayas.find((w) => w.code === query);
  }
  const clean = query.trim().toLowerCase();
  return allWilayas.find(
    (w) =>
      w.name_ar.toLowerCase() === clean ||
      w.name_fr.toLowerCase() === clean ||
      w.codeStr === clean ||
      String(w.code) === clean,
  );
}

/**
 * استخراج قائمة بلديات ولاية محددة
 */
export function getCommunesByWilaya(wilayaQuery: string | number): CommuneItem[] {
  const wilaya = findWilaya(wilayaQuery);
  if (!wilaya) return [];
  return algeriaCommunes.filter((c) => c.wilaya_code === wilaya.code);
}

/**
 * التحقق مما إذا كانت الولاية ضمن الولايات الأربع المتضررة
 */
export function isPriorityWilaya(wilayaQuery: string | number): boolean {
  const wilaya = findWilaya(wilayaQuery);
  return wilaya ? wilaya.isPriority : false;
}

/* ---------------------------------------------------------------------------
 * Display helpers for place names that come out of the database.
 *
 * Rows store the Arabic name — `wilaya: "جيجل"`, `commune: "الشقفة"` — because
 * that is what the field teams and the admin type. Printing those straight into
 * a French sentence produced "Wilaya de جيجل" on /map, /needs and /donate. The
 * reference list already carries `name_fr` for both levels, so resolve through
 * it and fall back to the stored string when a value is not in the list (an
 * operator's free text, or a misspelling).
 * ------------------------------------------------------------------------- */

const communesByArabicName = new Map<string, CommuneItem[]>();
for (const c of algeriaCommunes) {
  const key = c.name_ar.trim();
  const bucket = communesByArabicName.get(key);
  if (bucket) bucket.push(c);
  else communesByArabicName.set(key, [c]);
}

/**
 * A commune name is not unique across the country, so pass the wilaya when one
 * is known; without it the first match wins, which is right for display.
 */
export function findCommune(name: string, wilayaQuery?: string | number): CommuneItem | undefined {
  const matches = communesByArabicName.get(name.trim());
  if (!matches) return undefined;
  if (matches.length === 1 || wilayaQuery === undefined) return matches[0];
  const wilaya = findWilaya(wilayaQuery);
  return matches.find((c) => c.wilaya_code === wilaya?.code) ?? matches[0];
}

export function getCommuneName(
  name: string,
  locale: AvailableLocale = "ar",
  wilayaQuery?: string | number,
): string {
  if (locale !== "fr") return name;
  return findCommune(name, wilayaQuery)?.name_fr ?? name;
}

/** `ولاية جيجل` · `Wilaya de Jijel` */
export function formatWilaya(wilaya: string, locale: AvailableLocale = "ar"): string {
  const match = findWilaya(wilaya);
  const name = match ? getWilayaName(match, locale) : wilaya;
  return locale === "fr" ? `Wilaya de ${name}` : `ولاية ${name}`;
}

/**
 * `الشقفة، ولاية جيجل` · `Chekfa, Wilaya de Jijel`
 * The separator is the Arabic comma in Arabic and a plain one in French.
 */
export function formatPlace(
  commune: string,
  wilaya: string,
  locale: AvailableLocale = "ar",
): string {
  const sep = locale === "fr" ? ", " : "، ";
  return `${getCommuneName(commune, locale, wilaya)}${sep}${formatWilaya(wilaya, locale)}`;
}
