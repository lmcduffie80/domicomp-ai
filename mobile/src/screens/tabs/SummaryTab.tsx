import { useState, useRef, useEffect } from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import type { Deal } from "@/lib/schemas";
import { dealNumbers } from "@/lib/calc";
import { money } from "@/lib/format";

interface Props {
  deal: Deal;
  onChange: (d: Deal) => void;
  onSave: (d: Deal) => Promise<void>;
  api: ReturnType<typeof import("@/lib/api").makeApi>;
}

const CHIPS = [
  "Is this a good deal?",
  "What's the max I should pay?",
  "Walk me through the numbers",
  "What are the biggest risks?",
  "Compare ARV approaches",
];

function NumberCard({ label, value, sub, positive, highlight }: { label: string; value: string; sub?: string; positive?: boolean | null; highlight?: boolean }) {
  if (highlight) return (
    <div className="col-span-2 rounded-2xl bg-gradient-to-br from-green-800 to-green-900 shadow-md p-4">
      <p className="text-xs text-green-300 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-2xl font-extrabold mt-1 text-white">{value}</p>
      {sub && <p className="text-xs text-green-300 mt-0.5">{sub}</p>}
    </div>
  );
  const color = positive == null ? "text-slate-900" : positive ? "text-green-700" : "text-red-600";
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
      <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">{label}</p>
      <p className={`text-lg font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function SettingRow({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState(value != null ? String(value) : "");

  function commit() {
    const n = raw === "" ? null : parseFloat(raw.replace(/[^0-9.]/g, ""));
    onChange(isNaN(n as number) ? null : n);
    setEditing(false);
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <p className="text-sm text-gray-700">{label}</p>
      {editing ? (
        <input
          autoFocus
          value={raw}
          onChange={e => setRaw(e.target.value)}
          onBlur={commit}
          onKeyDown={e => e.key === "Enter" && commit()}
          className="w-28 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-green-700"
        />
      ) : (
        <button onClick={() => { setRaw(value != null ? String(value) : ""); setEditing(true); }} className="text-sm font-medium text-green-700 underline underline-offset-2">
          {value != null ? value : "—"}
        </button>
      )}
    </div>
  );
}

function getTextContent(msg: UIMessage): string {
  for (const part of msg.parts ?? []) {
    if (typeof part === "object" && part !== null && "type" in part && part.type === "text" && "text" in part) {
      return String(part.text);
    }
  }
  return "";
}

export function SummaryTab({ deal, onChange, onSave, api }: Props) {
  const nums = dealNumbers(deal);
  const chatRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const authHeader = api.authHeader() as Record<string, string>;

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: api.chatUrl(),
      headers: authHeader,
      body: { dealId: deal.id },
      credentials: "include",
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function updateSettings(patch: Partial<Deal["settings"]>) {
    const updated: Deal = { ...deal, settings: { ...deal.settings, ...patch } };
    onChange(updated);
    await onSave(updated);
  }

  function handleSend(text: string) {
    if (!text.trim() || isLoading) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable numbers + settings + chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatRef}>
        {/* Deal numbers */}
        <div className="grid grid-cols-2 gap-3">
          <NumberCard label="Max Offer" value={money(nums.mao)} sub={`${deal.settings.maoPct}% rule`} highlight />
          <NumberCard label="ARV" value={money(nums.arv)} sub={nums.arvSource} />
          <NumberCard label="Rehab Budget" value={money(nums.rehab)} />
          <NumberCard label="Closing/Holding" value={money(nums.closingHolding)} sub={`${deal.settings.closingHoldingPct}%`} />
          {nums.profit != null && (
            <NumberCard label="Est. Profit" value={money(nums.profit)} positive={nums.profit > 0} />
          )}
          {nums.roi != null && (
            <NumberCard label="ROI" value={`${(nums.roi * 100).toFixed(1)}%`} positive={nums.roi > 0} />
          )}
        </div>

        {/* Settings */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Deal Settings</p>
          <SettingRow label="Purchase Price" value={deal.settings.purchasePrice || null} onChange={v => updateSettings({ purchasePrice: v ?? 0 })} />
          <SettingRow label="ARV Override ($)" value={deal.settings.arvOverride} onChange={v => updateSettings({ arvOverride: v })} />
          <SettingRow label="MAO %" value={deal.settings.maoPct} onChange={v => updateSettings({ maoPct: v ?? 70 })} />
          <SettingRow label="Closing/Holding %" value={deal.settings.closingHoldingPct} onChange={v => updateSettings({ closingHoldingPct: v ?? 10 })} />
          <SettingRow label="Labor Multiplier" value={deal.settings.laborMultiplier} onChange={v => updateSettings({ laborMultiplier: v ?? 1 })} />
          <SettingRow label="Contingency %" value={deal.settings.contingencyPct} onChange={v => updateSettings({ contingencyPct: v ?? 10 })} />
        </div>

        {/* Chat messages */}
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">🤖</p>
              <p className="text-sm">Ask me anything about this deal</p>
            </div>
          )}
          {messages.map((m) => {
            const text = getTextContent(m);
            if (!text) return null;
            return (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-green-800 flex-shrink-0 flex items-center justify-center text-white text-xs mr-2">AI</div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-green-800 text-white rounded-br-sm"
                    : "bg-gray-50 border border-gray-100 text-gray-900 rounded-bl-sm"
                }`}>
                  {text}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-green-800 flex-shrink-0 flex items-center justify-center text-white text-xs mr-2">AI</div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion chips */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pb-2">
            {CHIPS.map(chip => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="text-xs bg-white border border-gray-200 text-gray-700 rounded-full px-3 py-2 hover:bg-green-50 hover:border-green-200 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat input */}
      <div className="border-t border-gray-100 bg-white p-3 shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSend(input); }}
            placeholder="Ask about this deal…"
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="bg-green-800 text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50 flex-shrink-0"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
