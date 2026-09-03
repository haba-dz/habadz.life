"use client";

import { useState } from "react";
import { Phone, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { emergencyContacts } from "@/lib/emergency";
import { cn } from "@/lib/utils";
import type { AvailableLocale } from "@/i18n/locales";

export function EmergencyFab({ locale = "ar" }: { locale?: AvailableLocale }) {
  const [open, setOpen] = useState(false);
  const isFr = locale === "fr";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={isFr ? "Numéros d'urgence" : "أرقام الطوارئ"}
        className={cn(
          "fixed bottom-20 start-4 z-30 hidden sm:flex items-center gap-2 rounded-full bg-priority-critical px-3.5 py-2.5",
          "text-xs sm:text-sm font-bold text-white shadow-lg shadow-priority-critical/30 cursor-pointer",
          "transition-all hover:scale-105 active:scale-95 md:bottom-6",
        )}
      >
        <TriangleAlert className="size-4 animate-pulse" />
        <span>{isFr ? "Numéros d'urgence" : "أرقام الطوارئ"}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <TriangleAlert className="size-5 text-priority-critical" />
              {isFr ? "Numéros d'urgence" : "أرقام الطوارئ"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isFr
                ? "Numéros officiels gratuits accessibles 24h/24 et 7j/7 sur tout le territoire national."
                : "أرقام رسمية مجانية تعمل على مدار الساعة في كامل التراب الوطني."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 my-2">
            {emergencyContacts.map((c) => (
              <div
                key={c.label}
                className="rounded-xl border border-border p-3 transition-colors hover:border-priority-critical/60 bg-card"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-priority-critical/10 text-priority-critical">
                      <c.icon className="size-4" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-xs font-bold leading-tight">
                        {isFr && c.label_fr ? c.label_fr : c.label}
                      </span>
                      {(isFr ? c.hint_fr || c.hint : c.hint) && (
                        <span className="block text-[10px] text-muted-foreground">
                          {isFr ? c.hint_fr || c.hint : c.hint}
                        </span>
                      )}
                    </span>
                  </span>
                  <a
                    href={`tel:${c.number}`}
                    className="flex items-center gap-1.5 rounded-lg bg-priority-critical px-2.5 py-1 text-xs font-black tabular-nums text-white active:scale-95"
                  >
                    <Phone className="size-3" />
                    {c.number}
                  </a>
                </div>
                {c.greenNumber && (
                  <a
                    href={`tel:${c.greenNumber}`}
                    className="mt-2 flex items-center justify-between rounded-lg bg-algeria-green/10 px-2.5 py-1 text-[11px] font-semibold text-algeria-green"
                  >
                    <span>{isFr ? "Numéro vert" : "الرقم الأخضر"}</span>
                    <span className="tabular-nums font-bold">{c.greenNumber}</span>
                  </a>
                )}
              </div>
            ))}
          </div>

          <Button variant="outline" onClick={() => setOpen(false)} className="w-full rounded-xl">
            {isFr ? "Fermer" : "إغلاق"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
