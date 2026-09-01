import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { findWilayaByName, haversineDistanceKm } from "@/lib/wilayas";
import { getBatchSignedDamagePhotoUrls } from "@/actions/damage-assessments";
import { type ArtisanCandidate } from "./assign-artisan-select";
import { ExportDamageAssessmentsCsvButton } from "./export-csv-button";
import { DamageAssessmentsList } from "./damage-assessments-list";

export const metadata: Metadata = { title: "تقييمات الأضرار", robots: { index: false } };

const statusOrder = { pending: 0, estimated: 1, matched: 2, in_progress: 3, completed: 4, rejected: 5 };

export default async function AdminDamageAssessmentsPage() {
  const supabase = await createClient();

  const [{ data: assessments }, { data: artisans }] = await Promise.all([
    supabase.from("damage_assessments").select("*").order("created_at", { ascending: false }),
    supabase.from("artisan_volunteers").select("*").eq("status", "verified"),
  ]);

  const rows = (assessments ?? [])
    .slice()
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  const pendingCount = rows.filter((r) => r.status === "pending").length;
  const verifiedArtisans = artisans ?? [];

  // لكل تقييم: نرشّح الحرفيين المطابقين للتخصص المطلوب، مرتّبين حسب نفس الولاية ثم المسافة —
  // نفس منطق suggestDeliveryPoint في services/matching.ts، بدون إسناد تلقائي (اقتراح فقط).
  const allPhotoPaths = rows.flatMap((r) => r.photo_paths);
  const signedUrlMap = await getBatchSignedDamagePhotoUrls(allPhotoPaths);
  const photoUrlsByAssessment = new Map<string, string[]>(
    rows.map((r) => [
      r.id,
      r.photo_paths.map((p) => signedUrlMap.get(p)).filter((u): u is string => Boolean(u)),
    ]),
  );

  const enriched = rows.map((r) => {
    const origin = findWilayaByName(r.wilaya);
    const candidates: ArtisanCandidate[] = verifiedArtisans
      .filter(
        (a) =>
          r.required_specialties.length === 0 ||
          r.required_specialties.some((s) => a.specialty.includes(s) || s.includes(a.specialty)),
      )
      .map((a) => {
        const target = findWilayaByName(a.wilaya_code) ?? findWilayaByName(a.commune_id);
        const distanceKm = origin && target ? haversineDistanceKm(origin, target) : null;
        const sameWilaya = a.wilaya_code === r.wilaya;
        return {
          id: a.id,
          full_name: a.full_name,
          specialty: a.specialty,
          distanceLabel: sameWilaya
            ? "نفس الولاية"
            : distanceKm !== null
              ? `${distanceKm} كم`
              : a.wilaya_code,
          sortKey: sameWilaya ? -1 : (distanceKm ?? 9999),
        };
      })
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ id, full_name, specialty, distanceLabel }) => ({ id, full_name, specialty, distanceLabel }));

    return { ...r, candidates, photoUrls: photoUrlsByAssessment.get(r.id) ?? [] };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">تقييمات الأضرار</h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount === 0
              ? "لا توجد تقييمات بانتظار المراجعة حاليًا."
              : `${pendingCount} تقييمًا بانتظار المراجعة.`}
          </p>
        </div>
        <ExportDamageAssessmentsCsvButton rows={enriched} />
      </div>

      <DamageAssessmentsList rows={enriched} />
    </div>
  );
}
