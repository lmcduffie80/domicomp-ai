import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import { rehabPricingSchema, workItemSchema } from "@/lib/schemas";
import { requireApiAccess } from "@/lib/require-api";
import { aiErrorResponse, model } from "@/lib/ai";

export const maxDuration = 300;

const bodySchema = z.object({
  workItems: z.array(workItemSchema).min(1).max(40),
  location: z
    .object({ city: z.string().optional(), state: z.string().optional(), zipCode: z.string().optional() })
    .optional(),
});

const stripCitations = (text: string) => text.replace(/\s*\(\[[^\]]*\]\([^)]*\)\)/g, "").trim();

export async function POST(req: Request) {
  const access = await requireApiAccess();
  if ("error" in access) return access.error;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Add at least one rehab task to price" }, { status: 400 });
  }
  const { workItems, location } = parsed.data;
  const where = [location?.city, location?.state, location?.zipCode].filter(Boolean).join(", ");

  try {
    const { output, sources } = await generateText({
      model,
      instructions:
        "You are a construction materials estimator. For each rehab task, search homedepot.com and lowes.com for a mid-grade, " +
        "investor-appropriate product and report its current listed price. Convert to the task's unit when needed " +
        "(e.g. flooring price per sq ft, paint per gallon with coverage of ~350 sq ft per gallon). " +
        "Only list a store and URL if you actually found that product page in search results. If you cannot find a price, " +
        "set store to 'Estimate', url to '', and give a realistic big-box price. Price materials only, not labor. " +
        "One line per task; split a task into multiple lines only when it clearly needs distinct materials.",
      prompt:
        `Location: ${where || "United States"}\n` +
        `Rehab tasks (JSON):\n${JSON.stringify(workItems)}`,
      tools: {
        web_search: openai.tools.webSearch({
          searchContextSize: "medium",
          filters: { allowedDomains: ["homedepot.com", "lowes.com"] },
          userLocation: {
            type: "approximate",
            country: "US",
            city: location?.city,
            region: location?.state,
          },
        }),
      },
      output: Output.object({ schema: rehabPricingSchema }),
    });

    return Response.json({
      items: output.items.map((item) => ({ ...item, notes: stripCitations(item.notes) })),
      sources: sources.flatMap((s) => (s.sourceType === "url" ? [s.url] : [])),
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return aiErrorResponse(err);
  }
}
