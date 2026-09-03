import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PointsVerificationList, HubsVerificationList, RequestsVerificationList } from "./verification-sections";

export const metadata: Metadata = { title: "التحقق", robots: { index: false } };

export default async function AdminVerificationPage() {
  const supabase = await createClient();
  const pendingLevels = ["unverified", "pending"] as const;

  const [{ data: points }, { data: hubs }, { data: requests }] = await Promise.all([
    supabase.from("collection_points").select("*").in("verification_level", pendingLevels),
    supabase.from("relief_hubs").select("*").in("verification_level", pendingLevels),
    supabase
      .from("beneficiary_requests")
      .select("id, full_name, commune, wilaya, status, priority, verification_level")
      .in("verification_level", pendingLevels),
  ]);

  const totalPending = (points?.length ?? 0) + (hubs?.length ?? 0) + (requests?.length ?? 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">التحقق</h1>
        <p className="text-sm text-muted-foreground">
          {totalPending === 0
            ? "لا يوجد عناصر بانتظار التحقق حاليًا."
            : `${totalPending} عنصرًا بانتظار المراجعة والتحقق.`}
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-bold">نقاط التجميع ({points?.length ?? 0})</h2>
        <PointsVerificationList points={points ?? []} />
      </section>

      <section>
        <h2 className="mb-3 font-bold">مراكز الاستقبال ({hubs?.length ?? 0})</h2>
        <HubsVerificationList hubs={hubs ?? []} />
      </section>

      <section>
        <h2 className="mb-3 font-bold">طلبات المساعدة ({requests?.length ?? 0})</h2>
        <RequestsVerificationList requests={requests ?? []} />
      </section>
    </div>
  );
}
