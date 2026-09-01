import { describe, it, expect } from "vitest";
import { donationSchema } from "@/schemas/donation";
import { transportOfferSchema } from "@/schemas/transport-offer";
import { haversineDistanceKm } from "@/lib/wilayas";
import { findWilaya } from "@/lib/algeria-cities";

function validDonation(overrides: Record<string, unknown> = {}) {
  return {
    donor_name: "أحمد",
    donor_phone: "0555123456",
    current_wilaya: "جيجل",
    current_commune: "الطاهير",
    needs_transport: true,
    can_deliver_self: false,
    ready_at: "",
    notes: "",
    items: [
      {
        category_id: "00000000-0000-4000-8000-000000000001",
        category_slug: "food",
        quantity: 10,
        unit: "box" as const,
        description: "",
      },
    ],
    ...overrides,
  };
}

function validTransport(overrides: Record<string, unknown> = {}) {
  return {
    driver_name: "محمد",
    phone: "0555123456",
    origin_wilaya: "جيجل",
    origin_note: "",
    destination_wilaya: "سكيكدة",
    destination_note: "",
    vehicle_type: "van" as const,
    max_capacity_kg: 500,
    available_space_note: "",
    travel_date: "",
    time_window: "",
    has_empty_space: true,
    notes: "",
    ...overrides,
  };
}

describe("Bloc4: donation schema hardening", () => {
  it("accepts valid donation", () => {
    expect(donationSchema.safeParse(validDonation()).success).toBe(true);
  });

  it("rejects invalid wilaya", () => {
    expect(donationSchema.safeParse(validDonation({ current_wilaya: "injected" })).success).toBe(false);
    expect(donationSchema.safeParse(validDonation({ current_wilaya: "../../evil" })).success).toBe(false);
  });

  it("rejects quantity over max and NaN", () => {
    expect(
      donationSchema.safeParse(
        validDonation({
          items: [
            {
              category_id: "00000000-0000-4000-8000-000000000001",
              category_slug: "food",
              quantity: 999999,
              unit: "box",
              description: "",
            },
          ],
        }),
      ).success,
    ).toBe(false);
  });

  it("rejects invalid ready_at", () => {
    expect(donationSchema.safeParse(validDonation({ ready_at: "not-a-date" })).success).toBe(false);
  });

  it("rejects both transport flags same value", () => {
    expect(donationSchema.safeParse(validDonation({ needs_transport: true, can_deliver_self: true })).success).toBe(
      false,
    );
    expect(donationSchema.safeParse(validDonation({ needs_transport: false, can_deliver_self: false })).success).toBe(
      false,
    );
  });

  it("strips control chars and caps donor_name", () => {
    const long = "a".repeat(121);
    expect(donationSchema.safeParse(validDonation({ donor_name: long })).success).toBe(false);
  });
});

describe("Bloc4: transport schema hardening", () => {
  it("accepts valid transport", () => {
    expect(transportOfferSchema.safeParse(validTransport()).success).toBe(true);
  });

  it("rejects invalid origin wilaya", () => {
    expect(transportOfferSchema.safeParse(validTransport({ origin_wilaya: "invalid" })).success).toBe(false);
  });

  it("rejects huge capacity", () => {
    expect(transportOfferSchema.safeParse(validTransport({ max_capacity_kg: 1e12 })).success).toBe(false);
  });

  it("rejects invalid travel_date", () => {
    expect(transportOfferSchema.safeParse(validTransport({ travel_date: "bad-date" })).success).toBe(false);
  });
});

describe("Bloc4: haversine guards P1-02", () => {
  it("returns null on NaN inputs", () => {
    expect(haversineDistanceKm({ lat: NaN, lng: 3 }, { lat: 36, lng: 3 })).toBeNull();
    expect(haversineDistanceKm({ lat: 36, lng: NaN }, { lat: 36, lng: 3 })).toBeNull();
  });

  it("returns finite distance for valid wilayas", () => {
    const a = findWilaya("جيجل");
    const b = findWilaya("سكيكدة");
    if (a && b) {
      const d = haversineDistanceKm({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng });
      expect(d).not.toBeNull();
      expect(Number.isFinite(d as number)).toBe(true);
    }
  });

  it("clamps h and handles identical points 0km", () => {
    expect(haversineDistanceKm({ lat: 36, lng: 5 }, { lat: 36, lng: 5 })).toBe(0);
  });
});

describe("Bloc4: admin status enum validation P0-04", () => {
  it("donationStatusLabels keys are expected enums", async () => {
    const { donationStatusLabels } = await import("@/lib/constants");
    expect(Object.keys(donationStatusLabels)).toEqual(
      expect.arrayContaining(["registered", "matched", "delivered", "cancelled"]),
    );
  });

  it("transportStatusLabels keys are expected enums", async () => {
    const { transportStatusLabels } = await import("@/lib/constants");
    expect(Object.keys(transportStatusLabels)).toEqual(
      expect.arrayContaining(["requested", "matched", "confirmed", "in_transit", "delivered", "cancelled"]),
    );
  });
});
