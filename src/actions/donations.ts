"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateTag } from "next/cache";
import { donationSchema, type DonationInput } from "@/schemas/donation";
import { activeCampaignSlug } from "@/config/site";
import {
  findMatchingNeedsForDonation,
  suggestDeliveryPoint,
  type DeliveryPointSuggestion,
} from "@/services/matching";
import { logActivity } from "@/services/activity-log";
import type { Database, Json } from "@/types/database";

type Need = Database["public"]["Tables"]["needs"]["Row"];

export interface SubmitDonationResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  matches?: { need: Need; deficit: number; categorySlug: string }[];
  suggestedPoints?: DeliveryPointSuggestion[];
  alreadyAvailable?: { categorySlug: string; categoryName: string }[];
}

export async function submitDonation(input: DonationInput): Promise<SubmitDonationResult> {
  const parsed = donationSchema.safeParse(input);
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

  const matchResults = await findMatchingNeedsForDonation(
    supabase,
    data.items.map((it) => ({
      category_id: it.category_id,
      category_slug: it.category_slug,
      quantity: it.quantity,
      unit: it.unit,
    })),
    campaign.id,
  );

  const matchedCategorySlugs = new Set(
    matchResults.map((m) => data.items.find((it) => it.category_id === m.need.category_id)?.category_slug),
  );

  const alreadyAvailable = data.items
    .filter((it) => !matchResults.some((m) => m.need.category_id === it.category_id))
    .map((it) => ({ categorySlug: it.category_slug, categoryName: it.category_slug }));

  const suggestedPoints = await suggestDeliveryPoint(supabase, {
    originWilaya: data.current_wilaya,
    categorySlugs: [...matchedCategorySlugs, ...data.items.map((i) => i.category_slug)].filter(
      (v): v is string => Boolean(v),
    ),
  });

  const suggestedPointId =
    suggestedPoints.find((p) => p.kind === "collection_point")?.id ?? null;

  const { data: inserted, error: donationError } = await supabase
    .from("donations")
    .insert({
      campaign_id: campaign.id,
      donor_name: data.donor_name,
      donor_phone: data.donor_phone,
      current_wilaya: data.current_wilaya,
      current_commune: data.current_commune || null,
      needs_transport: data.needs_transport,
      can_deliver_self: data.can_deliver_self,
      ready_at: data.ready_at || null,
      notes: data.notes || null,
      suggested_collection_point_id: suggestedPointId,
    })
    .select("id")
    .single();

  if (donationError || !inserted) {
    return { success: false, error: "حدث خطأ أثناء تسجيل المساعدة. حاول مرة أخرى." };
  }

  const donationId = inserted.id;

  const { error: itemsError } = await supabase.from("donation_items").insert(
    data.items.map((it) => ({
      donation_id: donationId,
      category_id: it.category_id,
      quantity: it.quantity,
      unit: it.unit,
      description: it.description || null,
    })),
  );

  if (itemsError) {
    try {
      const admin = createAdminClient();
      await admin.from("donations").delete().eq("id", donationId);
    } catch {}
    return { success: false, error: "حدث خطأ أثناء تسجيل مواد المساعدة. حاول مرة أخرى." };
  }

  try {
    const admin = createAdminClient();
    await logActivity(admin, {
      action: "donation_created",
      entityType: "donation",
      entityId: donationId,
      after: {
        wilaya: data.current_wilaya,
        itemsCount: data.items.length,
        needs_transport: data.needs_transport,
      } as unknown as Json,
    });
  } catch {}

  updateTag("admin-stats");
  updateTag("public-reads");
  return {
    success: true,
    matches: matchResults.slice(0, 5).map((m) => ({
      need: m.need,
      deficit: m.deficit,
      categorySlug: data.items.find((it) => it.category_id === m.need.category_id)?.category_slug ?? "",
    })),
    suggestedPoints: suggestedPoints.slice(0, 3),
    alreadyAvailable,
  };
}
