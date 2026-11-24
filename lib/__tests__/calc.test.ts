import { describe, it, expect } from "vitest";
import { rehabTotals, dealNumbers } from "@/lib/calc";
import type { Deal } from "@/lib/schemas";
import { DEFAULT_SETTINGS } from "@/lib/schemas";

// ─── helpers ────────────────────────────────────────────────────────────────

function makeDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    id: "test-1",
    address: "123 Main St",
    createdAt: 0,
    updatedAt: 0,
    property: null,
    avm: null,
    comps: [],
    photos: [],
    photoAnalysis: null,
    workItems: [],
    rehab: [],
    compAnalysis: null,
    settings: { ...DEFAULT_SETTINGS },
    ...overrides,
  };
}

function rehabLine(unitPrice: number, quantity = 1) {
  return {
    id: `line-${Math.random()}`,
    task: "Task",
    category: "Flooring" as const,
    material: "Mat",
    productName: "Prod",
    store: "Estimate" as const,
    unitPrice,
    unit: "each",
    quantity,
    url: "",
    notes: "",
  };
}

// ─── rehabTotals ─────────────────────────────────────────────────────────────

describe("rehabTotals", () => {
  it("returns all zeros for an empty rehab list", () => {
    const deal = makeDeal();
    const t = rehabTotals(deal);
    expect(t.materials).toBe(0);
    expect(t.labor).toBe(0);
    expect(t.contingency).toBe(0);
    expect(t.total).toBe(0);
  });

  it("sums materials correctly across multiple lines", () => {
    const deal = makeDeal({
      rehab: [rehabLine(100, 3), rehabLine(50, 2)],
    });
    expect(rehabTotals(deal).materials).toBe(400);
  });

  it("applies labor multiplier to materials only", () => {
    const deal = makeDeal({
      rehab: [rehabLine(1000)],
      settings: { ...DEFAULT_SETTINGS, laborMultiplier: 0.5, contingencyPct: 0 },
    });
    const t = rehabTotals(deal);
    expect(t.materials).toBe(1000);
    expect(t.labor).toBe(500);
    expect(t.contingency).toBe(0);
    expect(t.total).toBe(1500);
  });

  it("applies contingency to materials + labor", () => {
    const deal = makeDeal({
      rehab: [rehabLine(1000)],
      settings: { ...DEFAULT_SETTINGS, laborMultiplier: 1, contingencyPct: 10 },
    });
    const t = rehabTotals(deal);
    // materials=1000, labor=1000, contingency=10% of 2000 = 200
    expect(t.materials).toBe(1000);
    expect(t.labor).toBe(1000);
    expect(t.contingency).toBe(200);
    expect(t.total).toBe(2200);
  });

  it("zero labor multiplier means no labor cost", () => {
    const deal = makeDeal({
      rehab: [rehabLine(137_600)],
      settings: { ...DEFAULT_SETTINGS, laborMultiplier: 0, contingencyPct: 0 },
    });
    const t = rehabTotals(deal);
    expect(t.materials).toBe(137_600);
    expect(t.labor).toBe(0);
    expect(t.total).toBe(137_600);
  });
});

// ─── dealNumbers ─────────────────────────────────────────────────────────────

describe("dealNumbers", () => {
  it("ARV falls back to 0 when no data is available", () => {
    const { arv, arvSource } = dealNumbers(makeDeal());
    expect(arv).toBe(0);
    expect(arvSource).toBe("None");
  });

  it("uses AVM price when no comps or override", () => {
    const deal = makeDeal({ avm: { price: 200_000, priceRangeLow: 180_000, priceRangeHigh: 220_000 } });
    const { arv, arvSource } = dealNumbers(deal);
    expect(arv).toBe(200_000);
    expect(arvSource).toBe("RentCast AVM");
  });

  it("prefers compAnalysis arvMid over AVM", () => {
    const deal = makeDeal({
      avm: { price: 200_000, priceRangeLow: 180_000, priceRangeHigh: 220_000 },
      compAnalysis: { arvLow: 210_000, arvMid: 230_000, arvHigh: 250_000, asIsValue: 180_000, confidence: "high", adjustedComps: [], reasoning: "" },
    });
    const { arv, arvSource } = dealNumbers(deal);
    expect(arv).toBe(230_000);
    expect(arvSource).toBe("AI comp analysis");
  });

  it("arvOverride takes top priority", () => {
    const deal = makeDeal({
      avm: { price: 200_000, priceRangeLow: 180_000, priceRangeHigh: 220_000 },
      compAnalysis: { arvLow: 210_000, arvMid: 230_000, arvHigh: 250_000, asIsValue: 180_000, confidence: "high", adjustedComps: [], reasoning: "" },
      settings: { ...DEFAULT_SETTINGS, arvOverride: 275_000 },
    });
    const { arv, arvSource } = dealNumbers(deal);
    expect(arv).toBe(275_000);
    expect(arvSource).toBe("Manual");
  });

  it("MAO = ARV × maoPct% − rehab", () => {
    const deal = makeDeal({
      avm: { price: 300_000, priceRangeLow: 270_000, priceRangeHigh: 330_000 },
      rehab: [rehabLine(50_000)],
      settings: { ...DEFAULT_SETTINGS, maoPct: 70, laborMultiplier: 0, contingencyPct: 0 },
    });
    // ARV=300k, MAO=70%×300k − 50k = 160k
    expect(dealNumbers(deal).mao).toBe(160_000);
  });

  it("profit is null when purchase price is 0", () => {
    const deal = makeDeal({
      avm: { price: 250_000, priceRangeLow: 230_000, priceRangeHigh: 270_000 },
      settings: { ...DEFAULT_SETTINGS, purchasePrice: 0 },
    });
    expect(dealNumbers(deal).profit).toBeNull();
  });

  it("calculates profit correctly", () => {
    // ARV 300k, purchase 165k, rehab 50k (no labor/contingency), closing 10% of ARV = 30k
    // profit = 300k − 165k − 50k − 30k = 55k
    const deal = makeDeal({
      avm: { price: 300_000, priceRangeLow: 270_000, priceRangeHigh: 330_000 },
      rehab: [rehabLine(50_000)],
      settings: {
        ...DEFAULT_SETTINGS,
        purchasePrice: 165_000,
        laborMultiplier: 0,
        contingencyPct: 0,
        closingHoldingPct: 10,
      },
    });
    expect(dealNumbers(deal).profit).toBe(55_000);
  });

  it("ROI is null when purchase price is 0", () => {
    const deal = makeDeal({ avm: { price: 200_000, priceRangeLow: 180_000, priceRangeHigh: 220_000 } });
    expect(dealNumbers(deal).roi).toBeNull();
  });

  it("computes ROI as profit / (purchase + rehab + closing)", () => {
    // profit=55k, purchase=165k, rehab=50k, closing=30k → ROI = 55/(165+50+30) ≈ 0.2245
    const deal = makeDeal({
      avm: { price: 300_000, priceRangeLow: 270_000, priceRangeHigh: 330_000 },
      rehab: [rehabLine(50_000)],
      settings: {
        ...DEFAULT_SETTINGS,
        purchasePrice: 165_000,
        laborMultiplier: 0,
        contingencyPct: 0,
        closingHoldingPct: 10,
      },
    });
    const { roi } = dealNumbers(deal);
    expect(roi).not.toBeNull();
    expect(roi!).toBeCloseTo(55_000 / 245_000, 5);
  });
});
