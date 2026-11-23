import type { Deal } from "@/lib/schemas";

export function rehabTotals(deal: Deal) {
  const materials = deal.rehab.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const labor = materials * deal.settings.laborMultiplier;
  const contingency = (materials + labor) * (deal.settings.contingencyPct / 100);
  return { materials, labor, contingency, total: materials + labor + contingency };
}

export function dealNumbers(deal: Deal) {
  const rehab = rehabTotals(deal).total;
  const arv = deal.settings.arvOverride ?? deal.compAnalysis?.arvMid ?? deal.avm?.price ?? 0;
  const arvSource = deal.settings.arvOverride != null ? "Manual" : deal.compAnalysis ? "AI comp analysis" : deal.avm ? "RentCast AVM" : "None";
  const mao = arv * (deal.settings.maoPct / 100) - rehab;
  const closingHolding = arv * (deal.settings.closingHoldingPct / 100);
  const purchase = deal.settings.purchasePrice;
  const profit = purchase > 0 ? arv - purchase - rehab - closingHolding : null;
  const roi = profit != null && purchase + rehab > 0 ? profit / (purchase + rehab + closingHolding) : null;
  return { arv, arvSource, rehab, mao, closingHolding, purchase, profit, roi };
}
