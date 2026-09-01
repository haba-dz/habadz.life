import { z } from "zod";
import { findWilaya } from "@/lib/algeria-cities";

const stripControlChars = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

export const vehicleOptions = [
  { value: "car", label: "سيارة" },
  { value: "van", label: "فان" },
  { value: "small_truck", label: "شاحنة صغيرة" },
  { value: "medium_truck", label: "شاحنة متوسطة" },
  { value: "large_truck", label: "شاحنة كبيرة" },
  { value: "trailer", label: "مقطورة" },
] as const;

export const transportOfferSchema = z.object({
  driver_name: z
    .string()
    .trim()
    .min(2, "الاسم مطلوب")
    .max(120, "الاسم طويل جداً")
    .transform(stripControlChars),
  phone: z
    .string()
    .trim()
    .regex(/^0[5-7][0-9]{8}$/, "رقم هاتف جزائري غير صحيح (مثال: 0555xxxxxx)"),
  origin_wilaya: z
    .string()
    .trim()
    .min(2, "نقطة الانطلاق مطلوبة")
    .refine((v) => !!findWilaya(v), "الولاية غير صحيحة"),
  origin_note: z.string().trim().max(300).transform(stripControlChars).optional().or(z.literal("")),
  destination_wilaya: z
    .string()
    .trim()
    .min(2)
    .refine((v) => !!findWilaya(v), "الولاية غير صحيحة"),
  destination_note: z.string().trim().max(300).transform(stripControlChars).optional().or(z.literal("")),
  vehicle_type: z.enum(["car", "van", "small_truck", "medium_truck", "large_truck", "trailer"]),
  max_capacity_kg: z.number().positive().max(50000, "السعة كبيرة جداً").optional(),
  available_space_note: z.string().trim().max(300).transform(stripControlChars).optional().or(z.literal("")),
  travel_date: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || !isNaN(Date.parse(v)), "تاريخ الرحلة غير صالح"),
  time_window: z.string().trim().max(100).transform(stripControlChars).optional().or(z.literal("")),
  has_empty_space: z.boolean(),
  notes: z.string().trim().max(500).transform(stripControlChars).optional().or(z.literal("")),
});

export type TransportOfferInput = z.infer<typeof transportOfferSchema>;
