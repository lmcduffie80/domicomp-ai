import { z } from "zod";
import { requireApiAccess } from "@/lib/require-api";
import { getProperty, getValueWithComps, RentCastError } from "@/lib/rentcast";
import { assertLookupQuota, incrementLookups } from "@/lib/usage";

const bodySchema = z.object({
  address: z.string().min(5),
  maxRadius: z.number().positive().max(10).optional(),
  daysOld: z.number().int().positive().max(1095).optional(),
  compCount: z.number().int().min(5).max(25).optional(),
});

export async function POST(req: Request) {
  const access = await requireApiAccess();
  if ("error" in access) return access.error;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Enter a full address: Street, City, State, Zip" }, { status: 400 });
  }
  const { address, maxRadius = 1, daysOld = 270, compCount = 15 } = parsed.data;

  try {
    await assertLookupQuota(access.orgId, access.entitlements);
    const [property, value] = await Promise.all([
      getProperty(address),
      getValueWithComps(address, { maxRadius, daysOld, compCount }),
    ]);
    await incrementLookups(access.orgId, 1);

    return Response.json({
      property: property ?? value.subject,
      avm: value.avm,
      comps: value.comps,
    });
  } catch (err) {
    const status = err instanceof RentCastError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Property lookup failed";
    return Response.json({ error: message }, { status });
  }
}
