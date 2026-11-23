import { generateText, Output } from "ai";
import { z } from "zod";
import { photoAnalysisSchema } from "@/lib/schemas";
import { requireApiAccess } from "@/lib/require-api";
import { aiErrorResponse, model } from "@/lib/ai";

export const maxDuration = 120;

const bodySchema = z.object({
  photos: z
    .array(z.object({ room: z.string(), dataUrl: z.string().startsWith("data:image/") }))
    .min(1)
    .max(30),
  property: z
    .object({
      formattedAddress: z.string().optional(),
      squareFootage: z.number().optional(),
      bedrooms: z.number().optional(),
      bathrooms: z.number().optional(),
      yearBuilt: z.number().optional(),
    })
    .nullable()
    .optional(),
});

export async function POST(req: Request) {
  const access = await requireApiAccess();
  if ("error" in access) return access.error;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Upload at least one photo" }, { status: 400 });
  }
  const { photos, property } = parsed.data;

  const facts = property
    ? `Property facts: ${JSON.stringify(property)}. Use the square footage to size flooring, paint, and drywall quantities.`
    : "No property facts are available; estimate quantities for a typical 1,500 sq ft house.";

  try {
    const { output } = await generateText({
      model,
      instructions:
        "You are an experienced residential rehab estimator and home inspector working for a real estate investor. " +
        "Assess condition from photos, flag risks honestly, and propose a practical rehab scope that brings the house to typical " +
        "neighborhood resale standard (not luxury). Quantities should be realistic material quantities.",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `${facts}\nAnalyze these ${photos.length} photos. Each photo is preceded by its room label.` },
            ...photos.flatMap((p, i) => [
              { type: "text" as const, text: `Photo ${i + 1} - ${p.room}` },
              { type: "file" as const, mediaType: "image", data: p.dataUrl },
            ]),
          ],
        },
      ],
      output: Output.object({ schema: photoAnalysisSchema }),
    });

    return Response.json(output);
  } catch (err) {
    return aiErrorResponse(err);
  }
}
