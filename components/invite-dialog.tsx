"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type State = "idle" | "loading" | "success" | "error";

export function InviteDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("org:member");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong");
        setState("error");
      } else {
        setState("success");
        setEmail("");
      }
    } catch {
      setErrorMsg("Network error — please try again");
      setState("error");
    }
  }

  function close() {
    setOpen(false);
    setState("idle");
    setEmail("");
    setErrorMsg("");
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <UserPlus className="size-4" />
        Invite
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-xl">
            {state === "success" ? (
              <div className="text-center">
                <div className="mb-3 text-3xl">✉️</div>
                <h2 className="mb-1 font-semibold">Invitation sent!</h2>
                <p className="mb-5 text-sm text-muted-foreground">
                  An invitation email was sent to <strong>{email || "the address you entered"}</strong>.
                </p>
                <Button onClick={close} className="w-full">Done</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-4">
                <div>
                  <h2 className="font-semibold">Invite team member</h2>
                  <p className="text-sm text-muted-foreground">
                    They&apos;ll receive a branded invite email from DomiComp AI.
                  </p>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="invite-email">Email address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="teammate@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="invite-role">Role</Label>
                  <select
                    id="invite-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-9 rounded-lg border bg-background px-3 text-sm"
                  >
                    <option value="org:member">Member</option>
                    <option value="org:admin">Admin</option>
                  </select>
                </div>

                {state === "error" && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errorMsg}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={close}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={state === "loading"}>
                    {state === "loading" ? "Sending…" : "Send invite"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
