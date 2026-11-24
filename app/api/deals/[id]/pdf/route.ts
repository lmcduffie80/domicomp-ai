import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireApiAccess } from "@/lib/require-api";
import { getDb } from "@/lib/db";
import { deals } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { DealReportPDF } from "@/lib/deal-pdf";
import type { Deal } from "@/lib/schemas";
import { createElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement, JSXElementConstructor } from "react";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireApiAccess();
  if ("error" in access) return access.error;

  const { id } = await params;
  const db = getDb();

  const [row] = await db
    .select()
    .from(deals)
    .where(and(eq(deals.id, id), eq(deals.orgId, access.orgId)));

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const deal = row.payload as Deal;
  const generatedAt = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const element = createElement(DealReportPDF, { deal, generatedAt }) as ReactElement<DocumentProps, string | JSXElementConstructor<unknown>>;
  const buffer = await renderToBuffer(element);

  const slug = (deal.address || "deal-report")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slug}.pdf"`,
    },
  });
}
