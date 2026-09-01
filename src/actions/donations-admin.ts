"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/services/activity-log";
import { donationStatusLabels, type DonationStatus } from "@/lib/constants";
import type { Json } from "@/types/database";

const donationStatusSchema = z.enum(
  Object.keys(donationStatusLabels) as [DonationStatus, ...DonationStatus[]],
);

export async function updateDonationStatus(id: string, status: DonationStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "غير مصرح" };
  const parsed = donationStatusSchema.safeParse(status);
  if (!parsed.success) return { success: false, error: "حالة غير صالحة" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== "admin" && role !== "coordinator") return { success: false, error: "غير مصرح" };

  const { data: before } = await supabase.from("donations").select("status").eq("id", id).maybeSingle();

  const { error } = await supabase.from("donations").update({ status }).eq("id", id);
  if (error) return { success: false, error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: `غيّر حالة مساعدة إلى ${status}`,
    entityType: "donation",
    entityId: id,
    before: before as unknown as Json,
    after: { status } as unknown as Json,
  });

  revalidatePath("/admin/donations");
  return { success: true };
}
