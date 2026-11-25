import { useState } from "react";
import { useClerk } from "@clerk/react";
import { Loader2, Trash2 } from "lucide-react";
import { useApi } from "@/lib/useApi";

export function DeleteAccountButton({ className = "" }: { className?: string }) {
  const { signOut } = useClerk();
  const { call } = useApi();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    setDeleting(true);
    setError(null);
    try {
      await call(a => a.account.delete());
      await signOut();
    } catch (e) {
      setError((e as Error).message || "Could not delete your account.");
      setDeleting(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={`flex items-center gap-1.5 ${className}`}>
        <Trash2 className="size-4" /> Delete account
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-left shadow-xl">
            <h2 id="delete-account-title" className="text-lg font-bold text-slate-900">Delete your account?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This permanently deletes your DomiComp AI account. Companies where you are the only member are deleted too,
              including their deals and photos, and any active subscription is canceled. This cannot be undone.
            </p>
            {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-semibold text-white active:scale-95 transition-transform disabled:opacity-60"
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              {deleting ? "Deleting…" : "Delete account permanently"}
            </button>
            <button
              onClick={() => setOpen(false)}
              disabled={deleting}
              className="mt-3 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
