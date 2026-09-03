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
  artisanVolunteerSchema,
  type ArtisanVolunteerInput,
} from "@/schemas/artisan-volunteer";
import { SuccessPanel } from "@/components/shared/success-panel";
import { Icon, type IconName } from "@/components/icons";
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
import { submitArtisanVolunteer } from "@/actions/artisans";
import type { AvailableLocale } from "@/i18n/locales";

const popularCrafts: { ar: string; fr: string; icon: IconName }[] = [
  { ar: "بناء وترميم جدران", fr: "Maçonnerie", icon: "building-03" },
  { ar: "دهان وطلاء", fr: "Peinture", icon: "cleaning-bucket" },
  { ar: "سباكة وترصيص صحي", fr: "Plomberie", icon: "water-energy" },
  { ar: "كهرباء معمارية", fr: "Électricité", icon: "flash" },
  { ar: "أسقف وقرميد وعزل", fr: "Toiture & Étanchéité", icon: "house-04" },
  { ar: "نجارة وأبواب ونوافذ", fr: "Menuiserie", icon: "layers-01" },
];

export function ArtisanForm({ locale = "ar" }: { locale?: AvailableLocale }) {
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
  } = useForm<ArtisanVolunteerInput>({
    resolver: zodResolver(artisanVolunteerSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      specialty: "",
      wilaya_code: "جيجل",
      commune_id: "",
      can_travel: true,
      has_own_tools: false,
      show_phone_publicly: false,
      notes: "",
    },
  });

  const selectedWilaya = watch("wilaya_code");
  const selectedSpecialty = watch("specialty");
  const canTravel = watch("can_travel");
  const hasOwnTools = watch("has_own_tools");
  const showPhonePublicly = watch("show_phone_publicly");

  async function onSubmit(values: ArtisanVolunteerInput) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitArtisanVolunteer(values);
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
          title={isFr ? "Merci pour votre engagement solidaire !" : "شكراً لمبادرتكم الحرفية النبيلة"}
          description={
            isFr
              ? "Vos informations ont été enregistrées avec succès. L'équipe de coordination vous contactera dès que des chantiers de réhabilitation nécessiteront votre expertise."
              : "تم تسجيل استعدادكم بنجاح. ستتواصل معكم خلايا التنسيق فور فتح ورشات ترميم المنازل المتضررة في منطقتكم."
          }
          primaryHref="/help/damage-assessment"
          primaryLabel={isFr ? "Voir le programme de reconstruction" : "برنامج ترميم السكنات"}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. Identity & Specialty */}
      <FormStep
        step={1}
        title={isFr ? "Informations personnelles & Métier" : "البيانات المهنية والتخصص"}
      >
        <div className="flex flex-col gap-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <FieldLabel htmlFor="ar-name">{isFr ? "Nom et prénom *" : "الاسم واللقب *"}</FieldLabel>
              <FieldInput
                id="ar-name"
                placeholder={isFr ? "Ex : Mohamed Belhadj" : "مثال: محمد بلحاج"}
                {...register("full_name")}
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-haba-red">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <FieldLabel htmlFor="ar-phone">
                {isFr ? "Numéro de téléphone *" : "رقم الهاتف للتواصل *"}
              </FieldLabel>
              <FieldPhoneInput id="ar-phone" placeholder="0555xxxxxx" {...register("phone")} />
              {errors.phone && (
                <p className="mt-1 text-xs text-haba-red">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Craft / Trade Selection Cards */}
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1.5 block text-[13px] font-semibold text-haba-ink-2">
              {isFr ? "Sélectionnez votre corps de métier :" : "اختر مهنتك أو تخصصك الحرفي :"}
            </legend>
            <div className="grid grid-cols-2 gap-2 desktop:grid-cols-3">
              {popularCrafts.map((c) => (
                <ChoiceCard
                  key={c.ar}
                  name="specialty-preset"
                  compact
                  icon={c.icon}
                  title={isFr ? c.fr : c.ar}
                  checked={selectedSpecialty === (isFr ? c.fr : c.ar)}
                  onChange={() => setValue("specialty", isFr ? c.fr : c.ar, { shouldValidate: true })}
                />
              ))}
            </div>
            <FieldInput
              aria-label={isFr ? "Autre corps de métier" : "مهنة أخرى"}
              placeholder={
                isFr
                  ? "Ou précisez un autre métier..."
                  : "أو اكتب مهنة أخرى (نجار ألمنيوم، تركيب بلاط، لحام...)"
              }
              {...register("specialty")}
            />
            {errors.specialty && (
              <p className="mt-1 text-xs text-haba-red">{errors.specialty.message}</p>
            )}
          </fieldset>

          {/* Wilaya selection */}
          <div>
            <FieldLabel htmlFor="ar-wilaya">
              {isFr ? "Wilaya de résidence ou d'intervention *" : "الولاية (مقر الإقامة أو الاستعداد للتدخل) *"}
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
              id="ar-wilaya"
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

          {/* Commune selection */}
          <div>
            <FieldLabel htmlFor="ar-commune">
              {isFr ? "Commune de présence / intervention *" : "البلدية (مكان التواجد / التدخل) *"}
            </FieldLabel>
            <CommuneSelect
              id="ar-commune"
              wilaya={selectedWilaya}
              locale={locale}
              value={watch("commune_id")}
              onChange={(e) => setValue("commune_id", e.target.value, { shouldValidate: true })}
            />
            {errors.commune_id && (
              <p className="mt-1 text-xs text-haba-red">{errors.commune_id.message}</p>
            )}
          </div>
        </div>
      </FormStep>

      {/* 2. Tools & Availability */}
      <FormStep step={2} title={isFr ? "Outils & Déplacement" : "العتاد والأدوات وجاهزية التنقل"}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            <ChoiceCard
              type="checkbox"
              showControl
              title={
                isFr
                  ? "Prêt à se déplacer dans les communes sinistrées"
                  : "الاستعداد للتنقل إلى القرى والبلديات المتضررة"
              }
              description={
                isFr
                  ? "Participer aux chantiers collectifs de réparation des toits et murs"
                  : "المشاركة في ورشات ترميم المنازل وإصلاح شبكات المياه والكهرباء"
              }
              checked={canTravel}
              onChange={(e) => setValue("can_travel", e.target.checked)}
            />

            <ChoiceCard
              type="checkbox"
              showControl
              title={
                isFr
                  ? "Dispose de son propre outillage de travail"
                  : "أملك عتادي وأدوات عملي الخاصة"
              }
              description={
                isFr
                  ? "Échelles, perceuses, outils de plomberie/peinture prêts"
                  : "سلالم، مثاقب، أدوات سباكة أو دهان جاهزة للاستخدام"
              }
              checked={hasOwnTools}
              onChange={(e) => setValue("has_own_tools", e.target.checked)}
            />
          </div>

          <div>
            <FieldLabel htmlFor="ar-notes">
              {isFr ? "Remarques (facultatif)" : "ملاحظات إضافية (اختياري)"}
            </FieldLabel>
            <FieldTextarea
              id="ar-notes"
              placeholder={
                isFr
                  ? "Créneaux de disponibilité, matériel spécifique disponible..."
                  : "أيام التفرغ، إمكانية توفير عمال مساعدين، معدات خاصة..."
              }
              {...register("notes")}
            />
          </div>
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
          <Icon name="house-04" size={20} />
        )}
        <span>{isFr ? "Confirmer mon inscription artisan" : "تأكيد تسجيل التطوع الحرفي"}</span>
      </Action>
    </form>
  );
}
