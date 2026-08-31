"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Hammer,
  Paintbrush,
  Wrench,
  Zap,
  Home,
  ShieldCheck,
  CheckCircle2,
  Package,
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
  artisanVolunteerSchema,
  type ArtisanVolunteerInput,
} from "@/schemas/artisan-volunteer";
import { SuccessPanel } from "@/components/shared/success-panel";
import { submitArtisanVolunteer } from "@/actions/artisans";
import type { AvailableLocale } from "@/i18n/locales";

const popularCrafts = [
  { ar: "بناء وترميم جدران", fr: "Maçonnerie", icon: Hammer },
  { ar: "دهان وطلاء", fr: "Peinture", icon: Paintbrush },
  { ar: "سباكة وترصيص صحي", fr: "Plomberie", icon: Wrench },
  { ar: "كهرباء معمارية", fr: "Électricité", icon: Zap },
  { ar: "أسقف وقرميد وعزل", fr: "Toiture & Étanchéité", icon: Home },
  { ar: "نجارة وأبواب ونوافذ", fr: "Menuiserie", icon: Package },
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
      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-extrabold">
              1
            </span>
            <h2>{isFr ? "Informations personnelles & Métier" : "البيانات المهنية والتخصص"}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5">{isFr ? "Nom et prénom *" : "الاسم واللقب *"}</Label>
              <Input
                placeholder={isFr ? "Ex : Mohamed Belhadj" : "مثال: محمد بلحاج"}
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

          {/* Craft / Trade Selection Cards */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              {isFr ? "Sélectionnez votre corps de métier :" : "اختر مهنتك أو تخصصك الحرفي :"}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {popularCrafts.map((c) => {
                const isSelected = selectedSpecialty === (isFr ? c.fr : c.ar);
                const Icon = c.icon;
                return (
                  <button
                    key={c.ar}
                    type="button"
                    onClick={() => setValue("specialty", isFr ? c.fr : c.ar, { shouldValidate: true })}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl border text-start transition-all cursor-pointer",
                      isSelected
                        ? "border-orange-500 bg-orange-500/10 text-foreground font-bold shadow-xs"
                        : "border-border bg-card/60 text-muted-foreground hover:bg-secondary/40"
                    )}
                  >
                    <Icon className="size-4 text-orange-600 dark:text-orange-400 shrink-0" />
                    <span className="text-xs leading-snug">{isFr ? c.fr : c.ar}</span>
                  </button>
                );
              })}
            </div>
            <Input
              placeholder={
                isFr
                  ? "Ou précisez un autre métier..."
                  : "أو اكتب مهنة أخرى (نجار ألمنيوم، تركيب بلاط، لحام...)"
              }
              {...register("specialty")}
            />
            {errors.specialty && (
              <p className="mt-1 text-xs text-destructive">{errors.specialty.message}</p>
            )}
          </div>

          {/* Wilaya selection */}
          <div>
            <Label className="mb-1.5">{isFr ? "Wilaya de résidence ou d'intervention *" : "الولاية (مقر الإقامة أو الاستعداد للتدخل) *"}</Label>
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
            <Label className="mb-1.5">{isFr ? "Commune de présence / intervention *" : "البلدية (مكان التواجد / التدخل) *"}</Label>
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
        </CardContent>
      </Card>

      {/* 2. Tools & Availability */}
      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-extrabold">
              2
            </span>
            <h2>{isFr ? "Outils & Déplacement" : "العتاد والأدوات وجاهزية التنقل"}</h2>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-card/60 cursor-pointer hover:bg-secondary/40 transition-colors">
              <Checkbox
                checked={canTravel}
                onCheckedChange={(v) => setValue("can_travel", Boolean(v))}
                className="mt-0.5"
              />
              <div className="space-y-0.5 text-start">
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {isFr ? "Prêt à se déplacer dans les communes sinistrées" : "الاستعداد للتنقل إلى القرى والبلديات المتضررة"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isFr
                    ? "Participer aux chantiers collectifs de réparation des toits et murs"
                    : "المشاركة في ورشات ترميم المنازل وإصلاح شبكات المياه والكهرباء"}
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-card/60 cursor-pointer hover:bg-secondary/40 transition-colors">
              <Checkbox
                checked={hasOwnTools}
                onCheckedChange={(v) => setValue("has_own_tools", Boolean(v))}
                className="mt-0.5"
              />
              <div className="space-y-0.5 text-start">
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {isFr ? "Dispose de son propre outillage de travail" : "أملك عتادي وأدوات عملي الخاصة"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isFr
                    ? "Échelles, perceuses, outils de plomberie/peinture prêts"
                    : "سلالم، مثاقب، أدوات سباكة أو دهان جاهزة للاستخدام"}
                </p>
              </div>
            </label>
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Remarques (facultatif)" : "ملاحظات إضافية (اختياري)"}</Label>
            <Textarea
              placeholder={
                isFr
                  ? "Créneaux de disponibilité, matériel spécifique disponible..."
                  : "أيام التفرغ، إمكانية توفير عمال مساعدين، معدات خاصة..."
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
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-base shadow-md h-12 rounded-2xl"
        disabled={submitting}
      >
        {submitting ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Hammer className="size-5 ms-1" />
        )}
        <span>{isFr ? "Confirmer mon inscription artisan" : "تأكيد تسجيل التطوع الحرفي"}</span>
      </Button>
    </form>
  );
}
