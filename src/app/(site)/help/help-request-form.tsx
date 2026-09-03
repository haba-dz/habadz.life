"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  HeartHandshake,
  MapPin,
  Phone,
  Home,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Droplets,
  Utensils,
  Shirt,
  Sparkles,
  Baby,
  Pill,
  Tent,
  Hammer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WilayaSelect } from "@/components/ui/wilaya-select";
import { CommuneSelect } from "@/components/ui/commune-select";
import {
  beneficiaryRequestSchema,
  needCategoryOptions,
  type BeneficiaryRequestInput,
} from "@/schemas/beneficiary-request";
import { submitBeneficiaryRequest } from "@/actions/beneficiary-requests";
import { SuccessPanel } from "@/components/shared/success-panel";
import type { AvailableLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, typeof Droplets> = {
  water: Droplets,
  food: Utensils,
  clothing: Shirt,
  blankets: Sparkles,
  baby_supplies: Baby,
  medical: Pill,
  veterinary: Pill,
  hygiene: Sparkles,
  kitchenware: Utensils,
  shelter: Tent,
  construction_materials: Hammer,
  other: HeartHandshake,
};

export function HelpRequestForm({
  locale = "ar",
}: {
  locale?: AvailableLocale;
}) {
  const isFr = locale === "fr";
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BeneficiaryRequestInput>({
    resolver: zodResolver(beneficiaryRequestSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      wilaya: "جيجل",
      commune: "",
      address_note: "",
      family_members_count: 4,
      children_count: 1,
      housing_status: "",
      is_housing_habitable: "unknown",
      has_injuries: false,
      injuries_note: "",
      needs_medical: false,
      medical_note: "",
      lost_livestock: false,
      lost_income: false,
      needed_categories: ["food", "water"],
      other_needs_note: "",
    },
  });

  const selectedWilaya = watch("wilaya");
  const selectedCategories = watch("needed_categories") || [];
  const hasInjuries = watch("has_injuries");
  const needsMedical = watch("needs_medical");
  const housingHabitable = watch("is_housing_habitable");

  function toggleCategory(cat: string) {
    const current = selectedCategories;
    const next = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    setValue("needed_categories", next, { shouldValidate: true });
  }

  async function onSubmit(values: BeneficiaryRequestInput) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitBeneficiaryRequest(values);
      if (!res.success) {
        setSubmitError(
          res.error ??
            (isFr
              ? "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer."
              : "حدث خطأ أثناء إرسال طلبكم. يُرجى المحاولة مرة أخرى.")
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError(
        isFr
          ? "Une erreur inattendue est survenue. Veuillez vérifier votre connexion."
          : "حدث خطأ غير متوقع. يُرجى التحقق من اتصال الإنترنت والمحاولة ثانية."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="animate-rise space-y-6">
        <SuccessPanel
          title={isFr ? "Demande enregistrée avec succès" : "تم تسجيل طلبكم بنجاح"}
          description={
            isFr
              ? "Votre demande a été transmise aux cellules de coordination et équipes de secours de votre secteur. Vous serez contacté dans les plus brefs délais."
              : "تم إرسال طلبكم إلى خلية التنسيق الميدانية ولجان الإغاثة في منطقتكم. سيتم التواصل معكم فور معالجة الطلب لتوفير الاحتياجات."
          }
          primaryHref="/"
          primaryLabel={isFr ? "Retour à l'accueil" : "العودة للرئيسية"}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. Identity & Location */}
      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-priority-critical/10 text-priority-critical text-sm font-extrabold">
              1
            </span>
            <h2>{isFr ? "Identité et localisation du foyer" : "بيانات الاتصال ومكان التواجد"}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5">{isFr ? "Nom et prénom du responsable *" : "الاسم واللقب (رب الأسرة أو المتصل) *"}</Label>
              <Input placeholder={isFr ? "Ex: Karim Benali" : "مثال: عبد القادر بوعلام"} {...register("full_name")} />
              {errors.full_name && <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>}
            </div>

            <div>
              <Label className="mb-1.5">{isFr ? "Numéro de téléphone joignable *" : "رقم الهاتف للتواصل المباشر *"}</Label>
              <Input dir="ltr" placeholder="0555xxxxxx" {...register("phone")} />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5">{isFr ? "Wilaya *" : "الولاية *"}</Label>
              <WilayaSelect
                locale={locale}
                value={selectedWilaya}
                onChange={(e) => {
                  setValue("wilaya", e.target.value, { shouldValidate: true });
                  setValue("commune", "");
                }}
              />
              {errors.wilaya && <p className="mt-1 text-xs text-destructive">{errors.wilaya.message}</p>}
            </div>

            <div>
              <Label className="mb-1.5">{isFr ? "Commune / Village *" : "البلدية / القرية أو الحي *"}</Label>
              <CommuneSelect
                wilaya={selectedWilaya}
                locale={locale}
                value={watch("commune")}
                onChange={(e) => setValue("commune", e.target.value, { shouldValidate: true })}
              />
              {errors.commune && <p className="mt-1 text-xs text-destructive">{errors.commune.message}</p>}
            </div>
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Précision sur le lieu (facultatif)" : "تحديد العنوان أو معالم الوصول (اختياري)"}</Label>
            <Input
              placeholder={isFr ? "Ex: Village Tala, près de l'école..." : "مثال: قرية تالامان، بجوار المدرسة الابتدائية..."}
              {...register("address_note")}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Family & Housing Situation */}
      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-priority-critical/10 text-priority-critical text-sm font-extrabold">
              2
            </span>
            <h2>{isFr ? "Situation familiale et état du logement" : "حجم الأسرة ووضعية السكن"}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5">{isFr ? "Nombre de membres de la famille" : "عدد أفراد العائلة الإجمالي"}</Label>
              <Input
                type="number"
                min="1"
                max="50"
                {...register("family_members_count", { valueAsNumber: true })}
              />
              {errors.family_members_count && (
                <p className="mt-1 text-xs text-destructive">{errors.family_members_count.message}</p>
              )}
            </div>

            <div>
              <Label className="mb-1.5">{isFr ? "Dont nombre d'enfants / bébés" : "منهم عدد الأطفال والرُّضع"}</Label>
              <Input
                type="number"
                min="0"
                max="50"
                {...register("children_count", { valueAsNumber: true })}
              />
              {errors.children_count && (
                <p className="mt-1 text-xs text-destructive">{errors.children_count.message}</p>
              )}
            </div>
          </div>

          {/* Housing Habitable status */}
          <div>
            <Label className="mb-1.5">{isFr ? "Le logement est-il habitable actuellement ?" : "هل السكن صالح للإقامة حالياً أم تضرر؟"}</Label>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {([
                { val: "yes", label: isFr ? "Oui, habitable" : "نعم، صالح للإقامة" },
                { val: "no", label: isFr ? "Non, sinistré / évacué" : "لا، متضرر أو تم إخلاؤه" },
                { val: "unknown", label: isFr ? "Partiellement" : "أضرار جزئية" },
              ] as const).map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setValue("is_housing_habitable", opt.val, { shouldValidate: true })}
                  className={cn(
                    "rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer text-center",
                    housingHabitable === opt.val
                      ? "border-priority-critical bg-priority-critical/10 text-priority-critical ring-2 ring-priority-critical/20"
                      : "border-border bg-card hover:bg-secondary/40 text-muted-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Needed Aid Categories */}
      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-priority-critical/10 text-priority-critical text-sm font-extrabold">
              3
            </span>
            <h2>{isFr ? "Besoins prioritaires demandés *" : "نوع المساعدات المطلوبة بإلحاح *"}</h2>
          </div>

          <p className="text-xs text-muted-foreground">
            {isFr
              ? "Sélectionnez toutes les catégories nécessaires pour votre famille :"
              : "حدد المواد الأساسية التي تحتاجها أسرتكم في الوقت الراهن :"}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {needCategoryOptions.map((cat) => {
              const selected = selectedCategories.includes(cat.value);
              const Icon = categoryIcons[cat.value] || HeartHandshake;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCategory(cat.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all text-start cursor-pointer",
                    selected
                      ? "border-priority-critical bg-priority-critical/10 text-priority-critical ring-2 ring-priority-critical/25 shadow-xs"
                      : "border-border bg-card/70 hover:bg-secondary/40 text-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
          {errors.needed_categories && (
            <p className="mt-1 text-xs text-destructive">{errors.needed_categories.message}</p>
          )}

          {/* Health & Special Conditions */}
          <div className="pt-3 border-t border-border/60 space-y-2.5">
            <label className="flex items-center gap-2.5 text-xs text-foreground font-semibold cursor-pointer">
              <Checkbox
                checked={needsMedical}
                onCheckedChange={(v) => setValue("needs_medical", Boolean(v))}
              />
              <span>{isFr ? "Présence de malades chroniques ou besoin d'ordonnances" : "يوجد أصحاب أمراض مزمنة أو حاجة لأدوية محددة"}</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-foreground font-semibold cursor-pointer">
              <Checkbox
                checked={hasInjuries}
                onCheckedChange={(v) => setValue("has_injuries", Boolean(v))}
              />
              <span>{isFr ? "Présence de blessés ou de cas nécessitant des soins" : "يوجد مصابون أو حالات تحتاج لعلاج ومتابعة طبية"}</span>
            </label>
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Détails ou besoins particuliers (facultatif)" : "ملاحظات وتفاصيل إضافية (اختياري)"}</Label>
            <Textarea
              placeholder={
                isFr
                  ? "Précisez des besoins spécifiques (ex: lait pour bébé 1er âge, couches taille 4, insuline...)"
                  : "اكتب أي احتياجات خاصة (مثال: حليب أطفال نوع معين، حفاضات مقاس 4، أدوية سكري...)"
              }
              {...register("other_needs_note")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dignity & Privacy Notice */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-2xl border border-border/80 bg-muted/40 text-xs text-muted-foreground leading-relaxed">
        <ShieldCheck className="size-4 text-algeria-green shrink-0 mt-0.5" />
        <p>
          {isFr
            ? "Vos informations personnelles sont strictement confidentielles. Elles ne sont utilisées que pour coordonner l'acheminement de l'aide par les équipes agréées."
            : "بياناتكم تعامل بأقصى درجات السرية والاحترام، ولا تُستخدم إلا لتنسيق إيصال المساعدات مباشرة لعائلتكم عبر الجمعيات والفرق الميدانية المعتمدة."}
        </p>
      </div>

      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full bg-priority-critical hover:bg-priority-critical/90 text-white font-extrabold text-base shadow-md h-12 rounded-2xl"
        disabled={submitting}
      >
        {submitting ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Send className="size-5 ms-1" />
        )}
        <span>{isFr ? "Envoyer la demande d'aide d'urgence" : "إرسال طلب الإغاثة والمساعدة"}</span>
      </Button>
    </form>
  );
}
