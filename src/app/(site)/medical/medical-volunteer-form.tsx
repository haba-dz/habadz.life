"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  } from "lucide-react";
import { WilayaSelect } from "@/components/ui/wilaya-select";
import { CommuneSelect } from "@/components/ui/commune-select";
import { priorityWilayas } from "@/lib/algeria-cities";
import { cn } from "@/lib/utils";
import {
  medicalVolunteerSchema,
  type MedicalVolunteerInput,
} from "@/schemas/medical-volunteer";
import { SuccessPanel } from "@/components/shared/success-panel";
import { Icon } from "@/components/icons";
import {
  Action,
  ChoiceCard,
  FieldInput,
  FieldLabel,
  FieldPhoneInput,
  FieldTextarea,
  FormStep,
  FOCUS_RING,
} from "@/components/site";
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
      <FormStep
        step={1}
        title={isFr ? "Informations professionnelles & Personnelles" : "البيانات المهنية والشخصية"}
      >
        <div className="flex flex-col gap-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <FieldLabel htmlFor="md-name">{isFr ? "Nom et prénom *" : "الاسم واللقب *"}</FieldLabel>
              <FieldInput
                id="md-name"
                placeholder={isFr ? "Dr. Mohamed Belhadj" : "د. محمد بلحاج"}
                {...register("full_name")}
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-haba-red">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <FieldLabel htmlFor="md-phone">
                {isFr ? "Numéro de téléphone *" : "رقم الهاتف للتواصل *"}
              </FieldLabel>
              <FieldPhoneInput id="md-phone" placeholder="0555xxxxxx" {...register("phone")} />
              {errors.phone && (
                <p className="mt-1 text-xs text-haba-red">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Specialty Quick Selection Pills */}
          <div>
            <FieldLabel htmlFor="md-specialty">
              {isFr ? "Spécialité médicale ou vétérinaire *" : "التخصص الطبي أو البيطري *"}
            </FieldLabel>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {popularSpecialties.map((s) => {
                const isSelected = selectedSpecialty === (isFr ? s.fr : s.ar);
                return (
                  <button
                    key={s.ar}
                    type="button"
                    onClick={() => setValue("specialty", isFr ? s.fr : s.ar, { shouldValidate: true })}
                    className={cn(
                      "border px-2.5 py-1 text-xs font-semibold transition-colors",
                      isSelected
                        ? "border-haba-green bg-haba-green font-bold text-white"
                        : "border-haba-green bg-haba-green-tint text-haba-green hover:bg-haba-green-50",
                      FOCUS_RING,
                    )}
                  >
                    {isFr ? s.fr : s.ar}
                  </button>
                );
              })}
            </div>
            <FieldInput
              id="md-specialty"
              placeholder={
                isFr
                  ? "Ou précisez votre spécialité..."
                  : "أو اكتب تخصصك بالتحديد (طب عام، جراحة، صيدلة، بيطرة...)"
              }
              {...register("specialty")}
            />
            {errors.specialty && (
              <p className="mt-1 text-xs text-haba-red">{errors.specialty.message}</p>
            )}
          </div>

          {/* Wilaya selection */}
          <div>
            <FieldLabel htmlFor="md-wilaya">
              {isFr ? "Wilaya d'exercice ou de résidence *" : "الولاية (مقر الإقامة أو الممارسة) *"}
            </FieldLabel>
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
                      "inline-flex items-center gap-1 border px-2.5 py-1 text-xs font-bold transition-colors",
                      active
                        ? "border-haba-red bg-haba-red text-white"
                        : "border-haba-red-200 bg-haba-red-50 text-haba-red hover:border-haba-red",
                      FOCUS_RING,
                    )}
                  >
                    <Icon name="fire" size={12} className="shrink-0" />
                    <span>{isFr ? `${pw.codeStr} - ${pw.name_fr}` : `${pw.codeStr} - ${pw.name_ar}`}</span>
                  </button>
                );
              })}
            </div>

            <WilayaSelect
              id="md-wilaya"
              locale={locale}
              value={selectedWilaya}
              onChange={(e) => {
                setValue("wilaya_code", e.target.value, { shouldValidate: true });
                setValue("commune_id", "");
              }}
            />
            {errors.wilaya_code && (
              <p className="mt-1 text-xs text-haba-red">{errors.wilaya_code.message}</p>
            )}
          </div>

          {/* Commune selection (Optional) */}
          <div>
            <FieldLabel htmlFor="md-commune">
              {isFr ? "Commune (facultatif)" : "البلدية / الدائرة (اختياري)"}
            </FieldLabel>
            <CommuneSelect
              id="md-commune"
              wilaya={selectedWilaya}
              locale={locale}
              value={watch("commune_id")}
              onChange={(e) => setValue("commune_id", e.target.value, { shouldValidate: true })}
            />
            {errors.commune_id && (
              <p className="mt-1 text-xs text-haba-red">{errors.commune_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <FieldLabel htmlFor="md-workplace">
                {isFr ? "Lieu d'exercice actuel (facultatif)" : "مقر العمل أو الممارسة (اختياري)"}
              </FieldLabel>
              <FieldInput
                id="md-workplace"
                placeholder={isFr ? "Hôpital, cabinet privé, clinique..." : "مستشفى، عيادة خاصة، حر..."}
                {...register("current_workplace")}
              />
            </div>
            <div>
              <FieldLabel htmlFor="md-licence">
                {isFr ? "N° d'agrément / carte pro (facultatif)" : "رقم الاعتماد أو بطاقة المهنة (اختياري)"}
              </FieldLabel>
              <FieldInput
                id="md-licence"
                placeholder={isFr ? "Optionnel" : "اختياري"}
                {...register("license_number")}
              />
            </div>
          </div>
        </div>
      </FormStep>

      {/* 2. Availability & Intervention Modes */}
      <FormStep step={2} title={isFr ? "Modalités d'intervention" : "طرق ومجالات الاستعداد"}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            <ChoiceCard
              type="checkbox"
              showControl
              title={isFr ? "Intervention directe sur le terrain" : "الاستعداد للتنقل والتدخل الميداني"}
              description={
                isFr
                  ? "Consultations dans les centres d'hébergement ou auprès des cheptels"
                  : "فحص العائلات في مراكز الإيواء أو تفقد الماشية والحيوانات المتضررة"
              }
              checked={canFieldIntervene}
              onChange={(e) => setValue("can_field_intervene", e.target.checked)}
            />

            <ChoiceCard
              type="checkbox"
              showControl
              title={isFr ? "Téléconsultation et orientation par téléphone" : "تقديم استشارات هاتفية وتوجيه أولي عن بُعد"}
              description={
                isFr
                  ? "Répondre aux questions urgentes des familles et des secouristes"
                  : "الإجابة على الاستفسارات الصحية والبيطرية العاجلة"
              }
              checked={canTeleconsult}
              onChange={(e) => setValue("can_teleconsult", e.target.checked)}
            />

            <ChoiceCard
              type="checkbox"
              showControl
              title={isFr ? "Disponibilité d'une trousse d'urgence ou matériel mobile" : "حيازة حقيبة إسعافات أولية أو أدوية ومعدات متنقلة"}
              description={
                isFr
                  ? "Matériel de premiers secours prêt à l'emploi"
                  : "مواد ضماد، مطهرات، أو أدوات فحص جاهزة للاستعمال"
              }
              checked={hasEmergencyKit}
              onChange={(e) => setValue("has_emergency_kit", e.target.checked)}
            />
          </div>

          <div>
            <FieldLabel htmlFor="md-notes">
              {isFr ? "Remarques (facultatif)" : "ملاحظات إضافية (اختياري)"}
            </FieldLabel>
            <FieldTextarea
              id="md-notes"
              placeholder={
                isFr
                  ? "Créneaux de disponibilité, expérience particulière..."
                  : "أي تفاصيل أخرى (أوقات التوفر، خبرة خاصة في الحروق أو الطوارئ...)"
              }
              {...register("notes")}
            />
          </div>
        </div>
      </FormStep>

      {/* 3. Visibility & Privacy Decision */}
      <FormStep
        step={3}
        title={isFr ? "Option de visibilité dans l'annuaire" : "خيارات الظهور في الدليل العام للمنصة"}
      >
        <div className="flex flex-col gap-4">

          <p className="text-[13px] leading-relaxed text-haba-ink-2">
            {isFr
              ? "Veuillez choisir si vous souhaitez être répertorié dans l'annuaire public du site ou uniquement pour la coordination interne :"
              : "يرجى تحديد رغبتك: هل ترغب بنشر بياناتك وتخصصك في الدليل المفتوح للمواطنين، أم للاستعمال الداخلي لفرق الإغاثة فقط؟"}
          </p>

          <fieldset className="grid grid-cols-1 gap-3 pt-1 desktop:grid-cols-2">
            <legend className="sr-only">
              {isFr ? "Visibilité de vos coordonnées" : "مدى ظهور بياناتك"}
            </legend>

            <ChoiceCard
              name="show_phone_publicly"
              icon="call-02"
              title={isFr ? "Oui, publier dans l'annuaire" : "نعم، النشر في الدليل العام"}
              description={
                isFr
                  ? "Mon nom, spécialité et numéro seront visibles par les citoyens pour des téléconsultations directes."
                  : "يظهر اسمي وتخصصي ورقم هاتفي في الدليل المفتوح ليتمكن المتضررون والمواطنون من الاتصال بي للاستشارة الطبية."
              }
              className="items-start"
              checked={showPhonePublicly}
              onChange={() => setValue("show_phone_publicly", true, { shouldValidate: true })}
            />

            <ChoiceCard
              name="show_phone_publicly"
              icon="shield-01"
              title={
                isFr
                  ? "Non, coordination interne uniquement"
                  : "لا، للتنسيق الداخلي فقط (سري)"
              }
              description={
                isFr
                  ? "Mes coordonnées restent strictement confidentielles et ne seront utilisées que par les équipes de secours et la cellule de crise."
                  : "تبقى بياناتي سرية تماماً لدى إدارة المنصة وتتواصل معي خلايا الإغاثة ولجان الطوارئ حصراً دون نشر رقمي."
              }
              className="items-start"
              checked={!showPhonePublicly}
              onChange={() => setValue("show_phone_publicly", false, { shouldValidate: true })}
            />
          </fieldset>
        </div>
      </FormStep>

      {submitError && (
        <p
          role="alert"
          className="border border-haba-red bg-haba-red-50 p-4 text-sm font-semibold text-haba-red"
        >
          {submitError}
        </p>
      )}

      <Action type="submit" variant="primary" size="submit" disabled={submitting}>
        {submitting ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Icon name="stethoscope" size={20} />
        )}
        <span>{isFr ? "Confirmer mon inscription médicale bénévole" : "تأكيد تسجيل التطوع الطبي / البيطري"}</span>
      </Action>
    </form>
  );
}
