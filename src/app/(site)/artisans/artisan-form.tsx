"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { artisanVolunteerSchema, type ArtisanVolunteerInput } from "@/schemas/artisan-volunteer";
import { SuccessPanel } from "@/components/shared/success-panel";
import { submitArtisanVolunteer } from "@/actions/artisans";
import type { AvailableLocale } from "@/i18n/locales";

export function ArtisanForm({
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
  } = useForm<ArtisanVolunteerInput>({
    resolver: zodResolver(artisanVolunteerSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      specialty: "",
      wilaya_code: "18",
      commune_id: "",
      can_travel: true,
      has_own_tools: false,
      show_phone_publicly: false,
      notes: "",
    },
  });

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
              : "حدث خطأ أثناء تسجيل بياناتك. حاول مرة أخرى."),
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError(
        isFr
          ? "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
          : "حدث خطأ أثناء تسجيل بياناتك. حاول مرة أخرى.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <SuccessPanel
        title={isFr ? "Merci pour votre engagement humanitaire" : "شكراً لمبادرتكم الإنسانية"}
        description={
          isFr
            ? "Vos coordonnées ont été enregistrées avec succès. La cellule de coordination vous contactera dès qu'un chantier correspond à votre spécialité."
            : "تم تسجيل بياناتكم بنجاح. ستتواصل معكم خلية التنسيق عند وجود أعمال ترميم تحتاج تخصصكم."
        }
        primaryHref="/"
        primaryLabel={isFr ? "Retour à l'accueil" : "العودة للرئيسية"}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <h2 className="font-bold">{isFr ? "Informations professionnelles et personnelles" : "المعلومات المهنية والشخصية"}</h2>

          <div>
            <Label className="mb-1.5">{isFr ? "Nom et prénom *" : "الاسم واللقب *"}</Label>
            <Input placeholder={isFr ? "Mohamed Belhadj" : "محمد بلحاج"} {...register("full_name")} />
            {errors.full_name && (
              <p className="mt-1 text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Numéro de téléphone *" : "رقم الهاتف *"}</Label>
            <Input dir="ltr" placeholder="0555xxxxxx" {...register("phone")} />
            {errors.phone && (
              <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Spécialité artisanale *" : "التخصص الحرفي *"}</Label>
            <Input
              placeholder={isFr ? "Peinture, maçonnerie, plomberie, électricité..." : "دهان، بناء، سباك، كهربائي..."}
              {...register("specialty")}
            />
            {errors.specialty && (
              <p className="mt-1 text-sm text-destructive">{errors.specialty.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Commune ou lieu de résidence *" : "البلدية أو مكان التواجد *"}</Label>
            <Input
              placeholder={isFr ? "Ex: Jijel, Taher, El Milia, Chekfa..." : "مثال: جيجل، تاكسنة، الميلية، الشقفة..."}
              {...register("commune_id")}
            />
            {errors.commune_id && (
              <p className="mt-1 text-sm text-destructive">{errors.commune_id.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <h2 className="font-bold">{isFr ? "Disponibilité et domaines d'intervention" : "مجالات التطوع والاستعداد"}</h2>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={canTravel}
              onCheckedChange={(v) => setValue("can_travel", Boolean(v))}
            />
            {isFr ? "Prêt à se déplacer vers d'autres zones sinistrées" : "الاستعداد للتنقل إلى المناطق المتضررة الأخرى"}
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={hasOwnTools}
              onCheckedChange={(v) => setValue("has_own_tools", Boolean(v))}
            />
            {isFr ? "Dispose de son propre outillage" : "حيازة أدوات العمل الخاصة"}
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={showPhonePublicly}
              onCheckedChange={(v) => setValue("show_phone_publicly", Boolean(v))}
            />
            {isFr
              ? "J'accepte la publication de mon numéro de téléphone dans l'annuaire après vérification"
              : "أوافق على نشر رقم هاتفي للعموم في قائمة الحرفيين بعد التحقق من انضمامي"}
          </label>

          <div>
            <Label className="mb-1.5">{isFr ? "Remarques (disponibilités...)" : "ملاحظات إضافية (أوقات التوفر...)"}</Label>
            <Textarea
              placeholder={isFr ? "Précisions utiles pour l'équipe de coordination..." : "أي تفاصيل تساعد فريق التنسيق..."}
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

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="size-4 animate-spin" />}
        {isFr ? "Confirmer l'inscription" : "تأكيد تسجيل التطوع"}
      </Button>
    </form>
  );
}
