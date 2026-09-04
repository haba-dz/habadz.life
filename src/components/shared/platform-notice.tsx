import { siteConfig } from "@/config/site";
import { Icon } from "@/components/icons";
import { NoticeBlock } from "@/components/site";
import type { AvailableLocale } from "@/i18n/locales";

/**
 * The platform's three load-bearing commitments. design.md §3.15
 *
 * Wording is the project's own (longer and more specific than the artboards');
 * only the lead sentence is split out to match the design's bold-lead pattern.
 */
const pointsAr = [
  {
    lead: "لا تجمع المنصة أي أموال.",
    body: "لا تطلب أي معلومات بنكية أو مالية أو بريدية — لا أرقام حسابات، ولا بطاقات، ولا تحويلات، ولا أي وسيلة دفع مهما كانت. أي طلب مالي باسم المنصة هو احتيال.",
  },
  {
    lead: "ليست منصة لجمع التبرعات.",
    body: "هدفها الأول والأخير تنظيم المساعدات العينية الموجّهة للولايات المتضررة من الحرائق، وليس لها أي هدف ربحي أو تجاري.",
  },
  {
    lead: "لا تجمع أي معطيات شخصية",
    body: "لأغراض تجارية أو إعلانية. بيانات التواصل (الاسم والهاتف) تُستخدم حصريًا لتمكين فرق التنسيق من إيصال المساعدة، ولا تُعرض للعامة، ولا تُباع أو تُشارك مع أي جهة.",
  },
];

const pointsFr = [
  {
    lead: "La plateforme ne collecte aucun argent.",
    body: "Aucune coordonnée bancaire, financière ou postale n'est demandée — ni numéro de compte, ni carte, ni virement, ni aucun moyen de paiement. Toute demande d'argent en son nom est une fraude.",
  },
  {
    lead: "Ce n'est pas une plateforme de collecte de fonds.",
    body: "Sa seule vocation est de coordonner les dons matériels destinés aux wilayas touchées par les incendies, sans aucun but lucratif.",
  },
  {
    lead: "Aucune donnée personnelle n'est collectée",
    body: "à des fins commerciales ou publicitaires. Les coordonnées (nom et téléphone) servent exclusivement à l'équipe de coordination pour acheminer les secours ; elles ne sont ni publiées, ni vendues, ni partagées.",
  },
];

export function PlatformNotice({ locale = "ar" }: { locale?: AvailableLocale }) {
  const isFr = locale === "fr";

  return (
    <NoticeBlock
      title={isFr ? "Information importante" : "ملاحظة هامة"}
      statements={isFr ? pointsFr : pointsAr}
      footer={
        <>
          <span>
            {isFr
              ? `${siteConfig.shortName} est entièrement gratuite et open source — chacun peut consulter le code et vérifier ce que la plateforme fait des données.`
              : `${siteConfig.shortName} مجانية بالكامل ومفتوحة المصدر — يستطيع أي شخص الاطلاع على الكود والتحقق مما تفعله المنصة بالبيانات.`}
          </span>
          <a
            href={siteConfig.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-semibold text-haba-green hover:text-haba-green-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-haba-green"
          >
            <Icon name="github" size={16} />
            {isFr ? "Code source sur GitHub" : "الكود المصدري على GitHub"} <span aria-hidden>←</span>
          </a>
        </>
      }
    />
  );
}
