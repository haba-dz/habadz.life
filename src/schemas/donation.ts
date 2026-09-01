import { z } from "zod";
import { findWilaya } from "@/lib/algeria-cities";

const stripControlChars = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

export const unitOptions = [
  { value: "piece", label: "قطعة" },
  { value: "box", label: "صندوق" },
  { value: "portion", label: "حصة" },
  { value: "carton", label: "كرتون" },
  { value: "liter", label: "لتر" },
  { value: "kg", label: "كيلوغرام" },
  { value: "ton", label: "طن" },
  { value: "bundle", label: "طرد" },
  { value: "person", label: "شخص" },
] as const;

export const donationItemSchema = z.object({
  category_id: z.string().uuid("اختر نوع المساعدة"),
  category_slug: z.string().min(1),
  quantity: z
    .number()
    .positive("الكمية يجب أن تكون أكبر من صفر")
    .max(10000, "الكمية كبيرة جداً")
    .refine((v) => Number.isFinite(v), "الكمية غير صالحة"),
  unit: z.enum(["piece", "box", "portion", "carton", "liter", "kg", "ton", "bundle", "person"]),
  description: z
    .string()
    .trim()
    .max(300)
    .transform(stripControlChars)
    .optional()
    .or(z.literal("")),
});

export const donationSchema = z
  .object({
    donor_name: z
      .string()
      .trim()
      .min(2, "الاسم مطلوب")
      .max(120, "الاسم طويل جداً")
      .transform(stripControlChars),
    donor_phone: z
      .string()
      .trim()
      .regex(/^0[5-7][0-9]{8}$/, "رقم هاتف جزائري غير صحيح (مثال: 0555xxxxxx)"),
    current_wilaya: z
      .string()
      .trim()
      .min(2, "الولاية مطلوبة")
      .refine((v) => !!findWilaya(v), "الولاية غير صحيحة"),
    current_commune: z.string().trim().max(200).transform(stripControlChars).optional().or(z.literal("")),
    needs_transport: z.boolean(),
    can_deliver_self: z.boolean(),
    ready_at: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || !isNaN(Date.parse(v)), "تاريخ الجاهزية غير صالح"),
    notes: z.string().trim().max(500).transform(stripControlChars).optional().or(z.literal("")),
    items: z.array(donationItemSchema).min(1, "أضف مادة واحدة على الأقل"),
  })
  .superRefine((data, ctx) => {
    if (data.needs_transport === data.can_deliver_self) {
      ctx.addIssue({
        code: "custom",
        message: "اختر طريقة واحدة للتوصيل",
        path: ["needs_transport"],
      });
    }
  });

export type DonationInput = z.infer<typeof donationSchema>;
