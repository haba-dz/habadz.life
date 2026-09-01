import {
  wilayasWithPriorityFirst,
  priorityWilayas,
  findWilaya,
} from "./algeria-cities";

export interface Wilaya {
  code: string;
  name: string;
  lat: number;
  lng: number;
  isPriority?: boolean;
}

// قائمة كاملة بكافة ولايات الجزائر الـ69 مع وضع الولايات المتضررة في الصدارة
export const wilayas: Wilaya[] = wilayasWithPriorityFirst.map((w) => ({
  code: w.codeStr,
  name: w.name_ar,
  lat: w.lat,
  lng: w.lng,
  isPriority: w.isPriority,
}));

export const wilayaNames = wilayas.map((w) => w.name);

export const priorityWilayaNames = priorityWilayas.map((w) => w.name_ar);

export function findWilayaByName(name: string): Wilaya | undefined {
  const found = findWilaya(name);
  if (!found) return undefined;
  return {
    code: found.codeStr,
    name: found.name_ar,
    lat: found.lat,
    lng: found.lng,
    isPriority: found.isPriority,
  };
}

export function haversineDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number | null {
  if (!isFinite(a.lat) || !isFinite(a.lng) || !isFinite(b.lat) || !isFinite(b.lng)) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const clamped = Math.min(1, Math.max(0, h));
  const result = Math.round(R * 2 * Math.atan2(Math.sqrt(clamped), Math.sqrt(1 - clamped)));
  return isFinite(result) ? result : null;
}
