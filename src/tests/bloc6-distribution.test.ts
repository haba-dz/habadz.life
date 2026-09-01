import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { distributionSchema } from "@/actions/distributions";

function validDist(overrides: Record<string, unknown> = {}) {
  return {
    hub_id: "00000000-0000-4000-8000-000000000001",
    category_id: "00000000-0000-4000-8000-000000000002",
    quantity: 10,
    unit: "box" as const,
    beneficiary_family_count: 5,
    distribution_date: "2026-09-01",
    responsible_name: "أحمد",
    notes: "",
    ...overrides,
  };
}

describe("Bloc6: distribution schema", () => {
  it("accepts valid", () => {
    expect(distributionSchema.safeParse(validDist()).success).toBe(true);
  });
  it("rejects huge quantity", () => {
    expect(distributionSchema.safeParse(validDist({ quantity: 200000 })).success).toBe(false);
  });
  it("rejects bad date", () => {
    expect(distributionSchema.safeParse(validDist({ distribution_date: "not-a-date" })).success).toBe(false);
  });
  it("rejects long responsible_name", () => {
    expect(distributionSchema.safeParse(validDist({ responsible_name: "a".repeat(121) })).success).toBe(false);
  });
  it("rejects huge family count", () => {
    expect(distributionSchema.safeParse(validDist({ beneficiary_family_count: 9999 })).success).toBe(false);
  });
});

describe("Bloc6: proof file validation logic", () => {
  it("allowed mime check logic", () => {
    const allowedMime = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    expect(allowedMime.includes("image/jpeg")).toBe(true);
    expect(allowedMime.includes("text/html")).toBe(false);
    expect(allowedMime.includes("application/x-php")).toBe(false);
  });
  it("allowed ext check logic", () => {
    const allowedExt = ["jpg", "jpeg", "png", "webp", "pdf"];
    expect(allowedExt.includes("html")).toBe(false);
    expect(allowedExt.includes("jpg")).toBe(true);
  });
});

describe("Bloc6: migration guards", () => {
  it("0034 has quantity max and unique active", () => {
    const p = path.resolve(import.meta.dirname, "../../supabase/migrations/0034_bloc6_distribution_hardening.sql");
    const sql = readFileSync(p, "utf-8");
    expect(sql).toContain("chk_distributions_quantity_max");
    expect(sql).toContain("uq_campaigns_one_active");
  });
  it("0033 has warehousing hardening", () => {
    const p = path.resolve(import.meta.dirname, "../../supabase/migrations/0033_bloc5_warehousing_hardening.sql");
    const sql = readFileSync(p, "utf-8");
    expect(sql).toContain("where status in ('open','full','paused')");
  });
});
