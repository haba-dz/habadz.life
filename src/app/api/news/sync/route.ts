import { NextResponse } from "next/server";
import { syncOfficialNews, OFFICIAL_ALGERIAN_SOURCES } from "@/lib/services/news-ingestion";
import { createClient } from "@/lib/supabase/server";

const staffRoles = ["admin", "coordinator", "volunteer"];

function isAuthorizedByToken(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET || process.env.WEBHOOK_SECRET;
  // بلا سرّ مضبوط نرفض الطلب — ترك المزامنة مفتوحة للعموم يسمح باستنزاف المصادر الخارجية.
  if (!cronSecret) return false;

  const { searchParams } = new URL(req.url);
  const token =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    searchParams.get("key") ||
    searchParams.get("secret");

  return token === cronSecret;
}

/** يقبل إمّا رمز الخدمة السرّي (Cron/webhook خارجي) أو جلسة عضو طاقم مسجَّل دخوله
 *  (زر "مزامنة المصادر الآن" داخل لوحة الإدارة). */
async function isAuthorized(req: Request): Promise<boolean> {
  if (isAuthorizedByToken(req)) return true;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    return !!profile && staffRoles.includes(profile.role);
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncOfficialNews();
  return NextResponse.json({
    success: result.success,
    syncedCount: result.syncedCount,
    sourcesCount: OFFICIAL_ALGERIAN_SOURCES.length,
    items: result.items.slice(0, 10),
    error: result.error,
  });
}

export async function POST(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncOfficialNews();
  return NextResponse.json({
    success: result.success,
    syncedCount: result.syncedCount,
    sourcesCount: OFFICIAL_ALGERIAN_SOURCES.length,
    items: result.items,
    error: result.error,
  });
}
