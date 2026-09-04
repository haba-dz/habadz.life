"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  MapPin,
  Clock,
  CircleCheck,
  Gift,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Action, Chip, ChoiceCard, CommuneSelect, FormStep, WilayaSelect } from "@/components/site";
import { Icon } from "@/components/icons";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { PointStatusBadge } from "@/components/shared/status-badge";
import { donationSchema, unitOptions, type DonationInput } from "@/schemas/donation";
import { formatQuantity, getUnitLabel, getCategoryLabel } from "@/lib/constants";
import { CategoryIcon } from "@/components/shared/category-icon";
import { priorityWilayas } from "@/lib/algeria-cities";
import { SuccessPanel } from "@/components/shared/success-panel";
import { submitDonation, type SubmitDonationResult } from "@/actions/donations";
import type { Database } from "@/types/database";
import type { AvailableLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export function DonationForm({
  categories,
  defaultCategorySlug,
  locale = "ar",
}: {
  categories: Category[];
  defaultCategorySlug?: string;
  locale?: AvailableLocale;
}) {
  const isFr = locale === "fr";
  const [result, setResult] = useState<SubmitDonationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultCategory = categories.find((c) => c.slug === defaultCategorySlug) ?? categories[0];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DonationInput>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donor_name: "",
      donor_phone: "",
      current_wilaya: "جيجل",
      current_commune: "",
      needs_transport: false,
      can_deliver_self: true,
      notes: "",
      items: defaultCategory
        ? [
            {
              category_id: defaultCategory.id,
              category_slug: defaultCategory.slug,
              quantity: 1,
              unit: defaultCategory.default_unit,
              description: "",
            },
          ]
        : [],
    },
  });

  const selectedWilaya = watch("current_wilaya");
  const needsTransport = watch("needs_transport");
  const canDeliverSelf = watch("can_deliver_self");

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  async function onSubmit(values: DonationInput) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const itemsWithSlug = values.items.map((it) => ({
        ...it,
        category_slug: categories.find((c) => c.id === it.category_id)?.slug ?? "",
      }));
      const res = await submitDonation({ ...values, items: itemsWithSlug });
      if (!res.success) {
        setSubmitError(
          res.error ??
            (isFr
              ? "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
              : "حدث خطأ أثناء تسجيل المساعدة. حاول مرة أخرى.")
        );
        return;
      }
      setResult(res);
    } catch {
      setSubmitError(
        isFr
          ? "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
          : "حدث خطأ أثناء تسجيل المساعدة. حاول مرة أخرى."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.success) {
    return (
      <div className="animate-rise space-y-6">
        <SuccessPanel
          title={isFr ? "Votre don a été enregistré avec succès" : "تم تسجيل مساعدتك بنجاح"}
          description={
            isFr
              ? "Merci pour votre contribution. L'équipe de coordination vous contactera bientôt. Ci-dessous, le besoin correspondant et le point de collecte recommandé."
              : "شكرًا لك وبورك في عطائك. سيتواصل فريق التنسيق معك قريبًا لتأكيد التفاصيل. في الأسفل أقرب احتياج مطابق ونقطة التسليم المقترحة."
          }
          primaryHref="/map"
          primaryLabel={isFr ? "Voir les points de dépôt sur la carte" : "عرض نقاط التسليم على الخريطة"}
        />

        {result.matches && result.matches.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Gift className="size-5 text-algeria-green" />
              <span>{isFr ? "Meilleures correspondances pour vos dons" : "أفضل تطابق ميداني لمساعدتك"}</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {result.matches.map((m) => (
                <Card key={m.need.id} className="border-border">
                  <CardContent className="flex items-start justify-between gap-3 p-4">
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                        <CategoryIcon slug={m.categorySlug} className="size-4 text-algeria-green" />
                        <span>
                          {m.need.title ?? categories.find((c) => c.slug === m.categorySlug)?.name_ar ?? m.categorySlug}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.need.commune}، {isFr ? `Wilaya de ${m.need.wilaya}` : `ولاية ${m.need.wilaya}`}
                      </p>
                      <p className="text-xs pt-1">
                        {isFr ? "Manque estimé : " : "الخصاص المسجل: "}
                        <strong className="text-priority-critical font-bold">
                          {formatQuantity(m.deficit, locale)} {getUnitLabel(m.need.unit, locale)}
                        </strong>
                      </p>
                    </div>
                    <PriorityBadge priority={m.need.priority} locale={locale} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {result.suggestedPoints && result.suggestedPoints.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <MapPin className="size-5 text-haba-green" />
              <span>{isFr ? "Points de dépôt recommandés" : "نقاط التسليم المعتمدة المقترحة"}</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {result.suggestedPoints.map((p) => (
                <Card key={p.id} className="border-border">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm sm:text-base text-foreground">{p.name}</p>
                      <PointStatusBadge status={p.status} />
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      <span>
                        {p.address ?? `${p.commune}، ${isFr ? `Wilaya de ${p.wilaya}` : `ولاية ${p.wilaya}`}`}
                      </span>
                      {p.distanceKm !== null && (
                        <span className="font-semibold text-foreground">
                          {isFr
                            ? ` (~${formatQuantity(p.distanceKm, locale)} km)`
                            : ` (تبعد ~${formatQuantity(p.distanceKm, locale)} كم)`}
                        </span>
                      )}
                    </p>
                    {p.openingHours && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3.5 shrink-0" />
                        <span>{p.openingHours}</span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(!result.matches || result.matches.length === 0) && (
          <Alert className="border-algeria-green/40 bg-algeria-green/5">
            <AlertTitle className="flex items-center gap-2 text-algeria-green font-bold">
              <CircleCheck className="size-4" />
              <span>{isFr ? "Don enregistré avec succès" : "تم تسجيل نوع المساعدة بنجاح"}</span>
            </AlertTitle>
            <AlertDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
              {isFr
                ? "L'équipe de coordination orientera votre don vers le point de collecte ou l'association la plus appropriée."
                : "سيراجع فريق التنسيق تسجيلك ويوجّهه لأقرب مركز إغاثة محتاج، لضمان وصول المساعدات بالعدل ودون تكدس."}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. Donation Items */}
      <FormStep
        step={1}
        title={isFr ? "Articles & dons disponibles" : "المواد والمساعدات المتوفرة لديك"}
        caption={`${fields.length} ${isFr ? "article(s) enregistré(s)" : "مادة مسجَّلة حتى الآن"}`}
      >
        <div className="space-y-3.5">

          {fields.map((field, index) => {
            const categoryId = watch(`items.${index}.category_id`);
            const quantity = watch(`items.${index}.quantity`) || 1;

            return (
              <div
                key={field.id}
                className="space-y-3 border border-border/80 bg-background/50 p-3.5 sm:p-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-foreground">
                    <Gift className="size-3.5 text-algeria-green" />
                    <span>{isFr ? `Article #${index + 1}` : `المادة #${index + 1}`}</span>
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => remove(index)}
                      className="text-destructive hover:bg-destructive/10"
                      aria-label={isFr ? "Supprimer cet article" : "حذف هذه المادة"}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>

                {/* Category Selector */}
                <div>
                  <Label
                    id={`item-${index}-category-label`}
                    className="mb-1.5 text-xs font-semibold text-muted-foreground"
                  >
                    {isFr ? "Type d'aide / Catégorie *" : "نوع المادة أو المساعدة *"}
                  </Label>
                  <Select
                    value={categoryId}
                    onValueChange={(v: string | null) => {
                      if (!v) return;
                      setValue(`items.${index}.category_id`, v);
                      const cat = categories.find((c) => c.id === v);
                      if (cat) setValue(`items.${index}.unit`, cat.default_unit);
                    }}
                  >
                    <SelectTrigger
                      aria-labelledby={`item-${index}-category-label`}
                      className="w-full h-11"
                    >
                      <SelectValue placeholder={isFr ? "Choisir une catégorie" : "اختر نوع المساعدة"}>
                        {(value: string) => {
                          const c = categories.find((cat) => cat.id === value);
                          return c ? (
                            <span className="flex items-center gap-2">
                              <CategoryIcon slug={c.slug} className="size-4 text-algeria-green" />
                              <span className="font-bold">{getCategoryLabel(c.slug, c.name_ar, locale)}</span>
                            </span>
                          ) : (
                            isFr ? "Choisir une catégorie" : "اختر نوع المساعدة"
                          );
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-2">
                            <CategoryIcon slug={c.slug} className="size-4 text-algeria-green" />
                            <span>{getCategoryLabel(c.slug, c.name_ar, locale)}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity and Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor={`item-${index}-quantity`}
                      className="mb-1.5 text-xs font-semibold text-muted-foreground"
                    >
                      {isFr ? "Quantité estimée *" : "الكمية التقديرية *"}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-10 shrink-0"
                        aria-label={isFr ? "Diminuer la quantité" : "إنقاص الكمية"}
                        onClick={() => {
                          const q = Math.max(1, (quantity || 1) - 1);
                          setValue(`items.${index}.quantity`, q);
                        }}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <Input
                        id={`item-${index}-quantity`}
                        type="number"
                        min={1}
                        className="text-center font-black text-base h-10"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-10 shrink-0"
                        aria-label={isFr ? "Augmenter la quantité" : "زيادة الكمية"}
                        onClick={() => {
                          const q = (quantity || 1) + 1;
                          setValue(`items.${index}.quantity`, q);
                        }}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label
                      id={`item-${index}-unit-label`}
                      className="mb-1.5 text-xs font-semibold text-muted-foreground"
                    >
                      {isFr ? "Unité *" : "الوحدة *"}
                    </Label>
                    <Select
                      value={watch(`items.${index}.unit`)}
                      onValueChange={(v: string | null) =>
                        v && setValue(`items.${index}.unit`, v as DonationInput["items"][number]["unit"])
                      }
                    >
                      <SelectTrigger
                        aria-labelledby={`item-${index}-unit-label`}
                        className="w-full h-10"
                      >
                        <SelectValue>
                          {(value: string) => getUnitLabel(value, locale)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {unitOptions.map((u) => (
                          <SelectItem key={u.value} value={u.value}>
                            {getUnitLabel(u.value, locale)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Short description */}
                <div>
                  <Label
                    htmlFor={`item-${index}-description`}
                    className="mb-1.5 text-xs font-semibold text-muted-foreground"
                  >
                    {isFr ? "Précisions ou état du matériel (facultatif)" : "ملاحظات وتفاصيل عن المادة (اختياري)"}
                  </Label>
                  <Input
                    id={`item-${index}-description`}
                    placeholder={
                      isFr
                        ? "Ex : Bouteilles d'eau 1.5L, couvertures neuves, etc."
                        : "مثال: مياه معدنية 1.5 لتر، أغطية جديدة، حفاظات مقاس 4..."
                    }
                    className=""
                    {...register(`items.${index}.description`)}
                  />
                </div>
              </div>
            );
          })}

          {errors.items?.message && (
            <p className="text-xs text-destructive">{errors.items.message as string}</p>
          )}

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 border border-dashed border-haba-border-dashed bg-haba-surface p-3.5 text-sm font-semibold text-haba-green hover:bg-haba-green-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-haba-green"
            onClick={() =>
              append({
                category_id: categories[0]?.id ?? "",
                category_slug: categories[0]?.slug ?? "",
                quantity: 1,
                unit: categories[0]?.default_unit ?? "piece",
                description: "",
              })
            }
          >
            <Icon name="plus-sign" size={18} />
            <span>{isFr ? "Ajouter un autre type de don" : "إضافة مادة إضافية أخرى"}</span>
          </button>
        </div>
      </FormStep>

      {/* 2. Location and Delivery Method */}
      <FormStep step={2} title={isFr ? "Localisation & acheminement" : "الموقع وطريقة التسليم"}>
        <div className="space-y-4">

          {/* Wilaya Selection */}
          <div>
            <Label htmlFor="donate-wilaya" className="mb-1.5">{isFr ? "Wilaya où se trouvent les dons *" : "الولاية التي تتوفر بها المساعدات *"}</Label>
            {/* Quick Select for Priority Affected Wilayas */}
            <div className="mb-2 flex flex-wrap gap-1.5">
              {priorityWilayas.map((pw) => {
                const isSelected =
                  selectedWilaya === pw.name_ar || selectedWilaya === pw.codeStr || selectedWilaya === String(pw.code);
                return (
                  <button
                    key={pw.code}
                    type="button"
                    onClick={() => {
                      setValue("current_wilaya", pw.name_ar, { shouldValidate: true });
                      setValue("current_commune", "", { shouldValidate: true });
                    }}
                  >
                    <Chip tone="red" fill={isSelected ? "solid" : "tint"} size="md">
                      <Icon name="flash" size={14} />
                      {isFr ? `${pw.codeStr} - ${pw.name_fr}` : `${pw.codeStr} - ${pw.name_ar}`}
                    </Chip>
                  </button>
                );
              })}
            </div>

            <WilayaSelect
              id="donate-wilaya"
              locale={locale}
              value={selectedWilaya}
              onChange={(e) => {
                setValue("current_wilaya", e.target.value, { shouldValidate: true });
                setValue("current_commune", "", { shouldValidate: true });
              }}
            />
            {errors.current_wilaya && (
              <p className="mt-1 text-xs text-destructive">{errors.current_wilaya.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="donate-commune" className="mb-1.5">{isFr ? "Commune / Quartier" : "البلدية / الحي"}</Label>
            <CommuneSelect
              id="donate-commune"
              wilaya={selectedWilaya}
              locale={locale}
              value={watch("current_commune")}
              onChange={(e) => setValue("current_commune", e.target.value)}
            />
          </div>

          {/* Delivery Mode Toggle Cards */}
          <div className="space-y-2 pt-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              {isFr ? "Comment souhaitez-vous acheminer ces dons ?" : "كيف سيتم إيصال هذه المساعدات ؟"}
            </Label>
            <div className="grid gap-3 desktop:grid-cols-2">
              <ChoiceCard
                type="checkbox"
                name="deliver-self"
                icon="truck-delivery"
                title={isFr ? "Je peux déposer moi-même" : "أستطيع نقلها بنفسي لنقطة تجميع"}
                description={
                  isFr
                    ? "Dépôt direct dans un centre de collecte agréé"
                    : "تسليم المواد لأقرب مركز استقبال أو جمعية معتمدة"
                }
                checked={canDeliverSelf && !needsTransport}
                onChange={() => {
                  setValue("can_deliver_self", true);
                  setValue("needs_transport", false);
                }}
              />
              <ChoiceCard
                type="checkbox"
                name="needs-transport"
                icon="delivery-truck-02"
                title={isFr ? "J'ai besoin d'un transporteur" : "أحتاج إلى وسيلة شحن / نقل"}
                description={
                  isFr
                    ? "Un chauffeur bénévole viendra récupérer les dons"
                    : "نربطك بسائقين متطوعين لاستلام المواد ونقلها"
                }
                checked={needsTransport}
                onChange={() => {
                  setValue("needs_transport", true);
                  setValue("can_deliver_self", false);
                }}
              />
            </div>
          </div>
        </div>
      </FormStep>

      {/* 3. Donor Contact Info */}
      <FormStep step={3} title={isFr ? "Coordonnées du donateur" : "بيانات المتبرع أو الجهة المانحة"}>
        <div className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label htmlFor="donate-name" className="mb-1.5">{isFr ? "Nom complet ou association *" : "الاسم الكامل أو اسم الجمعية *"}</Label>
              <Input
                id="donate-name"
                placeholder={isFr ? "Ex : Karim Benali" : "مثال: كريم بن علي"}
                {...register("donor_name")}
              />
              {errors.donor_name && (
                <p className="mt-1 text-xs text-destructive">{errors.donor_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="donate-phone" className="mb-1.5">{isFr ? "Numéro de téléphone *" : "رقم الهاتف للتواصل *"}</Label>
              <Input id="donate-phone" dir="ltr" placeholder="0555xxxxxx" {...register("donor_phone")} />
              {errors.donor_phone && (
                <p className="mt-1 text-xs text-destructive">{errors.donor_phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="donate-notes" className="mb-1.5">{isFr ? "Remarques ou instructions de livraison (facultatif)" : "ملاحظات إضافية أو تفاصيل الاستلام (اختياري)"}</Label>
            <Textarea
              id="donate-notes"
              placeholder={
                isFr
                  ? "Créneaux pour récupérer les dons, détails d'accès, etc."
                  : "أوقات التواجد، تفاصيل المكان، أو أي معلومات تفيد فريق التنسيق..."
              }
              {...register("notes")}
            />
          </div>
        </div>
      </FormStep>

      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Action
        type="submit"
        variant="primary"
        size="submit"
        icon={submitting ? undefined : "shield-user"}
        disabled={submitting}
      >
        {submitting
          ? isFr
            ? "Envoi en cours…"
            : "جارٍ الإرسال…"
          : isFr
            ? "Valider et enregistrer les dons"
            : "تأكيد وتسجيل المساعدات"}
      </Action>
    </form>
  );
}
