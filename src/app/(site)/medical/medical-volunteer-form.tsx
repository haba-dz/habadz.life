"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Stethoscope,
  Phone,
  HeartHandshake,
  Activity,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Zap,
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
import { priorityWilayas } from "@/lib/algeria-cities";
import { cn } from "@/lib/utils";
import {
  medicalVolunteerSchema,
  type MedicalVolunteerInput,
} from "@/schemas/medical-volunteer";
import { SuccessPanel } from "@/components/shared/success-panel";
import { submitMedicalVolunteer } from "@/actions/medical";
import type { AvailableLocale } from "@/i18n/locales";

const popularSpecialties = [
  { ar: "طب بشري عام", fr: "Médecine générale" },
  { ar: "طب استعجالي وكوارث", fr: "Urgences & Réanimation" },
  { ar: "طب بيطري (مواشي وحيوانات)", fr: "Médecine vétérinaire" },
  { ar: "تمريض وإسعافات", fr: "Soins infirmiers" },
  { ar: "جراحة عامة / حروق", fr: "Chirurgie / Brûlures" },
  { ar: "دعم نفسي وصدمات", fr: "Soutien psychologique" },
];

export function MedicalVolunteerForm({
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
  } = useForm<MedicalVolunteerInput>({
    resolver: zodResolver(medicalVolunteerSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      specialty: "",
      license_number: "",
      wilaya_code: "جيجل",
      commune_id: "",
      current_workplace: "",
      can_field_intervene: true,
      can_teleconsult: false,
      has_emergency_kit: false,
      show_phone_publicly: false,
      notes: "",
    },
  });

  const selectedWilaya = watch("wilaya_code");
  const selectedSpecialty = watch("specialty");
  const canFieldIntervene = watch("can_field_intervene");
  const canTeleconsult = watch("can_teleconsult");
  const hasEmergencyKit = watch("has_emergency_kit");
  const showPhonePublicly = watch("show_phone_publicly");

  async function onSubmit(values: MedicalVolunteerInput) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitMedicalVolunteer(values);
      if (!res.success) {
        setSubmitError(
          res.message ??
            (isFr
              ? "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
              : "حدث خطأ أثناء تسجيل بياناتك. حاول مرة أخرى.")
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError(
        isFr
          ? "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
          : "حدث خطأ أثناء تسجيل بياناتك. حاول مرة أخرى."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="animate-rise space-y-6">
        <SuccessPanel
          title={isFr ? "Merci pour votre engagement humanitaire" : "شكراً لمبادرتكم الإنسانية والمهنية"}
          description={
            isFr
              ? "Vos coordonnées ont été enregistrées avec succès. La cellule de coordination médicale vous contactera en cas de besoin."
              : "تم تسجيل بياناتكم بنجاح في قاعدة المتطوعين الصحيين والبيطريين. ستتواصل معكم خلية التنسيق عند الحاجة لتدخل أو استشارة."
          }
          primaryHref="/medical"
          primaryLabel={isFr ? "Voir la liste des médecins" : "عرض دليل الكوادر الطبية"}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. Identity & Specialty */}
      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-extrabold">
              1
            </span>
            <h2>{isFr ? "Informations professionnelles & Personnelles" : "البيانات المهنية والشخصية"}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5">{isFr ? "Nom et prénom *" : "الاسم واللقب *"}</Label>
              <Input
                placeholder={isFr ? "Dr. Mohamed Belhadj" : "د. محمد بلحاج"}
                {...register("full_name")}
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <Label className="mb-1.5">{isFr ? "Numéro de téléphone *" : "رقم الهاتف للتواصل *"}</Label>
              <Input dir="ltr" placeholder="0555xxxxxx" {...register("phone")} />
              {errors.phone && (
                <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Specialty Quick Selection Pills */}
          <div>
            <Label className="mb-1.5">{isFr ? "Spécialité médicale ou vétérinaire *" : "التخصص الطبي أو البيطري *"}</Label>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {popularSpecialties.map((s) => {
                const isSelected = selectedSpecialty === (isFr ? s.fr : s.ar);
                return (
                  <button
                    key={s.ar}
                    type="button"
                    onClick={() => setValue("specialty", isFr ? s.fr : s.ar, { shouldValidate: true })}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                      isSelected
                        ? "bg-emerald-600 text-white shadow-xs font-bold"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                    )}
                  >
                    {isFr ? s.fr : s.ar}
                  </button>
                );
              })}
            </div>
            <Input
              placeholder={
                isFr
                  ? "Ou précisez votre spécialité..."
                  : "أو اكتب تخصصك بالتحديد (طب عام، جراحة، صيدلة، بيطرة...)"
              }
              {...register("specialty")}
            />
            {errors.specialty && (
              <p className="mt-1 text-xs text-destructive">{errors.specialty.message}</p>
            )}
          </div>

          {/* Wilaya selection */}
          <div>
            <Label className="mb-1.5">{isFr ? "Wilaya d'exercice ou de résidence *" : "الولاية (مقر الإقامة أو الممارسة) *"}</Label>
            {/* Quick Priority Wilaya Buttons */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {priorityWilayas.map((pw) => {
                const active =
                  selectedWilaya === pw.name_ar || selectedWilaya === pw.codeStr || selectedWilaya === String(pw.code);
                return (
                  <button
                    key={pw.code}
                    type="button"
                    onClick={() => {
                      setValue("wilaya_code", pw.name_ar, { shouldValidate: true });
                      setValue("commune_id", "");
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
                setValue("wilaya_code", e.target.value, { shouldValidate: true });
                setValue("commune_id", "");
              }}
            />
            {errors.wilaya_code && (
              <p className="mt-1 text-xs text-destructive">{errors.wilaya_code.message}</p>
            )}
          </div>

          {/* Commune selection */}
          <div>
            <Label className="mb-1.5">{isFr ? "Commune de résidence / intervention *" : "البلدية (مكان التواجد / التدخل) *"}</Label>
            <CommuneSelect
              wilaya={selectedWilaya}
              locale={locale}
              value={watch("commune_id")}
              onChange={(e) => setValue("commune_id", e.target.value, { shouldValidate: true })}
            />
            {errors.commune_id && (
              <p className="mt-1 text-xs text-destructive">{errors.commune_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5">{isFr ? "Lieu d'exercice actuel (facultatif)" : "مقر العمل أو الممارسة (اختياري)"}</Label>
              <Input
                placeholder={isFr ? "Hôpital, cabinet privé, clinique..." : "مستشفى، عيادة خاصة، حر..."}
                {...register("current_workplace")}
              />
            </div>
            <div>
              <Label className="mb-1.5">{isFr ? "N° d'agrément / carte pro (facultatif)" : "رقم الاعتماد أو بطاقة المهنة (اختياري)"}</Label>
              <Input
                placeholder={isFr ? "Optionnel" : "اختياري"}
                {...register("license_number")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Availability & Intervention Modes */}
      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-extrabold">
              2
            </span>
            <h2>{isFr ? "Modalités d'intervention" : "طرق ومجالات الاستعداد"}</h2>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-card/60 cursor-pointer hover:bg-secondary/40 transition-colors">
              <Checkbox
                checked={canFieldIntervene}
                onCheckedChange={(v) => setValue("can_field_intervene", Boolean(v))}
                className="mt-0.5"
              />
              <div className="space-y-0.5 text-start">
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {isFr ? "Intervention directe sur le terrain" : "الاستعداد للتنقل والتدخل الميداني"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isFr
                    ? "Consultations dans les centres d'hébergement ou auprès des cheptels"
                    : "فحص العائلات في مراكز الإيواء أو تفقد الماشية والحيوانات المتضررة"}
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-card/60 cursor-pointer hover:bg-secondary/40 transition-colors">
              <Checkbox
                checked={canTeleconsult}
                onCheckedChange={(v) => setValue("can_teleconsult", Boolean(v))}
                className="mt-0.5"
              />
              <div className="space-y-0.5 text-start">
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {isFr ? "Téléconsultation et orientation par téléphone" : "تقديم استشارات هاتفية وتوجيه أولي عن بُعد"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isFr
                    ? "Répondre aux questions urgentes des familles et des secouristes"
                    : "الإجابة على الاستفسارات الصحية والبيطرية العاجلة"}
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-card/60 cursor-pointer hover:bg-secondary/40 transition-colors">
              <Checkbox
                checked={hasEmergencyKit}
                onCheckedChange={(v) => setValue("has_emergency_kit", Boolean(v))}
                className="mt-0.5"
              />
              <div className="space-y-0.5 text-start">
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {isFr ? "Disponibilité d'une trousse d'urgence ou matériel mobile" : "حيازة حقيبة إسعافات أولية أو أدوية ومعدات متنقلة"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isFr
                    ? "Matériel de premiers secours prêt à l'emploi"
                    : "مواد ضماد، مطهرات، أو أدوات فحص جاهزة للاستعمال"}
                </p>
              </div>
            </label>
          </div>

          {/* Public Phone Privacy Control */}
          <div className="pt-2 border-t border-border/50">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <Checkbox
                checked={showPhonePublicly}
                onCheckedChange={(v) => setValue("show_phone_publicly", Boolean(v))}
              />
              <span>
                {isFr
                  ? "Afficher mon numéro dans l'annuaire public des médecins bénévoles du site"
                  : "إظهار رقم هاتفي في الدليل المفتوح للأطباء والبياطرة المتطوعين بالمنصة"}
              </span>
            </label>
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Remarques (facultatif)" : "ملاحظات إضافية (اختياري)"}</Label>
            <Textarea
              placeholder={
                isFr
                  ? "Créneaux de disponibilité, expérience particulière..."
                  : "أي تفاصيل أخرى (أوقات التوفر، خبرة خاصة في الحروق أو الطوارئ...)"
              }
              {...register("notes")}
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
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-md h-12 rounded-2xl"
        disabled={submitting}
      >
        {submitting ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Activity className="size-5 ms-1" />
        )}
        <span>{isFr ? "Confirmer mon inscription médicale bénévole" : "تأكيد تسجيل التطوع الطبي / البيطري"}</span>
      </Button>
    </form>
  );
}
