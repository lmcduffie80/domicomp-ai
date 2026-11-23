import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage } from "ai";
import { model } from "@/lib/ai";
import { requireApiAccess } from "@/lib/require-api";

export const maxDuration = 60;

export async function POST(req: Request) {
  const access = await requireApiAccess();
  if ("error" in access) return access.error;

  const { messages, deal }: { messages: UIMessage[]; deal?: unknown } = await req.json();

  const result = streamText({
    model,
    instructions:
      "You are DomiComp AI, a pragmatic real estate investment analyst for fix-and-flip and buy-and-hold investors. " +
      "Answer using the deal data below. Be specific with numbers, show quick math when useful, call out risks, and keep " +
      "answers concise and skimmable. Use plain text with short paragraphs or simple dashes for lists; no markdown headers or tables. " +
      "If data is missing, say what the user should add.\n\nCurrent deal data (JSON):\n" +
      JSON.stringify(deal ?? {}),
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
