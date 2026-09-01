"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, LogOut, Radio, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AdminSidebarNav, type NavCounts } from "@/components/layout/admin-sidebar";
import { signOut } from "@/actions/auth";
import { roleLabels, type AppRole } from "@/lib/constants";

const routeTitles: Record<string, string> = {
  "/admin": "غرفة العمليات المركزية",
  "/admin/verification": "طابور التحقق والمراجعة",
  "/admin/beneficiaries": "سجل الأسر المتضررة والطلبات",
  "/admin/needs": "بنك الاحتياجات الميدانية",
  "/admin/distributions": "سجل عمليات التوزيع والإغاثة",
  "/admin/affected-areas": "المناطق والقرى المتضررة",
  "/admin/inventory": "إدارة المخزون والمستودعات",
  "/admin/collection-points": "نقاط تجميع المساعدات",
  "/admin/relief-hubs": "مراكز الاستقبال والإيواء",
  "/admin/transport": "أسطول النقل والشحن",
  "/admin/donations": "سجل المساعدات المسجَّلة",
  "/admin/announcements": "شريط الأخبار العاجلة",
  "/admin/news": "مدونة المستجدات الميدانية",
  "/admin/reports": "التقارير والإحصائيات والتصدير",
  "/admin/users": "فريق العمل والمشرفون",
  "/admin/settings": "إعدادات الحملة والمنصة",
};

export function AdminTopbar({
  fullName,
  role,
  counts,
}: {
  fullName: string | null;
  role: AppRole;
  counts?: NavCounts;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const currentTitle = routeTitles[pathname] ?? "لوحة الإدارة";

  // Operator initials
  const initials = fullName
    ? fullName
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("·")
    : "مشرف";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="size-4" />
              </Button>
            }
          />
          <SheetContent side="right" className="w-72 bg-card p-4 text-card-foreground">
            <SheetTitle className="mb-4 text-right text-sm font-bold text-card-foreground">
              قائمة العمليات
            </SheetTitle>
            <div className="overflow-y-auto max-h-[calc(100vh-80px)]">
              <AdminSidebarNav counts={counts} onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <span className="hidden h-4 w-px bg-border md:inline-block" />
          <h1 className="text-sm font-bold text-foreground md:text-base">{currentTitle}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1.5 rounded-full border border-verify-verified/30 bg-verify-verified/10 px-2.5 py-1 text-xs font-bold text-verify-verified sm:inline-flex">
          <Radio className="size-3 animate-pulse text-verify-verified" />
          <span>العمليات الميدانية نشطة</span>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted px-2.5 py-1">
          <div className="flex size-7 items-center justify-center rounded-full bg-verify-verified/20 text-xs font-bold text-verify-verified">
            {initials}
          </div>
          <div className="hidden text-end sm:block">
            <p className="text-xs font-bold leading-tight text-foreground">{fullName || "بدون اسم"}</p>
            <p className="text-[10.5px] font-semibold text-muted leading-tight">{roleLabels[role]}</p>
          </div>
        </div>

        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            aria-label="تسجيل الخروج"
            title="تسجيل الخروج"
            className="text-muted hover:text-danger hover:bg-danger/10"
          >
            <LogOut className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
