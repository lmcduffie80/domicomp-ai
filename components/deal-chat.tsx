"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { dealNumbers, rehabTotals } from "@/lib/calc";
import type { Deal } from "@/lib/schemas";

const SUGGESTIONS = [
  "Is this a good flip at my purchase price?",
  "Which rehab items give the best return on resale?",
  "What could I cut to lower the rehab budget?",
  "Which comps are the strongest and why?",
];

function dealContext(deal: Deal) {
  return {
    address: deal.address,
    property: deal.property,
    avm: deal.avm,
    comps: deal.comps
      .filter((c) => c.included)
      .map(({ formattedAddress, price, squareFootage, bedrooms, bathrooms, yearBuilt, status, distance }) => ({
        formattedAddress,
        price,
        squareFootage,
        bedrooms,
        bathrooms,
        yearBuilt,
        status,
        distance,
      })),
    condition: deal.photoAnalysis && {
      label: deal.photoAnalysis.conditionLabel,
      summary: deal.photoAnalysis.summary,
      redFlags: deal.photoAnalysis.redFlags,
    },
    compAnalysis: deal.compAnalysis && {
      arvLow: deal.compAnalysis.arvLow,
      arvMid: deal.compAnalysis.arvMid,
      arvHigh: deal.compAnalysis.arvHigh,
      asIsValue: deal.compAnalysis.asIsValue,
      reasoning: deal.compAnalysis.reasoning,
    },
    rehabLines: deal.rehab.map(({ task, productName, store, unitPrice, quantity, unit }) => ({
      task,
      productName,
      store,
      unitPrice,
      quantity,
      unit,
    })),
    rehabTotals: rehabTotals(deal),
    settings: deal.settings,
    numbers: dealNumbers(deal),
  };
}

export function DealChat({ deal }: { deal: Deal }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status, stop, error } = useChat({
    id: deal.id,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send(text: string) {
    if (!text.trim() || busy) return;
    sendMessage({ text }, { body: { deal: dealContext(deal) } });
    setInput("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ask about this deal</CardTitle>
        <CardDescription>The AI sees your comps, condition report, rehab budget, and numbers.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div ref={scrollRef} className="grid max-h-[28rem] min-h-40 content-start gap-3 overflow-y-auto rounded-lg border p-3 text-sm">
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border px-3 py-1.5 text-left text-xs hover:bg-muted">
                  {s}
                </button>
              ))}
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[90%] whitespace-pre-wrap rounded-lg px-3 py-2 leading-relaxed ${
                m.role === "user" ? "justify-self-end bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {m.parts.map((part, i) => (part.type === "text" ? <span key={i}>{part.text}</span> : null))}
            </div>
          ))}
          {status === "submitted" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          {error && <p className="text-destructive">Something went wrong: {error.message}</p>}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Input className="h-10" placeholder="Ask a question…" value={input} onChange={(e) => setInput(e.target.value)} />
          {busy ? (
            <Button type="button" variant="outline" className="h-10" onClick={() => stop()} aria-label="Stop">
              <Square />
            </Button>
          ) : (
            <Button type="submit" className="h-10" aria-label="Send" disabled={!input.trim()}>
              <Send />
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
