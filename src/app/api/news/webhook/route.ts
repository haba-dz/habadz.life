import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveCampaign } from "@/lib/data/public";
import { classifyNewsItem } from "@/config/news-sources";
import { isApiRequestAuthorized } from "@/lib/api-auth";

const webhookPayloadSchema = z.object({
  title: z.string().trim().max(5000).optional(),
  text: z.string().trim().max(20000).optional(),
  message: z.string().trim().max(20000).optional(),
  url: z
    .string()
    .trim()
    .url()
    .refine((v) => {
      try {
        const p = new URL(v).protocol;
        return p === "http:" || p === "https:";
      } catch {
        return false;
      }
    }, "URL must be http/https")
    .max(2000)
    .optional()
    .nullable(),
  source: z.string().trim().min(1).max(200).default("مديرية الحماية المدنية لولاية جيجل"),
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

export async function POST(req: Request) {
  if (!isApiRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawBody = await req.json();
    const parsed = webhookPayloadSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { title, text, message, url, source } = parsed.data;
    const postText = (message || text || title || "").trim();

    if (!postText) {
      return NextResponse.json({ error: "Missing text content" }, { status: 400 });
    }

    const { update_type, wilaya, is_urgent } = classifyNewsItem(postText);
    const campaign = await getActiveCampaign();

    if (!campaign?.id) {
      return NextResponse.json({ error: "Active campaign not found" }, { status: 404 });
    }

    const supabase = await getWebhookDbClient();

    const lines = postText.split("\n").filter((l) => l.trim().length > 0);
    const postTitle = lines[0]?.slice(0, 200) || "بيان من الحماية المدنية - جيجل";
    const postBody = lines.slice(1).join("\n") || postText;
    const postUrl = url || "https://www.facebook.com/DGPC0018";

    const { data: existing } = await supabase
      .from("official_updates")
      .select("id, title, url")
      .eq("title", postTitle)
      .maybeSingle();

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
        wilaya: wilaya ?? null,
        is_urgent: is_urgent ?? false,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[api] news/webhook insert:", error);
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }

    try {
      revalidatePath("/official-information");
      revalidatePath("/admin/news");
      revalidatePath("/");
    } catch {
      // Ignore
    }

    return NextResponse.json({
      success: true,
      message: "Post ingested successfully",
      item: data,
      is_urgent,
    });
  } catch (err: unknown) {
    console.error("[api] news/webhook:", err);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
