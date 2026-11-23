import "server-only";
import { openai } from "@ai-sdk/openai";

export const model = openai(process.env.OPENAI_MODEL ?? "gpt-6-astra");

export function aiErrorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "AI request failed";
  console.error("[ai]", message);
  return Response.json({ error: message }, { status: 500 });
}
