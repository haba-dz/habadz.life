import Link from "next/link";
import { redirect } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";
import { AdminSidebarNav } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "../admin-topbar";
import { siteConfig } from "@/config/site";
import { getPendingCounts } from "@/lib/data/admin";
import type { AppRole } from "@/lib/constants";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/admin/login");

  const profile = await getCurrentProfile();

  if (!profile || !["admin", "coordinator", "volunteer"].includes(profile.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <div>
          <p className="text-lg font-bold">ليس لديك صلاحية الوصول إلى لوحة الإدارة</p>
          <p className="mt-2 text-sm text-muted-foreground">
            تواصل مع مسؤول المنصة إذا كنت تعتقد أن هذا خطأ.
          </p>
        </div>
      </div>
    );
  }

  const fullName = profile.full_name || "مشرف";
  const role = profile.role as AppRole;

  const counts = await getPendingCounts();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-e border-border bg-secondary/20 p-4 md:block">
        <Link href="/admin" className="mb-6 flex items-center gap-2 px-1 font-bold">
          <span className="flex size-8 items-center justify-center rounded-full bg-algeria-green text-algeria-green-foreground">
            <HeartHandshake className="size-4" />
          </span>
          {siteConfig.shortName}
        </Link>
        <AdminSidebarNav counts={counts} />
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar fullName={fullName} role={role} counts={counts} />
        <main className="flex-1 bg-secondary/10 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
