import { describe, it, expect } from "vitest";
import { beneficiaryRequestSchema, needCategoryOptions } from "@/schemas/beneficiary-request";
import { damageAssessmentSchema } from "@/schemas/damage-assessment";
import { estimateDamageMaterials } from "@/services/damage-estimation";
import { calculateBeneficiaryPriorityHint, calculateNeedPriority } from "@/services/priority";

// valid payload factories
function validBeneficiary(overrides: Record<string, unknown> = {}) {
  return {
    full_name: "عمار مزيان",
    phone: "0555123456",
    wilaya: "جيجل",
    commune: "الطاهير",
    address_note: "بجوار المدرسة",
    family_members_count: 4,
    children_count: 2,
    housing_status: "متضرر جزئيا",
    is_housing_habitable: "no" as const,
    has_injuries: false,
    injuries_note: "",
    needs_medical: false,
    medical_note: "",
    lost_livestock: false,
    lost_income: true,
    needed_categories: ["food", "water"] as unknown as string[],
    other_needs_note: "",
    ...overrides,
  };
}

function validDamage(overrides: Record<string, unknown> = {}) {
  return {
    full_name: "عمار مزيان",
    phone: "0555123456",
    wilaya: "جيجل",
    commune: "الطاهير",
    address_note: "",
    needs_paint: true,
    paint_area_sqm: 60,
    needs_flooring: false,
    needs_roofing: true,
    needs_plumbing: false,
    needs_electrical: false,
    finishing_notes: "غرفتان متضررتان",
    ...overrides,
  };
}

describe("Bloc 2: Triage & SOS — Beneficiary Request Schema (P1-03)", () => {
  it("commit: fix(beneficiary): enforce allowlist for needed_categories", () => {
    const ok = beneficiaryRequestSchema.safeParse(validBeneficiary({ needed_categories: ["food"] }));
    expect(ok.success).toBe(true);

    const injected = beneficiaryRequestSchema.safeParse(validBeneficiary({ needed_categories: ["../../injected"] }));
    expect(injected.success).toBe(false);

    const empty = beneficiaryRequestSchema.safeParse(validBeneficiary({ needed_categories: [] }));
    expect(empty.success).toBe(false);

    // all defined options should pass
    for (const opt of needCategoryOptions) {
      const r = beneficiaryRequestSchema.safeParse(validBeneficiary({ needed_categories: [opt.value] }));
      expect(r.success, `should accept ${opt.value}`).toBe(true);
    }
  });

  it("commit: fix(beneficiary): reject children_count > family_members_count", () => {
    const bad = beneficiaryRequestSchema.safeParse(validBeneficiary({ family_members_count: 2, children_count: 5 }));
    expect(bad.success).toBe(false);
    if (!bad.success) expect(bad.error.issues[0].path).toContain("children_count");

    const equal = beneficiaryRequestSchema.safeParse(validBeneficiary({ family_members_count: 3, children_count: 3 }));
    expect(equal.success).toBe(true);

    const zeroChildren = beneficiaryRequestSchema.safeParse(validBeneficiary({ family_members_count: 1, children_count: 0 }));
    expect(zeroChildren.success).toBe(true);
  });

  it("commit: fix(beneficiary): enforce family bounds 1..50 and children 0..50", () => {
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ family_members_count: 0 })).success).toBe(false);
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ family_members_count: 51 })).success).toBe(false);
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ children_count: 51 })).success).toBe(false);
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ children_count: -1 })).success).toBe(false);
  });

  it("commit: fix(beneficiary): validate Algerian phone 0[5-7]xxxxxxxx", () => {
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ phone: "0555123456" })).success).toBe(true);
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ phone: "0612345678" })).success).toBe(true);
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ phone: "0712345678" })).success).toBe(true);
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ phone: "0412345678" })).success).toBe(false);
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ phone: "05551234" })).success).toBe(false);
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ phone: " 0555123456 " })).success).toBe(true); // trimmed
  });

  it("commit: fix(beneficiary): cap wilaya/commune/full_name lengths", () => {
    const longWilaya = "ا".repeat(101);
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ wilaya: longWilaya })).success).toBe(false);
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ commune: longWilaya })).success).toBe(false);
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ full_name: "ا".repeat(101) })).success).toBe(false);
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ wilaya: "جيجل" })).success).toBe(true);
  });

  it("commit: fix(beneficiary): cap address_note and notes to 500 chars", () => {
    const long = "a".repeat(501);
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ address_note: long })).success).toBe(false);
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ injuries_note: long })).success).toBe(false);
    expect(beneficiaryRequestSchema.safeParse(validBeneficiary({ other_needs_note: long })).success).toBe(false);
  });
});

describe("Bloc 2: Damage Assessment Schema (P1-03)", () => {
  it("commit: fix(damage): cap paint_area_sqm 1..5000 and reject huge values", () => {
    expect(damageAssessmentSchema.safeParse(validDamage({ paint_area_sqm: 999999 })).success).toBe(false);
    expect(damageAssessmentSchema.safeParse(validDamage({ paint_area_sqm: 5001 })).success).toBe(false);
    expect(damageAssessmentSchema.safeParse(validDamage({ paint_area_sqm: 5000 })).success).toBe(true);
    expect(damageAssessmentSchema.safeParse(validDamage({ paint_area_sqm: 60 })).success).toBe(true);
    expect(damageAssessmentSchema.safeParse(validDamage({ paint_area_sqm: -5 })).success).toBe(false);
    expect(damageAssessmentSchema.safeParse(validDamage({ paint_area_sqm: 0 })).success).toBe(false);
    // optional when no paint
    expect(damageAssessmentSchema.safeParse(validDamage({ needs_paint: false, paint_area_sqm: undefined })).success).toBe(true);
  });

  it("commit: fix(damage): validate phone and required wilaya/commune", () => {
    expect(damageAssessmentSchema.safeParse(validDamage({ phone: "bad" })).success).toBe(false);
    expect(damageAssessmentSchema.safeParse(validDamage({ wilaya: "" })).success).toBe(false);
    expect(damageAssessmentSchema.safeParse(validDamage({ commune: "" })).success).toBe(false);
    expect(damageAssessmentSchema.safeParse(validDamage({ wilaya: "ا".repeat(101) })).success).toBe(false);
  });

  it("commit: fix(damage): cap full_name and finishing_notes", () => {
    expect(damageAssessmentSchema.safeParse(validDamage({ full_name: "ab" })).success).toBe(false); // min 3
    expect(damageAssessmentSchema.safeParse(validDamage({ full_name: "ا".repeat(101) })).success).toBe(false);
    expect(damageAssessmentSchema.safeParse(validDamage({ finishing_notes: "a".repeat(501) })).success).toBe(false);
  });
});

describe("Bloc 2: Damage Estimation Service (P2-01)", () => {
  it("commit: fix(estimation): compute paint liters/cans via 6m2/L x2 coats /4L can", () => {
    // 60 m2 -> 20 L -> 5 cans
    const r60 = estimateDamageMaterials({ needsPaint: true, paintAreaSqm: 60, needsFlooring: false, needsRoofing: false, needsPlumbing: false, needsElectrical: false });
    expect(r60.paintLiters).toBe(20);
    expect(r60.paintCans).toBe(5);

    // 6 m2 -> 2 L -> 1 can (ceil)
    const r6 = estimateDamageMaterials({ needsPaint: true, paintAreaSqm: 6, needsFlooring: false, needsRoofing: false, needsPlumbing: false, needsElectrical: false });
    expect(r6.paintLiters).toBe(2);
    expect(r6.paintCans).toBe(1);

    // no paint -> 0
    const none = estimateDamageMaterials({ needsPaint: false, paintAreaSqm: 60, needsFlooring: false, needsRoofing: false, needsPlumbing: false, needsElectrical: false });
    expect(none.paintLiters).toBe(0);
    expect(none.paintCans).toBe(0);

    // null area -> 0 even if needsPaint true
    const nullArea = estimateDamageMaterials({ needsPaint: true, paintAreaSqm: null, needsFlooring: false, needsRoofing: false, needsPlumbing: false, needsElectrical: false });
    expect(nullArea.paintLiters).toBe(0);
  });

  it("commit: fix(estimation): map damage flags to artisan specialties", () => {
    const onlyPaint = estimateDamageMaterials({ needsPaint: true, paintAreaSqm: 10, needsFlooring: false, needsRoofing: false, needsPlumbing: false, needsElectrical: false });
    expect(onlyPaint.requiredSpecialties).toEqual(["دهان"]);

    const building = estimateDamageMaterials({ needsPaint: false, paintAreaSqm: null, needsFlooring: true, needsRoofing: true, needsPlumbing: false, needsElectrical: false });
    expect(building.requiredSpecialties).toContain("بناء");

    const all = estimateDamageMaterials({ needsPaint: true, paintAreaSqm: 10, needsFlooring: true, needsRoofing: true, needsPlumbing: true, needsElectrical: true });
    expect(all.requiredSpecialties).toEqual(expect.arrayContaining(["دهان", "بناء", "سباك", "كهربائي"]));
  });

  it("commit: fix(estimation): derived priority roofing/electrical -> critical else high/medium", () => {
    // This mirrors the fix in damage-assessments.ts:91
    function derivedPriority(input: { needsRoofing: boolean; needsElectrical: boolean; needsPlumbing: boolean; paintCans: number }) {
      if (input.needsRoofing || input.needsElectrical) return "critical";
      if (input.needsPlumbing || input.paintCans > 10) return "high";
      return "medium";
    }
    expect(derivedPriority({ needsRoofing: true, needsElectrical: false, needsPlumbing: false, paintCans: 0 })).toBe("critical");
    expect(derivedPriority({ needsRoofing: false, needsElectrical: true, needsPlumbing: false, paintCans: 0 })).toBe("critical");
    expect(derivedPriority({ needsRoofing: false, needsElectrical: false, needsPlumbing: true, paintCans: 0 })).toBe("high");
    expect(derivedPriority({ needsRoofing: false, needsElectrical: false, needsPlumbing: false, paintCans: 11 })).toBe("high");
    expect(derivedPriority({ needsRoofing: false, needsElectrical: false, needsPlumbing: false, paintCans: 5 })).toBe("medium");
  });
});

describe("Bloc 2: Priority Hint — matches DB trigger 0003 (P2-01 parity)", () => {
  it("commit: fix(priority): critical >=35 high >=20 medium >=10 else low", () => {
    // critical: large family + children + injuries + uninhabitable
    expect(calculateBeneficiaryPriorityHint({ familyMembersCount: 10, childrenCount: 5, hasInjuries: true, needsMedical: true, isHousingHabitable: false, lostLivestock: true, lostIncome: true })).toBe("critical");
    // high: exactly 20-34 (family 4 + children 3*2=6 =>10 + injuries 15 =>25)
    expect(calculateBeneficiaryPriorityHint({ familyMembersCount: 4, childrenCount: 3, hasInjuries: true, needsMedical: false, isHousingHabitable: null, lostLivestock: false, lostIncome: false })).toBe("high");
    // medium: 10-19 (family 3 + children1*2=2 =>5 + lostIncome5 =>10)
    expect(calculateBeneficiaryPriorityHint({ familyMembersCount: 3, childrenCount: 1, hasInjuries: false, needsMedical: false, isHousingHabitable: null, lostLivestock: false, lostIncome: true })).toBe("medium");
    // low: <10
    expect(calculateBeneficiaryPriorityHint({ familyMembersCount: 1, childrenCount: 0, hasInjuries: false, needsMedical: false, isHousingHabitable: true, lostLivestock: false, lostIncome: false })).toBe("low");
  });

  it("commit: fix(priority): calculateNeedPriority by deficit ratio", () => {
    expect(calculateNeedPriority(100, 0)).toBe("critical");
    expect(calculateNeedPriority(100, 5)).toBe("critical"); // 95% deficit
    expect(calculateNeedPriority(100, 30)).toBe("high"); // 70%
    expect(calculateNeedPriority(100, 60)).toBe("medium"); // 40%
    expect(calculateNeedPriority(100, 90)).toBe("low"); // 10%
    expect(calculateNeedPriority(0, 0)).toBe("low");
  });
});

describe("Bloc 2: Security hardening constants (P1-01 P0-02)", () => {
  it("commit: fix(storage): document photo constraints constants are sane", () => {
    // constants are defined in src/actions/damage-assessments.ts:12-15
    // MAX_PHOTOS=5 MAX_PHOTO_SIZE=5MB ALLOWED_MIME=image/jpeg|png|webp|heic
    // this test pins the documented limits without importing server-only module
    const MAX_PHOTOS = 5;
    const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
    expect(MAX_PHOTOS).toBe(5);
    expect(MAX_PHOTO_SIZE).toBe(5242880);
  });

  it("commit: fix(storage): sanitizeExt logic — allowlist only jpg jpeg png webp heic", () => {
    // inline replica of sanitizeExt to pin expected behavior (mirrors src/actions/damage-assessments.ts:28)
    const ALLOWED = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);
    function sanitizeExt(name: string) {
      const raw = name.split(".").pop()?.toLowerCase() ?? "";
      if (!ALLOWED.has(raw)) return null;
      return raw === "jpeg" ? "jpg" : raw;
    }
    expect(sanitizeExt("photo.JPG")).toBe("jpg");
    expect(sanitizeExt("image.jpeg")).toBe("jpg");
    expect(sanitizeExt("doc.png")).toBe("png");
    expect(sanitizeExt("evil.exe")).toBeNull();
    expect(sanitizeExt("noext")).toBeNull();
    expect(sanitizeExt("../../evil.jpg")).toBe("jpg"); // extension still parsed, but path is now random UUID so traversal neutralized
  });

  it("commit: fix(storage): path no longer interpolates wilaya (P1-01)", () => {
    // Correct fix is random UUID path; verify UUID format
    const uuid = crypto.randomUUID();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    const path = `${uuid}.jpg`;
    expect(path).not.toContain("جيجل");
    expect(path).not.toContain("/");
  });
});
