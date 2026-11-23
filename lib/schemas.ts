import { z } from "zod";

export const ROOMS = [
  "Exterior",
  "Roof",
  "Kitchen",
  "Living Room",
  "Bedroom",
  "Bathroom",
  "Basement",
  "Garage",
  "Yard",
  "Mechanical",
  "Other",
] as const;

export const workItemSchema = z.object({
  task: z.string().describe("Short task label under 10 words, e.g. 'Replace laminate countertops'. No explanations."),
  category: z
    .enum([
      "Flooring",
      "Paint",
      "Kitchen",
      "Bathroom",
      "Roofing",
      "Exterior",
      "Electrical",
      "Plumbing",
      "HVAC",
      "Windows & Doors",
      "Drywall",
      "Landscaping",
      "Other",
    ])
    .describe("Trade category"),
  quantity: z.number().describe("Estimated quantity of material needed"),
  unit: z.string().describe("Unit for the quantity, e.g. 'sq ft', 'each', 'gallon', 'linear ft'"),
  priority: z.enum(["must", "should", "nice"]).describe("must = required to sell, should = expected by buyers, nice = optional upgrade"),
});

export const photoAnalysisSchema = z.object({
  overallCondition: z.number().describe("Overall condition score from 1 (gut rehab) to 5 (move-in ready)"),
  conditionLabel: z.enum(["Gut rehab", "Heavy", "Moderate", "Light cosmetic", "Move-in ready"]),
  summary: z.string().describe("2-4 sentence summary of the property's condition"),
  rooms: z.array(
    z.object({
      room: z.string(),
      conditionScore: z.number().describe("1 (poor) to 5 (excellent)"),
      observations: z.array(z.string()).describe("What is visible in the photos"),
      issues: z.array(z.string()).describe("Defects, damage, or dated finishes"),
      recommendedWork: z.array(workItemSchema),
    }),
  ),
  redFlags: z.array(z.string()).describe("Possible structural, water, mold, electrical, or safety concerns needing a pro inspection"),
});
export type PhotoAnalysis = z.infer<typeof photoAnalysisSchema>;
export type WorkItem = z.infer<typeof workItemSchema>;

export const pricedItemSchema = z.object({
  task: z.string(),
  category: z.string(),
  material: z.string().describe("Material or product category needed for the task"),
  productName: z.string().describe("Exact product name found at the store, or a generic description if estimated"),
  store: z.enum(["Home Depot", "Lowe's", "Estimate"]),
  unitPrice: z.number().describe("Price per unit in USD"),
  unit: z.string(),
  quantity: z.number(),
  url: z.string().describe("Product page URL on homedepot.com or lowes.com, or empty string if estimated"),
  notes: z.string().describe("Short note, e.g. coverage per unit or why it was estimated"),
});
export const rehabPricingSchema = z.object({
  items: z.array(pricedItemSchema),
});
export type PricedItem = z.infer<typeof pricedItemSchema>;

export const compAnalysisSchema = z.object({
  arvLow: z.number(),
  arvMid: z.number(),
  arvHigh: z.number(),
  asIsValue: z.number().describe("Estimated current value in present condition"),
  confidence: z.enum(["low", "medium", "high"]),
  adjustedComps: z.array(
    z.object({
      address: z.string(),
      price: z.number(),
      adjustedPrice: z.number(),
      weight: z.number().describe("Relative weight 0-1 used in the ARV"),
      adjustments: z.array(z.object({ factor: z.string(), amount: z.number() })),
    }),
  ),
  reasoning: z.string().describe("Explanation of how ARV was derived, 1-3 short paragraphs"),
});
export type CompAnalysis = z.infer<typeof compAnalysisSchema>;

export type SubjectProperty = {
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
};

export type Comp = {
  id: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  yearBuilt?: number;
  status?: string;
  price: number;
  listedDate?: string;
  removedDate?: string | null;
  daysOnMarket?: number;
  distance?: number;
  correlation?: number;
  included: boolean;
  manual?: boolean;
};

export type Avm = { price: number; priceRangeLow: number; priceRangeHigh: number };

export type PhotoMeta = { id: string; room: string; createdAt: number };

export type RehabLine = PricedItem & { id: string; checkedAt?: string };

export type DealSettings = {
  laborMultiplier: number;
  contingencyPct: number;
  maoPct: number;
  closingHoldingPct: number;
  purchasePrice: number;
  arvOverride: number | null;
};

export type Deal = {
  id: string;
  address: string;
  createdAt: number;
  updatedAt: number;
  property: SubjectProperty | null;
  avm: Avm | null;
  comps: Comp[];
  photos: PhotoMeta[];
  photoAnalysis: PhotoAnalysis | null;
  workItems: WorkItem[];
  rehab: RehabLine[];
  compAnalysis: CompAnalysis | null;
  settings: DealSettings;
};

export const DEFAULT_SETTINGS: DealSettings = {
  laborMultiplier: 1,
  contingencyPct: 10,
  maoPct: 70,
  closingHoldingPct: 10,
  purchasePrice: 0,
  arvOverride: null,
};
