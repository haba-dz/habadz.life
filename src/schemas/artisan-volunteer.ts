import { z } from "zod";

export const artisanVolunteerSchema = z.object({
  full_name: z.string({ error: "الاسم الكامل مطلوب" }).min(3, "الاسم يجب أن يحتوي على 3 أحرف على الأقل"),
  phone: z
    .string({ error: "رقم الهاتف مطلوب" })
    .regex(/^(0)(5|6|7)[0-9]{8}$/, "رقم الهاتف غير صحيح (مثال: 0612345678)"),
  specialty: z.string({ error: "يرجى تحديد التخصص" }).trim().min(2, "التخصص مطلوب").max(120),
  wilaya_code: z.string({ error: "يرجى اختيار الولاية" }).trim().min(1).max(10),
  commune_id: z.string({ error: "يرجى اختيار البلدية" }).trim().min(1).max(120),
  can_travel: z.boolean(),
  has_own_tools: z.boolean(),
  show_phone_publicly: z.boolean(),
  notes: z.string().trim().max(500, "الملاحظات لا يجب أن تتجاوز 500 حرف").optional().or(z.literal("")),
});

export type ArtisanVolunteerInput = z.infer<typeof artisanVolunteerSchema>;
