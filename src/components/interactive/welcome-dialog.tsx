"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake, Gift, Truck, MapPin, TriangleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import type { AvailableLocale } from "@/i18n/locales";

const STORAGE_KEY = "haba_welcome_seen_v1";

const rolesAr = [
  { href: "/help", icon: TriangleAlert, title: "أحتاج مساعدة (عائلة متضررة)", desc: "تسجيل احتياجات أسرتكم لإيصال الإغاثة والمواد الأساسية", color: "bg-priority-critical/10 text-priority-critical" },
  { href: "/donate", icon: Gift, title: "لدي مساعدات عينية", desc: "أملك مواد وإعانات وأريد إيصالها للمتضررين", color: "bg-algeria-green/10 text-algeria-green" },
  { href: "/volunteers", icon: HeartHandshake, title: "أريد التطوع ميدانيًا أو طبياً", desc: "المشاركة في فرز الطرود، الإغاثة، أو الرعاية الصحية", color: "bg-amber-500/10 text-amber-600" },
  { href: "/map", icon: MapPin, title: "خريطة المراكز ونقاط الإغاثة", desc: "الاطلاع على نقاط التجميع ومراكز الاستقبال المفتوحة", color: "bg-blue-500/10 text-blue-600" },
];

const rolesFr = [
  { href: "/help", icon: TriangleAlert, title: "J'ai besoin d'aide (famille sinistrée)", desc: "Enregistrer vos besoins urgents (vivres, hébergement, soins)", color: "bg-priority-critical/10 text-priority-critical" },
  { href: "/donate", icon: Gift, title: "J'ai des dons matériels", desc: "Fournir des vivres et produits de première nécessité", color: "bg-algeria-green/10 text-algeria-green" },
  { href: "/volunteers", icon: HeartHandshake, title: "Volontariat de terrain & Médical", desc: "Aider au tri des colis, secours ou soins", color: "bg-amber-500/10 text-amber-600" },
  { href: "/map", icon: MapPin, title: "Carte des secours & centres", desc: "Consulter les points de collecte et centres d'accueil", color: "bg-blue-500/10 text-blue-600" },
];

export function WelcomeDialog({ locale = "ar" }: { locale?: AvailableLocale }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isFr = locale === "fr";
  const roles = isFr ? rolesFr : rolesAr;

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  function choose(href: string) {
    dismiss();
    router.push(href);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) dismiss();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-start">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-algeria-green/10 text-algeria-green sm:mx-0">
            <HeartHandshake className="size-6" />
          </div>
          <DialogTitle className="text-xl">
            {isFr ? `Bienvenue sur ${siteConfig.name}` : `مرحبًا بك في ${siteConfig.name}`}
          </DialogTitle>
          <DialogDescription>
            {isFr
              ? "Plateforme citoyenne solidaire pour coordonner les secours. Comment souhaitez-vous participer ?"
              : "منصة وطنية لتنسيق التضامن وتقديم المساعدات. كيف ترغب في المشاركة اليوم؟"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2.5 py-2">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.href}
                type="button"
                onClick={() => choose(r.href)}
                className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-3.5 text-start transition-all hover:border-algeria-green hover:bg-muted/50 active:scale-[0.98] cursor-pointer"
              >
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${r.color}`}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm leading-tight text-foreground">{r.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{r.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end pt-1">
          <Button variant="ghost" size="sm" onClick={dismiss}>
            {isFr ? "Fermer et parcourir le site" : "إغلاق والتصفح مباشرة"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
