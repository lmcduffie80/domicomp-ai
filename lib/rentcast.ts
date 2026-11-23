import "server-only";
import type { Avm, Comp, SubjectProperty } from "@/lib/schemas";

const BASE_URL = "https://api.rentcast.io/v1";

export class RentCastError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function rentcast<T>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey) {
    throw new RentCastError("RENTCAST_API_KEY is not set. Add it to .env.local and restart the dev server.", 500);
  }

  const url = new URL(BASE_URL + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    headers: { "X-Api-Key": apiKey, Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new RentCastError(`RentCast ${path} failed (${res.status}): ${body.slice(0, 300)}`, res.status);
  }
  return res.json() as Promise<T>;
}

type RentCastProperty = SubjectProperty & { id: string };

type RentCastAvmResponse = {
  price: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  subjectProperty?: RentCastProperty;
  comparables?: Array<Omit<Comp, "included">>;
};

export async function getProperty(address: string): Promise<SubjectProperty | null> {
  try {
    const records = await rentcast<RentCastProperty[]>("/properties", { address });
    return records[0] ?? null;
  } catch (err) {
    if (err instanceof RentCastError && err.status === 404) return null;
    throw err;
  }
}

export async function getValueWithComps(
  address: string,
  opts: { maxRadius?: number; daysOld?: number; compCount?: number },
): Promise<{ avm: Avm; subject: SubjectProperty | null; comps: Comp[] }> {
  const data = await rentcast<RentCastAvmResponse>("/avm/value", {
    address,
    maxRadius: opts.maxRadius,
    daysOld: opts.daysOld,
    compCount: opts.compCount,
  });

  return {
    avm: { price: data.price, priceRangeLow: data.priceRangeLow, priceRangeHigh: data.priceRangeHigh },
    subject: data.subjectProperty ?? null,
    comps: (data.comparables ?? []).map((c) => ({ ...c, included: true })),
  };
}
