import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveCampaign } from "@/lib/data/public";
import { classifyNewsItem } from "@/config/news-sources";

const webhookPayloadSchema = z.object({
  title: z.string().optional(),
  text: z.string().optional(),
  message: z.string().optional(),
  url: z.string().optional().nullable(),
  source: z.string().optional(),
});

async function getWebhookDbClient() {
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return createAdminClient();
    }
  } catch {
    // Fallback
  }
  return await createClient();
}

/**
 * Webhook endpoint to receive real-time crisis posts from emergency Facebook pages or news bots.
 */
export async function POST(req: Request) {
  const secret = process.env.WEBHOOK_SECRET || process.env.CRON_SECRET;
  const { searchParams } = new URL(req.url);
  const token =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    searchParams.get("secret") ||
    searchParams.get("key");

  // بلا سرّ مضبوط نرفض الطلب — قبول أي حمولة يعني حقن أخبار مزيّفة في الموقع.
  if (!secret || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawBody = await req.json();
    const parsed = webhookPayloadSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload format", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { title, text, message, url, source = "مديرية الحماية المدنية لولاية جيجل" } = parsed.data;
    const postText = (message || text || title || "").trim();

    if (!postText) {
      return NextResponse.json({ error: "Missing text content" }, { status: 400 });
    }

    const { update_type, is_urgent } = classifyNewsItem(postText);
    const campaign = await getActiveCampaign();

    if (!campaign?.id) {
      return NextResponse.json({ error: "Active campaign not found" }, { status: 404 });
    }

    const supabase = await getWebhookDbClient();

    // Extract title (first line) and body (rest)
    const lines = postText.split("\n").filter((l) => l.trim().length > 0);
    const postTitle = lines[0]?.slice(0, 200) || "بيان من الحماية المدنية - جيجل";
    const postBody = lines.slice(1).join("\n") || postText;
    const postUrl = url || "https://www.facebook.com/DGPC0018";

    // Deduplication check: check by exact title or url
    const query = supabase.from("official_updates").select("id, title, url").eq("title", postTitle);
    const { data: existing } = await query.maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Duplicate skipped: post already ingested",
        item: existing,
        is_urgent,
      });
    }

    const { data, error } = await supabase
      .from("official_updates")
      .insert({
        campaign_id: campaign.id,
        title: postTitle,
        body: postBody,
        source: source,
        url: postUrl,
        update_type: update_type,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      revalidatePath("/official-information");
      revalidatePath("/admin/news");
      revalidatePath("/");
    } catch {
      // Ignore during non-request execution
    }

    return NextResponse.json({
      success: true,
      message: "Post ingested successfully",
      item: data,
      is_urgent,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
