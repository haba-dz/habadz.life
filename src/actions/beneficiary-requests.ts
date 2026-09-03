"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateTag } from "next/cache";
import {
  beneficiaryRequestSchema,
  type BeneficiaryRequestInput,
} from "@/schemas/beneficiary-request";
import { activeCampaignSlug } from "@/config/site";

export interface SubmitBeneficiaryRequestResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export async function submitBeneficiaryRequest(
  input: BeneficiaryRequestInput,
): Promise<SubmitBeneficiaryRequestResult> {
  const parsed = beneficiaryRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "الرجاء التحقق من الحقول المدخلة.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  const supabase = await createClient();

  // P1-05 dedup: same phone within 10 min
  try {
    const adminForDedup = createAdminClient();
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recent } = await adminForDedup
      .from("beneficiary_requests")
      .select("id")
      .eq("phone", data.phone)
      .gte("created_at", tenMinAgo)
      .limit(1);
    if (recent && recent.length > 0) {
      return { success: true };
    }
  } catch {
    // fail open if admin key not configured locally
  }

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .eq("slug", activeCampaignSlug)
    .maybeSingle();

  if (!campaign) {
    return { success: false, error: "تعذر تحديد الحملة النشطة حاليًا. حاول مرة أخرى لاحقًا." };
  }

  const { error } = await supabase.from("beneficiary_requests").insert({
    campaign_id: campaign.id,
    full_name: data.full_name,
    phone: data.phone,
    wilaya: data.wilaya,
    commune: data.commune,
    address_note: data.address_note || null,
    family_members_count: data.family_members_count,
    children_count: data.children_count,
    housing_status: data.housing_status || null,
    is_housing_habitable:
      data.is_housing_habitable === "unknown" ? null : data.is_housing_habitable === "yes",
    has_injuries: data.has_injuries,
    injuries_note: data.injuries_note || null,
    needs_medical: data.needs_medical,
    medical_note: data.medical_note || null,
    lost_livestock: data.lost_livestock,
    lost_income: data.lost_income,
    needed_categories: data.needed_categories,
    other_needs_note: data.other_needs_note || null,
  });

  if (error) {
    return { success: false, error: "حدث خطأ أثناء تسجيل طلبك. حاول مرة أخرى." };
  }

  // P1-04: audit log via service-role so anon insert has a trail (actor_id null, no raw PII in logs)
  try {
    const adminForLog = createAdminClient();
    await adminForLog.from("activity_logs").insert({
      actor_id: null,
      action: `طلب مساعدة جديد (${data.commune})`,
      entity_type: "beneficiary_request",
    });
  } catch {
    // silent — logging must not break user flow
  }

  updateTag("admin-stats");
  return { success: true };
}
