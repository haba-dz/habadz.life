"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/services/activity-log";
import { updateInventory } from "@/services/inventory";

export const txnSchema = z
  .object({
    hub_id: z.string().uuid(),
    category_id: z.string().uuid(),
    type: z.enum(["in", "out", "adjustment", "transfer"]),
    quantity: z
      .number()
      .positive("يجب أن تكون الكمية أكبر من صفر")
      .max(100000, "الكمية كبيرة جداً")
      .refine((v) => Number.isFinite(v), "الكمية غير صالحة"),
    unit: z.enum(["piece", "box", "portion", "carton", "liter", "kg", "ton", "bundle", "person"]),
    destination_hub_id: z.string().uuid().optional(),
    note: z
      .string()
      .trim()
      .max(300)
      .transform((s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ""))
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.type === "transfer" && data.destination_hub_id === data.hub_id) {
      ctx.addIssue({ code: "custom", message: "الوجهة لا يمكن أن تكون نفس المصدر", path: ["destination_hub_id"] });
    }
  });
export type InventoryTxnInput = z.infer<typeof txnSchema>;

export async function recordInventoryTransaction(input: InventoryTxnInput) {
  const parsed = txnSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "بيانات غير صحيحة." };
  const data = parsed.data;

  if (data.type === "transfer" && !data.destination_hub_id) {
    return { success: false, error: "يجب تحديد المركز الوجهة عند النقل." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "غير مصرح" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== "admin" && role !== "coordinator") return { success: false, error: "غير مصرح" };

  const { data: before } = await supabase
    .from("inventory_items")
    .select("quantity")
    .eq("hub_id", data.hub_id)
    .eq("category_id", data.category_id)
    .maybeSingle();

  const { error } = await updateInventory(supabase, {
    hubId: data.hub_id,
    categoryId: data.category_id,
    type: data.type,
    quantity: data.quantity,
    unit: data.unit,
    sourceHubId: data.type === "transfer" ? data.hub_id : undefined,
    destinationHubId: data.type === "transfer" ? data.destination_hub_id : undefined,
    performedBy: user.id,
    note: data.note || undefined,
  });

  if (error) return { success: false, error: "حدث خطأ أثناء تسجيل حركة المخزون." };

  await logActivity(supabase, {
    actorId: user.id,
    action: `سجّل حركة مخزون (${data.type}) بكمية ${data.quantity}`,
    entityType: "inventory_transaction",
    before: before as unknown as Record<string, unknown> as never,
    after: { quantity: data.quantity, type: data.type } as unknown as Record<string, unknown> as never,
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/needs");
  revalidatePath("/needs");
  revalidatePath("/");
  return { success: true };
}

export const thresholdSchema = z.object({
  hub_id: z.string().uuid(),
  category_id: z.string().uuid(),
  min_threshold: z.number().min(0),
});

export async function updateMinThreshold(input: z.infer<typeof thresholdSchema>) {
  const parsed = thresholdSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "بيانات غير صحيحة." };
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== "admin" && role !== "coordinator") return { success: false, error: "غير مصرح" };

  const { data: before } = await supabase
    .from("inventory_items")
    .select("min_threshold")
    .eq("hub_id", data.hub_id)
    .eq("category_id", data.category_id)
    .maybeSingle();

  const { error } = await supabase
    .from("inventory_items")
    .update({ min_threshold: data.min_threshold })
    .eq("hub_id", data.hub_id)
    .eq("category_id", data.category_id);

  if (error) return { success: false, error: "حدث خطأ أثناء تحديث الحد الأدنى." };

  await logActivity(supabase, {
    actorId: user.id,
    action: `حدّث الحد الأدنى إلى ${data.min_threshold}`,
    entityType: "inventory_item",
    before: before as unknown as Record<string, unknown> as never,
    after: { min_threshold: data.min_threshold } as unknown as Record<string, unknown> as never,
  });

  revalidatePath("/admin/inventory");
  return { success: true };
}
