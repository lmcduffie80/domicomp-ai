export type WorkItem = {
  task: string;
  category: string;
  quantity: number;
  unit: string;
  priority: "must" | "should" | "nice";
};

export type PricedItem = {
  task: string;
  category: string;
  material: string;
  productName: string;
  store: "Home Depot" | "Lowe's" | "Estimate";
  unitPrice: number;
  unit: string;
  quantity: number;
  url: string;
  notes: string;
};

export type RehabLine = PricedItem & { id: string; checkedAt?: string };

export type DealSettings = {
  laborMultiplier: number;
  contingencyPct: number;
  maoPct: number;
  closingHoldingPct: number;
  purchasePrice: number;
  arvOverride: number | null;
};

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
};

export type Comp = {
  id: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
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
  included: boolean;
  manual?: boolean;
};

export type Avm = { price: number; priceRangeLow: number; priceRangeHigh: number };

export type PhotoMeta = { id: string; room: string; createdAt: number };

export type PhotoAnalysis = {
  overallCondition: number;
  conditionLabel: string;
  summary: string;
  rooms: { room: string; conditionScore: number; observations: string[]; issues: string[]; recommendedWork: WorkItem[] }[];
  redFlags: string[];
};

export type CompAnalysis = {
  arvLow: number;
  arvMid: number;
  arvHigh: number;
  asIsValue: number;
  confidence: "low" | "medium" | "high";
  adjustedComps: { address: string; price: number; adjustedPrice: number; weight: number; adjustments: { factor: string; amount: number }[] }[];
  reasoning: string;
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

export const ROOMS = ["Exterior","Roof","Kitchen","Living Room","Bedroom","Bathroom","Basement","Garage","Yard","Mechanical","Other"] as const;
export type Room = typeof ROOMS[number];
