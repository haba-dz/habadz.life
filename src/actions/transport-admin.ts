"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/services/activity-log";
import { transportStatusLabels, type TransportStatus } from "@/lib/constants";
import type { Json } from "@/types/database";

const transportStatusSchema = z.enum(
  Object.keys(transportStatusLabels) as [TransportStatus, ...TransportStatus[]],
);

export async function updateTransportOfferStatus(id: string, status: TransportStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "غير مصرح" };
  const parsed = transportStatusSchema.safeParse(status);
  if (!parsed.success) return { success: false, error: "حالة غير صالحة" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== "admin" && role !== "coordinator") return { success: false, error: "غير مصرح" };

  const { data: before } = await supabase.from("transport_offers").select("status").eq("id", id).maybeSingle();

  const { error } = await supabase.from("transport_offers").update({ status }).eq("id", id);
  if (error) return { success: false, error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: `غيّر حالة عرض نقل إلى ${status}`,
    entityType: "transport_offer",
    entityId: id,
    before: before as unknown as Json,
    after: { status } as unknown as Json,
  });

  revalidatePath("/admin/transport");
  return { success: true };
}
