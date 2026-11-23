import { generateText, Output } from "ai";
import { z } from "zod";
import { compAnalysisSchema } from "@/lib/schemas";
import { requireApiAccess } from "@/lib/require-api";
import { aiErrorResponse, model } from "@/lib/ai";

export const maxDuration = 120;

const bodySchema = z.object({
  property: z.record(z.string(), z.unknown()).nullable(),
  avm: z.object({ price: z.number(), priceRangeLow: z.number(), priceRangeHigh: z.number() }).nullable(),
  comps: z.array(z.record(z.string(), z.unknown())).min(1),
  condition: z
    .object({ conditionLabel: z.string(), overallCondition: z.number(), summary: z.string() })
    .nullable(),
  plannedWork: z.array(z.string()),
});

export async function POST(req: Request) {
  const access = await requireApiAccess();
  if ("error" in access) return access.error;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Include at least one comp to analyze" }, { status: 400 });
  }
  const { property, avm, comps, condition, plannedWork } = parsed.data;

  try {
    const { output } = await generateText({
      model,
      instructions:
        "You are a residential appraiser helping a fix-and-flip investor. Using the comparable listings provided, estimate " +
        "the after-repair value (ARV) assuming the planned rehab is completed to neighborhood standard, and the as-is value " +
        "given current condition. Make explicit dollar adjustments for differences in square footage, beds, baths, age, " +
        "distance, recency, and listing status (Active list prices typically sell below list; Inactive listings are likely sold " +
        "or withdrawn). Comps' condition is unknown; assume typical. Be conservative and explain your reasoning plainly.",
      prompt: JSON.stringify({ subjectProperty: property, rentcastAvm: avm, currentCondition: condition, plannedWork, comps }),
      output: Output.object({ schema: compAnalysisSchema }),
    });

    return Response.json(output);
  } catch (err) {
    return aiErrorResponse(err);
  }
}
