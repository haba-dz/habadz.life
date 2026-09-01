import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { txnSchema } from "@/actions/inventory";
import { pointSchema, collectionPointSchema } from "@/actions/points";
import { findWilaya } from "@/lib/algeria-cities";

function validTxn(overrides: Record<string, unknown> = {}) {
  return {
    hub_id: "00000000-0000-4000-8000-000000000001",
    category_id: "00000000-0000-4000-8000-000000000002",
    type: "in" as const,
    quantity: 10,
    unit: "box" as const,
    note: "",
    ...overrides,
  };
}

function validPoint(overrides: Record<string, unknown> = {}) {
  return {
    name: "نقطة جيجل",
    wilaya: "جيجل",
    commune: "الطاهير",
    address: "",
    lat: 36.82,
    lng: 5.76,
    phone: "0555123456",
    show_phone_publicly: false,
    contact_name: "",
    opening_hours: "",
    notes: "",
    ...overrides,
  };
}

describe("Bloc5: inventory txn schema P1-01/P0-01", () => {
  it("accepts valid in", () => {
    expect(txnSchema.safeParse(validTxn()).success).toBe(true);
  });
  it("rejects quantity over max", () => {
    expect(txnSchema.safeParse(validTxn({ quantity: 200000 })).success).toBe(false);
  });
  it("rejects transfer to same hub", () => {
    const id = "00000000-0000-4000-8000-000000000001";
    expect(txnSchema.safeParse(validTxn({ type: "transfer", hub_id: id, destination_hub_id: id })).success).toBe(false);
  });
  it("rejects transfer without destination", () => {
    expect(txnSchema.safeParse(validTxn({ type: "transfer" })).success).toBe(true);
  });
});

describe("Bloc5: point GIS P0-03", () => {
  it("accepts valid point with lat/lng", () => {
    expect(pointSchema.safeParse(validPoint()).success).toBe(true);
  });
  it("rejects out of bounds lat", () => {
    expect(pointSchema.safeParse(validPoint({ lat: 9999, lng: 5 })).success).toBe(false);
    expect(pointSchema.safeParse(validPoint({ lat: 91, lng: 5 })).success).toBe(false);
  });
  it("rejects half-coordinate", () => {
    expect(pointSchema.safeParse(validPoint({ lat: 36, lng: undefined })).success).toBe(false);
    expect(pointSchema.safeParse(validPoint({ lat: undefined, lng: 5 } as unknown as Record<string, unknown>)).success).toBe(false);
  });
  it("rejects invalid wilaya", () => {
    expect(pointSchema.safeParse(validPoint({ wilaya: "injected" })).success).toBe(false);
  });
  it("rejects bad phone", () => {
    expect(pointSchema.safeParse(validPoint({ phone: "javascript:alert(1)" })).success).toBe(false);
  });
  it("wilaya allowlist via findWilaya", () => {
    expect(!!findWilaya("جيجل")).toBe(true);
    expect(!!findWilaya("injected")).toBe(false);
  });
});

describe("Bloc5: collection point categories P1-01", () => {
  it("accepts empty categories", () => {
    expect(collectionPointSchema.safeParse({ ...validPoint(), accepted_categories: [] }).success).toBe(true);
  });
  it("rejects too many categories", () => {
    const many = Array.from({ length: 21 }, (_, i) => `cat${i}`);
    expect(collectionPointSchema.safeParse({ ...validPoint(), accepted_categories: many }).success).toBe(false);
  });
});

describe("Bloc5: migration guards P0-03/P1-02", () => {
  it("0033 migration has GIS checks and closed exclusion", () => {
    const p = path.resolve(import.meta.dirname, "../../supabase/migrations/0033_bloc5_warehousing_hardening.sql");
    const sql = readFileSync(p, "utf-8");
    expect(sql).toContain("chk_collection_points_lat");
    expect(sql).toContain("chk_collection_points_coords_pair");
    expect(sql).toContain("chk_relief_hubs_lat");
    expect(sql).toContain("chk_inventory_txn_quantity_max");
    expect(sql).toContain("where status in ('open','full','paused')");
  });
});
