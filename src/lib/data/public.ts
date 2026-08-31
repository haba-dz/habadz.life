import "server-only";
import { createClient } from "@/lib/supabase/server";
import { activeCampaignSlug } from "@/config/site";
import type { Database } from "@/types/database";

type AffectedAreaRow = Database["public"]["Tables"]["affected_areas"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export async function getActiveCampaign() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("slug", activeCampaignSlug)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<CategoryRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getCriticalNeeds(limit = 6) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("needs")
      .select("*, categories(slug, name_ar, default_unit)")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(50);

    const rows = data ?? [];
    const priorityRank: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return rows
      .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function getAllActiveNeeds() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("needs")
      .select("*, categories(slug, name_ar, default_unit)")
      .eq("status", "active")
      .order("updated_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

const emptyStatOverview = {
  total_families: 0,
  families_awaiting: 0,
  areas_reached: 0,
  active_points: 0,
  critical_needs: 0,
  active_shipments: 0,
};

export async function getStatOverview() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_stat_overview").single();
    return data ?? emptyStatOverview;
  } catch {
    return emptyStatOverview;
  }
}

export async function getStatDonationsByCategory() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_stat_donations_by_category");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getStatDistributionsByCategory() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_stat_distributions_by_category");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getPublicCollectionPoints() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_collection_points");
    if (!error && data && data.length > 0) return data;

    const { data: tableData } = await supabase
      .from("collection_points")
      .select("*")
      .in("status", ["open", "full", "paused"]);
    return tableData ?? [];
  } catch {
    return [];
  }
}

export async function getPublicReliefHubs() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_relief_hubs");
    if (!error && data && data.length > 0) return data;

    const { data: tableData } = await supabase
      .from("relief_hubs")
      .select("*")
      .in("status", ["open", "full", "paused"]);
    return tableData ?? [];
  } catch {
    return [];
  }
}

export async function getOfficialUpdates(limit = 5) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("official_updates")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getShelters() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_public_relief_hubs");
    return (data ?? []).filter((h) => h.is_shelter && h.status === "open");
  } catch {
    return [];
  }
}

export async function getAffectedCommunes() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("needs")
      .select("commune, priority")
      .eq("status", "active");

    const map = new Map<string, { commune: string; total: number; critical: number }>();
    for (const n of data ?? []) {
      const row = map.get(n.commune) ?? { commune: n.commune, total: 0, critical: 0 };
      row.total += 1;
      if (n.priority === "critical" || n.priority === "high") row.critical += 1;
      map.set(n.commune, row);
    }
    return [...map.values()].sort((a, b) => b.critical - a.critical || b.total - a.total);
  } catch {
    return [];
  }
}

export async function getAffectedAreas(): Promise<AffectedAreaRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("affected_areas")
      .select("*")
      .order("wilaya")
      .order("daira")
      .order("commune");
    return (data as AffectedAreaRow[] | null) ?? [];
  } catch {
    return [];
  }
}

export async function getPublishedPosts(limit = 50) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("id, slug, title, excerpt, published_at, author_name")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export async function getPublicMedicalVolunteers() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_public_medical_volunteers");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getPublicFieldVolunteers() {
  try {
    const supabase = await createClient();
    // الدالة غير موجودة في الأنواع المولَّدة بعد (أُنشئت يدويًا في الإنتاج) — جسر نوعي مؤقت.
    const rpc = supabase.rpc as unknown as (fn: string) => PromiseLike<{ data: unknown[] | null }>;
    const { data } = await rpc("get_public_field_volunteers");
    return data ?? [];
  } catch {
    return [];
  }
}

