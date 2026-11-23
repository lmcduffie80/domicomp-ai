import type { Deal } from "@/lib/schemas";

export type UpdateDeal = (fn: (deal: Deal) => Deal) => void;
