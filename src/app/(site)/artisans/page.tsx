import type { Metadata } from "next";
import { ArtisanForm } from "./artisan-form";
import { getLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFr = locale === "fr";
  return {
    title: isFr ? "Je suis artisan bénévole" : "أنا حرفي متطوع",
    description: isFr
      ? "Rejoignez le réseau d'artisans bénévoles (peinture, maçonnerie, plomberie, électricité...) pour aider à la reconstruction des logements des familles sinistrées."
      : "انضم إلى شبكة الحرفيين المتطوعين (دهان، بناء، سباكة، كهرباء...) للمساهمة في ترميم منازل المتضررين.",
  };
}

export default async function ArtisansPage() {
  const locale = await getLocale();
  const isFr = locale === "fr";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold">
          {isFr ? "Bénévolat artisanal pour la reconstruction" : "التطوع الحرفي لترميم المنازل"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isFr
            ? "Enregistrez vos coordonnées et votre spécialité pour contribuer aux travaux de réparation (peinture, maçonnerie, plomberie, électricité...) chez les familles sinistrées."
            : "سجّل بياناتك وتخصصك للمساهمة في أعمال الترميم (دهان، بناء، سباكة، كهرباء...) لدى الأسر المتضررة."}
        </p>
      </div>
      <ArtisanForm locale={locale} />
    </div>
  );
}
