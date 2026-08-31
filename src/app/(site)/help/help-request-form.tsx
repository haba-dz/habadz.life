"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, HeartHandshake, ShieldAlert, AlertTriangle, Send, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  beneficiaryRequestSchema,
  needCategoryOptions,
  type BeneficiaryRequestInput,
} from "@/schemas/beneficiary-request";
import { SuccessPanel } from "@/components/shared/success-panel";
import { submitBeneficiaryRequest } from "@/actions/beneficiary-requests";
import { WilayaSelect } from "@/components/ui/wilaya-select";
import { CommuneSelect } from "@/components/ui/commune-select";
import { priorityWilayas } from "@/lib/algeria-cities";
import { cn } from "@/lib/utils";
import type { AvailableLocale } from "@/i18n/locales";

const categoryLabelsFr: Record<string, string> = {
  water: "Eau potable",
  food: "Nourriture & Vivres",
  clothing: "Vêtements",
  blankets: "Couvertures & Matelas",
  baby_supplies: "Articles bébés / couches",
  medical: "Médicaments / Soins urgents",
  hygiene: "Produits d'hygiène",
  kitchenware: "Ustensiles de cuisine",
  shelter: "Hébergement d'urgence",
  construction_materials: "Matériaux de réparation",
  other: "Autre besoin",
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
      family_members_count: 1,
      children_count: 0,
      housing_status: "",
      is_housing_habitable: "unknown",
      has_injuries: false,
      injuries_note: "",
      needs_medical: false,
      medical_note: "",
      lost_livestock: false,
      lost_income: false,
      needed_categories: ["food", "water", "blankets"],
      other_needs_note: "",
    },
  });

  const selectedWilaya = watch("wilaya");
  const neededCategories = watch("needed_categories");
  const hasInjuries = watch("has_injuries");
  const needsMedical = watch("needs_medical");

  function toggleCategory(value: string) {
    const current = neededCategories ?? [];
    setValue(
      "needed_categories",
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      { shouldValidate: true },
    );
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
              ? "Une erreur est survenue lors de l'enregistrement de votre demande. Veuillez réessayer."
              : "حدث خطأ أثناء تسجيل طلبك. حاول مرة أخرى."),
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError(
        isFr
          ? "Une erreur est survenue lors de l'enregistrement de votre demande. Veuillez réessayer."
          : "حدث خطأ أثناء تسجيل طلبك. حاول مرة أخرى.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="animate-rise space-y-6">
        <SuccessPanel
          title={isFr ? "Demande d'aide reçue avec succès" : "تم استلام طلب الإعانة بنجاح"}
          description={
            isFr
              ? "L'équipe de coordination examinera votre demande et vous contactera dans les plus brefs délais. Vos données sont protégées et restent strictement confidentielles."
              : "سيراجع فريق التنسيق والإغاثة طلبك ويتواصل معكم هاتفياً في أقرب وقت لتسليم المساعدات. بياناتك محمية ومشفرة ولا تُعرض للعامة إطلاقًا."
          }
          primaryHref="/map"
          primaryLabel={isFr ? "Centres d'hébergement proches" : "مراكز الإيواء والاستقبال القريبة"}
        >
          {watch("is_housing_habitable") !== "yes" && (
            <div className="rounded-2xl border border-border bg-card p-4 text-center text-xs sm:text-sm">
              {isFr ? (
                <>
                  Le logement a-t-il subi des dégradations ?{" "}
                  <Link href="/help/damage-assessment" className="font-bold text-algeria-green hover:underline">
                    Soumettez une évaluation détaillée des dégâts
                  </Link>{" "}
                  pour mobiliser des matériaux et des artisans bénévoles.
                </>
              ) : (
                <>
                  هل تضرر السكن أو احترقت أجزاء منه؟{" "}
                  <Link href="/help/damage-assessment" className="font-bold text-algeria-green hover:underline">
                    قدّم تقييمًا تفصيليًا للأضرار (مع صور)
                  </Link>{" "}
                  لتقدير مواد الترميم وربطك بورشات الحرفيين والمتطوعين.
                </>
              )}
            </div>
          )}
        </SuccessPanel>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. Contact & Location */}
      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-priority-critical/10 text-priority-critical text-sm font-extrabold">
              1
            </span>
            <h2>{isFr ? "Coordonnées & Localisation" : "بيانات التواصل والموقع"}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5">{isFr ? "Nom complet ou chef de famille *" : "الاسم الكامل أو رب الأسرة *"}</Label>
              <Input
                placeholder={isFr ? "Ex : Ahmed Mansouri" : "مثال: أحمد منصوري"}
                {...register("full_name")}
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <Label className="mb-1.5">{isFr ? "Numéro de téléphone *" : "رقم الهاتف للاتصال *"}</Label>
              <Input
                dir="ltr"
                type="tel"
                inputMode="tel"
                placeholder="0555xxxxxx"
                {...register("phone")}
              />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Wilaya *" : "الولاية *"}</Label>
            {/* Quick Priority Wilaya Buttons */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {priorityWilayas.map((pw) => {
                const active = selectedWilaya === pw.name_ar || selectedWilaya === pw.codeStr || selectedWilaya === String(pw.code);
                return (
                  <button
                    key={pw.code}
                    type="button"
                    onClick={() => {
                      setValue("wilaya", pw.name_ar, { shouldValidate: true });
                      setValue("commune", "");
                    }}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                      active
                        ? "bg-priority-critical text-white shadow-xs"
                        : "bg-priority-critical/10 text-priority-critical hover:bg-priority-critical/20"
                    )}
                  >
                    <Zap className="size-3 text-amber-500 shrink-0 fill-amber-500" />
                    <span>{isFr ? `${pw.codeStr} - ${pw.name_fr}` : `${pw.codeStr} - ${pw.name_ar}`}</span>
                  </button>
                );
              })}
            </div>

            <WilayaSelect
              locale={locale}
              value={selectedWilaya}
              onChange={(e) => {
                setValue("wilaya", e.target.value, { shouldValidate: true });
                setValue("commune", "");
              }}
            />
            {errors.wilaya && (
              <p className="mt-1 text-xs text-destructive">{errors.wilaya.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Commune *" : "البلدية *"}</Label>
            <CommuneSelect
              wilaya={selectedWilaya}
              locale={locale}
              value={watch("commune")}
              onChange={(e) => setValue("commune", e.target.value, { shouldValidate: true })}
            />
            {errors.commune && (
              <p className="mt-1 text-xs text-destructive">{errors.commune.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Village / Quartier / Repère (facultatif)" : "القرية / الحي / أقرب معلم (اختياري)"}</Label>
            <Input
              placeholder={isFr ? "Ex : Près de la mosquée Al-Nour" : "مثال: بجانب مسجد النور، قرية..."}
              {...register("address_note")}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Family Situation */}
      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-priority-critical/10 text-priority-critical text-sm font-extrabold">
              2
            </span>
            <h2>{isFr ? "Situation de la famille & du logement" : "وضع الأسرة وحالة السكن"}</h2>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5">{isFr ? "Nombre d'adultes" : "عدد أفراد الأسرة"}</Label>
              <Input
                type="number"
                min={1}
                {...register("family_members_count", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label className="mb-1.5">{isFr ? "Nombre d'enfants / bébés" : "عدد الأطفال"}</Label>
              <Input
                type="number"
                min={0}
                {...register("children_count", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 text-xs font-semibold text-muted-foreground">
              {isFr ? "Le logement est-il toujours habitable ?" : "هل السكن صالح للإقامة حاليًا ؟"}
            </Label>
            <RadioGroup
              value={watch("is_housing_habitable")}
              onValueChange={(v: string | null) =>
                v && setValue("is_housing_habitable", v as BeneficiaryRequestInput["is_housing_habitable"])
              }
              className="grid grid-cols-3 gap-2"
            >
              <label
                className={cn(
                  "flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all",
                  watch("is_housing_habitable") === "yes"
                    ? "border-algeria-green bg-algeria-green/10 text-foreground"
                    : "border-border text-muted-foreground"
                )}
              >
                <RadioGroupItem value="yes" className="sr-only" />
                <span>{isFr ? "Oui (habitable)" : "نعم صالح للإقامة"}</span>
              </label>

              <label
                className={cn(
                  "flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all",
                  watch("is_housing_habitable") === "no"
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-border text-muted-foreground"
                )}
              >
                <RadioGroupItem value="no" className="sr-only" />
                <span>{isFr ? "Non (inhabitable)" : "لا، غير صالح"}</span>
              </label>

              <label
                className={cn(
                  "flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all",
                  watch("is_housing_habitable") === "unknown"
                    ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                    : "border-border text-muted-foreground"
                )}
              >
                <RadioGroupItem value="unknown" className="sr-only" />
                <span>{isFr ? "Incertain" : "متضرر جزئيًا"}</span>
              </label>
            </RadioGroup>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/50">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <Checkbox
                checked={hasInjuries}
                onCheckedChange={(v) => setValue("has_injuries", Boolean(v))}
              />
              <span>{isFr ? "Présence de blessés ou brûlés dans la famille" : "توجد إصابات أو حروق بين أفراد الأسرة"}</span>
            </label>
            {hasInjuries && (
              <Input
                placeholder={isFr ? "Détails succincts des blessures..." : "طبيعة الإصابات وعدد المصابين..."}
                {...register("injuries_note")}
              />
            )}

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <Checkbox
                checked={needsMedical}
                onCheckedChange={(v) => setValue("needs_medical", Boolean(v))}
              />
              <span>{isFr ? "Besoin urgent de médicaments spécifiques ou soins continus" : "حاجة عاجلة لأدوية أمراض مزمنة أو حليب ورعاية"}</span>
            </label>
            {needsMedical && (
              <Input
                placeholder={isFr ? "Noms des médicaments nécessaires..." : "أسماء الأدوية المطلوبة..."}
                {...register("medical_note")}
              />
            )}

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <Checkbox
                checked={watch("lost_livestock")}
                onCheckedChange={(v) => setValue("lost_livestock", Boolean(v))}
              />
              <span>{isFr ? "Pertes de cheptel / bétail / ruches" : "فقدان أو تضرر الماشية / خلايا النحل"}</span>
            </label>
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
            <h2>{isFr ? "Besoins prioritaires de la famille" : "المساعدات العاجلة المطلوبة"}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {needCategoryOptions.map((opt) => {
              const active = neededCategories?.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-3 text-xs font-semibold transition-all cursor-pointer",
                    active
                      ? "border-algeria-green bg-algeria-green/10 text-foreground font-bold shadow-xs"
                      : "border-border bg-card/60 text-muted-foreground hover:bg-secondary/40"
                  )}
                >
                  <Checkbox
                    checked={active}
                    onCheckedChange={() => toggleCategory(opt.value)}
                  />
                  <span>{isFr ? (categoryLabelsFr[opt.value] ?? opt.label) : opt.label}</span>
                </label>
              );
            })}
          </div>

          {errors.needed_categories && (
            <p className="text-xs text-destructive">{errors.needed_categories.message}</p>
          )}

          <div>
            <Label className="mb-1.5">{isFr ? "Précisions supplémentaires (facultatif)" : "ملاحظات إضافية أو مقاسات خاصة (اختياري)"}</Label>
            <Textarea
              placeholder={
                isFr
                  ? "Ex : Âges des bébés pour les couches, régimes alimentaires..."
                  : "مثال: أعمار الرضع لمقاس الحفاظات، أمراض معينة..."
              }
              {...register("other_needs_note")}
            />
          </div>
        </CardContent>
      </Card>

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
        <span>{isFr ? "Envoyer ma demande d'aide d'urgence" : "إرسال طلب الإعانة والمساعدة"}</span>
      </Button>
    </form>
  );
}
