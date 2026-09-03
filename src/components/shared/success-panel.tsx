import { Check } from "lucide-react";
import { LinkButton } from "@/components/shared/link-button";

/** شاشة تأكيد موحّدة بعد إرسال أي نموذج عام. */
export function SuccessPanel({
  title,
  description,
  children,
  primaryHref = "/needs",
  primaryLabel = "تصفّح الاحتياجات",
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
  primaryHref?: string;
  primaryLabel?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 border border-algeria-green/30 bg-algeria-green/5 px-6 py-10 text-center">
        <span className="animate-pop flex size-16 items-center justify-center bg-algeria-green text-algeria-green-foreground">
          <Check className="size-8" strokeWidth={3} />
        </span>
        <h2 className="text-xl font-bold text-algeria-green">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <LinkButton href={primaryHref}>{primaryLabel}</LinkButton>
          <LinkButton href="/" variant="outline">
            الصفحة الرئيسية
          </LinkButton>
        </div>
      </div>
      {children}
    </div>
  );
}
