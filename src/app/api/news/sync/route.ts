import { NextResponse } from "next/server";
import { syncOfficialNews, OFFICIAL_ALGERIAN_SOURCES } from "@/lib/services/news-ingestion";
import { createClient } from "@/lib/supabase/server";
import { isApiRequestAuthorized } from "@/lib/api-auth";

const staffRoles = ["admin", "coordinator", "volunteer"];

async function isAuthorized(req: Request): Promise<boolean> {
  if (isApiRequestAuthorized(req)) return true;

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
