"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/services/activity-log";
import type { RequestStatus, VerificationLevel, PriorityLevel } from "@/lib/constants";

async function requireManager(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, user: null };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== "admin" && role !== "coordinator") return { ok: false as const, user };
  return { ok: true as const, user };
}

export async function updateBeneficiaryStatus(id: string, status: RequestStatus) {
  const supabase = await createClient();
  const gate = await requireManager(supabase);
  if (!gate.ok) return { success: false, error: "غير مخوّل — هذه العملية للطاقم فقط." };
  const { user } = gate;

  const { error } = await supabase.from("beneficiary_requests").update({ status }).eq("id", id);
  if (error) return { success: false, error: error.message };

  await logActivity(supabase, {
    actorId: user?.id,
    action: `غيّر حالة طلب مساعدة إلى ${status}`,
    entityType: "beneficiary_request",
    entityId: id,
  });

  revalidatePath("/admin/beneficiaries");
  revalidatePath("/transparency");
  revalidatePath("/");
  return { success: true };
}

export async function updateBeneficiaryPriority(id: string, priority: PriorityLevel) {
  const supabase = await createClient();
  const gate = await requireManager(supabase);
  if (!gate.ok) return { success: false, error: "غير مخوّل — هذه العملية للطاقم فقط." };
  const { user } = gate;

  const { error } = await supabase.from("beneficiary_requests").update({ priority }).eq("id", id);
  if (error) return { success: false, error: error.message };

  await logActivity(supabase, {
    actorId: user?.id,
    action: `غيّر أولوية طلب مساعدة إلى ${priority}`,
    entityType: "beneficiary_request",
    entityId: id,
  });

  revalidatePath("/admin/beneficiaries");
  return { success: true };
}

export async function updateBeneficiaryVerification(id: string, level: VerificationLevel) {
  const supabase = await createClient();
  const gate = await requireManager(supabase);
  if (!gate.ok) return { success: false, error: "غير مخوّل — هذه العملية للطاقم فقط." };
  const { user } = gate;

  const { error } = await supabase
    .from("beneficiary_requests")
    .update({ verification_level: level, verified_by: user?.id, verified_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  await supabase.from("verification_records").insert({
    entity_type: "beneficiary_request",
    entity_id: id,
    level,
    verified_by: user?.id,
  });

  revalidatePath("/admin/beneficiaries");
  return { success: true };
}
