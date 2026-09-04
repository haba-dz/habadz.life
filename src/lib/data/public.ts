import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import { activeCampaignSlug } from "@/config/site";
import type { Database } from "@/types/database";

type AffectedAreaRow = Database["public"]["Tables"]["affected_areas"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export const getActiveCampaign = unstable_cache(
  async () => {
    try {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .eq("slug", activeCampaignSlug)
        .maybeSingle();
      return data;
    } catch {
      return null;
    }
  },
  ["master-data", "active-campaign"],
  { revalidate: 300, tags: ["master-data"] },
);

export const getCategories = unstable_cache(
  async (): Promise<CategoryRow[]> => {
    try {
      const supabase = createPublicClient();
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data ?? [];
    } catch {
      return [];
    }
  },
  ["master-data", "categories"],
  { revalidate: 300, tags: ["master-data"] },
);

export const getAllActiveNeeds = unstable_cache(
  async () => {
    try {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("needs")
        .select("*, categories(slug, name_ar, default_unit)")
        .eq("status", "active")
        .order("priority", { ascending: true })
        .order("updated_at", { ascending: false });
      return data ?? [];
    } catch {
      return [];
    }
  },
  ["public-reads", "active-needs"],
  { revalidate: 60, tags: ["public-reads"] },
);

export const getCriticalNeeds = unstable_cache(
  async (limit = 6) => {
    try {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("needs")
        .select("*, categories(slug, name_ar, default_unit)")
        .eq("status", "active")
        .order("priority", { ascending: true })
        .order("updated_at", { ascending: false })
        .limit(limit);
      return data ?? [];
    } catch {
      return [];
    }
  },
  ["public-reads", "critical-needs"],
  { revalidate: 60, tags: ["public-reads"] },
);

const emptyStatOverview = {
  total_families: 0,
  families_awaiting: 0,
  areas_reached: 0,
  active_points: 0,
  critical_needs: 0,
  active_shipments: 0,
};

export const getStatOverview = unstable_cache(
  async () => {
    try {
      const supabase = createPublicClient();
      const { data } = await supabase.rpc("get_stat_overview").maybeSingle();
      return data ?? emptyStatOverview;
    } catch {
      return emptyStatOverview;
    }
  },
  ["public-reads", "stat-overview"],
  { revalidate: 60, tags: ["public-reads"] },
);

export const getStatDonationsByCategory = unstable_cache(
  async () => {
    try {
      const supabase = createPublicClient();
      const { data } = await supabase.rpc("get_stat_donations_by_category");
      return data ?? [];
    } catch {
      return [];
    }
  },
  ["public-reads", "stat-donations-by-category"],
  { revalidate: 60, tags: ["public-reads"] },
);

export const getStatDistributionsByCategory = unstable_cache(
  async () => {
    try {
      const supabase = createPublicClient();
      const { data } = await supabase.rpc("get_stat_distributions_by_category");
      return data ?? [];
    } catch {
      return [];
    }
  },
  ["public-reads", "stat-distributions-by-category"],
  { revalidate: 60, tags: ["public-reads"] },
);

export const getPublicCollectionPoints = unstable_cache(
  async () => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase.rpc("get_public_collection_points");
      if (!error && data && data.length > 0) {
        const filtered = (data as unknown as { status: string }[]).filter((r) => r.status !== "closed");
        return filtered as typeof data;
      }

      const { data: tableData } = await supabase
        .from("collection_points")
        .select("*")
        .in("status", ["open", "full", "paused"]);
      return tableData ?? [];
    } catch {
      return [];
    }
  },
  ["public-reads", "collection-points"],
  { revalidate: 120, tags: ["public-reads", "geo"] },
);

export const getPublicReliefHubs = unstable_cache(
  async () => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase.rpc("get_public_relief_hubs");
      if (!error && data && data.length > 0) {
        const filtered = (data as unknown as { status: string }[]).filter((r) => r.status !== "closed");
        return filtered as typeof data;
      }

      const { data: tableData } = await supabase
        .from("relief_hubs")
        .select("*")
        .in("status", ["open", "full", "paused"]);
      return tableData ?? [];
    } catch {
      return [];
    }
  },
  ["public-reads", "relief-hubs"],
  { revalidate: 120, tags: ["public-reads", "geo"] },
);

export const getOfficialUpdates = unstable_cache(
  async (limit = 5) => {
    try {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("official_updates")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(limit);
      return data ?? [];
    } catch {
      return [];
    }
  },
  ["public-reads", "official-updates"],
  { revalidate: 60, tags: ["public-reads"] },
);

export async function getOfficialUpdateById(id: string) {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase.from("official_updates").select("*").eq("id", id).maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export const getShelters = unstable_cache(
  async () => {
    try {
      const supabase = createPublicClient();
      const { data } = await supabase.rpc("get_public_relief_hubs");
      return (data ?? []).filter((h) => h.is_shelter && h.status === "open");
    } catch {
      return [];
    }
  },
  ["public-reads", "shelters"],
  { revalidate: 120, tags: ["public-reads", "geo"] },
);

export const getAffectedCommunes = unstable_cache(
  async () => {
    try {
      const supabase = createPublicClient();
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
  },
  ["public-reads", "affected-communes"],
  { revalidate: 120, tags: ["public-reads"] },
);

export const getAffectedAreas = unstable_cache(
  async (): Promise<AffectedAreaRow[]> => {
    try {
      const supabase = createPublicClient();
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
  },
  ["public-reads", "affected-areas"],
  { revalidate: 300, tags: ["public-reads", "geo"] },
);

export const getPublishedPosts = unstable_cache(
  async (limit = 50) => {
    try {
      const supabase = createPublicClient();
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
  },
  ["public-reads", "posts"],
  { revalidate: 120, tags: ["public-reads"] },
);

export async function getPostBySlug(slug: string) {
  try {
    const supabase = createPublicClient();
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

export const getPublicMedicalVolunteers = unstable_cache(
  async () => {
    try {
      const supabase = createPublicClient();
      const { data } = await supabase.rpc("get_public_medical_volunteers");
      return data ?? [];
    } catch {
      return [];
    }
  },
  ["public-reads", "medical-volunteers"],
  { revalidate: 120, tags: ["public-reads"] },
);

export const getPublicFieldVolunteers = unstable_cache(
  async () => {
    try {
      const supabase = createPublicClient();
      const rpc = supabase.rpc as unknown as (fn: string) => PromiseLike<{ data: unknown[] | null }>;
      const { data } = await rpc("get_public_field_volunteers");
      return data ?? [];
    } catch {
      return [];
    }
  },
  ["public-reads", "field-volunteers"],
  { revalidate: 120, tags: ["public-reads"] },
);
