import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { dealNumbers, rehabTotals } from "@/lib/calc";
import type { Deal } from "@/lib/schemas";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff", fontWeight: 700 },
  ],
});

const GREEN = "#0d1f17";
const ACCENT = "#0f6b4f";
const LIGHT = "#f8fafc";
const BORDER = "#e2e8f0";
const MUTED = "#64748b";

const s = StyleSheet.create({
  page: { fontFamily: "Inter", fontSize: 9, color: "#0f172a", backgroundColor: "#fff", padding: 0 },
  header: { backgroundColor: GREEN, padding: "24 32 20", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 16, fontWeight: 700, color: "#fff" },
  headerSub: { fontSize: 9, color: "#6ee7b7", marginTop: 2 },
  headerDate: { fontSize: 8, color: "#6ee7b7", textAlign: "right" },
  body: { padding: "20 32 32" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 10, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 4 },
  row2: { flexDirection: "row", gap: 12 },
  card: { flex: 1, backgroundColor: LIGHT, borderRadius: 6, padding: "10 12" },
  cardLabel: { fontSize: 7.5, color: MUTED, marginBottom: 2 },
  cardValue: { fontSize: 13, fontWeight: 700, color: GREEN },
  cardHint: { fontSize: 7, color: MUTED, marginTop: 1 },
  highlightCard: { flex: 1, backgroundColor: GREEN, borderRadius: 6, padding: "10 12" },
  highlightLabel: { fontSize: 7.5, color: "#6ee7b7", marginBottom: 2 },
  highlightValue: { fontSize: 13, fontWeight: 700, color: "#fff" },
  highlightHint: { fontSize: 7, color: "#86efac", marginTop: 1 },
  tableHeader: { flexDirection: "row", backgroundColor: GREEN, borderRadius: "4 4 0 0", padding: "5 8" },
  tableHeaderCell: { fontSize: 7.5, fontWeight: 700, color: "#fff" },
  tableRow: { flexDirection: "row", padding: "5 8", borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRowAlt: { flexDirection: "row", padding: "5 8", backgroundColor: LIGHT, borderBottomWidth: 1, borderBottomColor: BORDER },
  cell: { fontSize: 8, color: "#0f172a" },
  cellMuted: { fontSize: 8, color: MUTED },
  disclaimer: { marginTop: 20, fontSize: 7, color: MUTED, lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 20, left: 32, right: 32, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: MUTED },
});

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
function pct(n: number) { return `${n.toFixed(1)}%`; }

export function DealReportPDF({ deal, generatedAt }: { deal: Deal; generatedAt: string }) {
  const n = dealNumbers(deal);
  const r = rehabTotals(deal);
  const p = deal.property;
  const includedComps = deal.comps.filter((c) => c.included);

  return (
    <Document title={`DomiComp AI — ${deal.address || "Deal Report"}`} author="DomiComp AI">
      <Page size="LETTER" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>DomiComp AI</Text>
            <Text style={s.headerSub}>Deal Analysis Report</Text>
          </View>
          <View>
            <Text style={[s.headerDate, { fontSize: 10, fontWeight: 700, color: "#fff" }]}>{deal.address || "Untitled deal"}</Text>
            <Text style={s.headerDate}>Generated {generatedAt}</Text>
          </View>
        </View>

        <View style={s.body}>

          {/* ── Property details ── */}
          {p && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Subject Property</Text>
              <View style={s.row2}>
                {[
                  { label: "Address", value: p.formattedAddress ?? deal.address },
                  { label: "Beds / Baths", value: `${p.bedrooms ?? "?"} bd / ${p.bathrooms ?? "?"} ba` },
                  { label: "Living Area", value: p.squareFootage ? `${p.squareFootage.toLocaleString()} sq ft` : "—" },
                  { label: "Year Built", value: p.yearBuilt ? String(p.yearBuilt) : "—" },
                ].map(({ label, value }) => (
                  <View key={label} style={s.card}>
                    <Text style={s.cardLabel}>{label}</Text>
                    <Text style={{ fontSize: 9, fontWeight: 700, color: GREEN }}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Deal numbers ── */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Deal Numbers</Text>
            <View style={s.row2}>
              <View style={s.card}>
                <Text style={s.cardLabel}>After-Repair Value (ARV)</Text>
                <Text style={s.cardValue}>{money(n.arv)}</Text>
                <Text style={s.cardHint}>Source: {n.arvSource}</Text>
              </View>
              <View style={s.card}>
                <Text style={s.cardLabel}>Rehab Budget</Text>
                <Text style={s.cardValue}>{money(n.rehab)}</Text>
                <Text style={s.cardHint}>{deal.rehab.length} line items</Text>
              </View>
              <View style={s.highlightCard}>
                <Text style={s.highlightLabel}>Max Offer ({deal.settings.maoPct}% rule)</Text>
                <Text style={s.highlightValue}>{money(n.mao)}</Text>
                <Text style={s.highlightHint}>{deal.settings.maoPct}% × ARV − rehab</Text>
              </View>
              {n.profit != null && (
                <View style={[s.card, { borderLeftWidth: 3, borderLeftColor: n.profit >= 0 ? "#16a34a" : "#dc2626" }]}>
                  <Text style={s.cardLabel}>Est. Profit</Text>
                  <Text style={[s.cardValue, { color: n.profit >= 0 ? "#16a34a" : "#dc2626" }]}>{money(n.profit)}</Text>
                  {n.roi != null && <Text style={s.cardHint}>ROI: {pct(n.roi * 100)}</Text>}
                </View>
              )}
            </View>
          </View>

          {/* ── Comps ── */}
          {includedComps.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Comparable Sales ({includedComps.length} included)</Text>
              <View style={s.tableHeader}>
                {["Address", "Sale Price", "Sq Ft", "$/SqFt", "Beds/Ba", "Status"].map((h, i) => (
                  <Text key={h} style={[s.tableHeaderCell, { flex: i === 0 ? 3 : 1 }]}>{h}</Text>
                ))}
              </View>
              {includedComps.map((c, i) => (
                <View key={c.id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.cell, { flex: 3 }]}>{c.formattedAddress?.split(",")[0] ?? "—"}</Text>
                  <Text style={[s.cell, { flex: 1 }]}>{money(c.price ?? 0)}</Text>
                  <Text style={[s.cell, { flex: 1 }]}>{c.squareFootage?.toLocaleString() ?? "—"}</Text>
                  <Text style={[s.cell, { flex: 1 }]}>{c.price && c.squareFootage ? `$${Math.round(c.price / c.squareFootage)}` : "—"}</Text>
                  <Text style={[s.cell, { flex: 1 }]}>{c.bedrooms ?? "?"}/{c.bathrooms ?? "?"}</Text>
                  <Text style={[s.cellMuted, { flex: 1 }]}>{c.status ?? "—"}</Text>
                </View>
              ))}
              {deal.compAnalysis && (
                <View style={{ flexDirection: "row", padding: "6 8", backgroundColor: "#f0fdf4", borderRadius: "0 0 4 4" }}>
                  <Text style={{ fontSize: 8, color: ACCENT, fontWeight: 700 }}>AI ARV estimate: </Text>
                  <Text style={{ fontSize: 8, color: ACCENT }}>{money(deal.compAnalysis.arvLow)} – {money(deal.compAnalysis.arvHigh)} (mid: {money(deal.compAnalysis.arvMid)})</Text>
                </View>
              )}
            </View>
          )}

          {/* ── Rehab ── */}
          {deal.rehab.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Rehab Budget</Text>
              <View style={s.tableHeader}>
                {["Task", "Category", "Qty", "Unit", "Unit Price", "Total"].map((h, i) => (
                  <Text key={h} style={[s.tableHeaderCell, { flex: i === 0 ? 3 : i === 1 ? 2 : 1 }]}>{h}</Text>
                ))}
              </View>
              {deal.rehab.map((l, i) => (
                <View key={l.id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.cell, { flex: 3 }]}>{l.task}</Text>
                  <Text style={[s.cellMuted, { flex: 2 }]}>{l.category}</Text>
                  <Text style={[s.cell, { flex: 1 }]}>{l.quantity}</Text>
                  <Text style={[s.cellMuted, { flex: 1 }]}>{l.unit}</Text>
                  <Text style={[s.cell, { flex: 1 }]}>{money(l.unitPrice)}</Text>
                  <Text style={[s.cell, { flex: 1, fontWeight: 700 }]}>{money(l.unitPrice * l.quantity)}</Text>
                </View>
              ))}
              <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: "6 8", backgroundColor: GREEN, borderRadius: "0 0 4 4" }}>
                <Text style={{ fontSize: 8, color: "#fff", fontWeight: 700 }}>Materials: {money(r.materials)}  |  Labor: {money(r.labor)}  |  Contingency: {money(r.contingency)}  |  Total: {money(r.total)}</Text>
              </View>
            </View>
          )}

          {/* ── Photo analysis ── */}
          {deal.photoAnalysis && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>AI Photo Analysis</Text>
              <View style={[s.card, { marginBottom: 8 }]}>
                <Text style={{ fontSize: 9, fontWeight: 700, marginBottom: 3 }}>
                  Overall Condition: {deal.photoAnalysis.conditionLabel} ({deal.photoAnalysis.overallCondition}/5)
                </Text>
                <Text style={{ fontSize: 8, color: MUTED, lineHeight: 1.5 }}>{deal.photoAnalysis.summary}</Text>
              </View>
              {deal.photoAnalysis.redFlags.length > 0 && (
                <View style={{ backgroundColor: "#fef2f2", borderRadius: 4, padding: "6 8", borderLeftWidth: 3, borderLeftColor: "#dc2626" }}>
                  <Text style={{ fontSize: 8, fontWeight: 700, color: "#dc2626", marginBottom: 4 }}>⚠ Red flags requiring inspection</Text>
                  {deal.photoAnalysis.redFlags.map((f, i) => (
                    <Text key={i} style={{ fontSize: 8, color: "#7f1d1d", marginBottom: 2 }}>• {f}</Text>
                  ))}
                </View>
              )}
            </View>
          )}

          <Text style={s.disclaimer}>
            This report is for informational purposes only. DomiComp AI estimates are based on public records and AI analysis. Always verify comps with a licensed agent or appraiser and obtain contractor bids before making an offer. Powered by Agrovus, LLC.
          </Text>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>DomiComp AI · Powered by Agrovus, LLC</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
}
