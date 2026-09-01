"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { transportOfferSchema, type TransportOfferInput } from "@/schemas/transport-offer";
import { activeCampaignSlug } from "@/config/site";
import { getPublicTransportCandidates, type TransportMatch } from "@/services/matching";
import { logActivity } from "@/services/activity-log";
import type { Json } from "@/types/database";

export interface SubmitTransportResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  candidates?: TransportMatch[];
}

export async function submitTransportOffer(input: TransportOfferInput): Promise<SubmitTransportResult> {
  const parsed = transportOfferSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "الرجاء التحقق من الحقول المدخلة.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .eq("slug", activeCampaignSlug)
    .maybeSingle();

  if (!campaign) {
    return { success: false, error: "تعذر تحديد الحملة النشطة حاليًا. حاول مرة أخرى لاحقًا." };
  }

  const { error } = await supabase.from("transport_offers").insert({
    campaign_id: campaign.id,
    driver_name: data.driver_name,
    phone: data.phone,
    origin_wilaya: data.origin_wilaya,
    origin_note: data.origin_note || null,
    destination_wilaya: data.destination_wilaya,
    destination_note: data.destination_note || null,
    vehicle_type: data.vehicle_type,
    max_capacity_kg: data.max_capacity_kg,
    available_space_note: data.available_space_note || null,
    travel_date: data.travel_date || null,
    time_window: data.time_window || null,
    has_empty_space: data.has_empty_space,
    notes: data.notes || null,
  });

  if (error) {
    return { success: false, error: "حدث خطأ أثناء تسجيل عرض النقل. حاول مرة أخرى." };
  }

  try {
    const admin = createAdminClient();
    await logActivity(admin, {
      action: "transport_offer_created",
      entityType: "transport_offer",
      after: { origin_wilaya: data.origin_wilaya, destination_wilaya: data.destination_wilaya } as unknown as Json,
    });
  } catch {}

  const candidates = await getPublicTransportCandidates(supabase, data.origin_wilaya);

  return { success: true, candidates: candidates.slice(0, 8) };
}
