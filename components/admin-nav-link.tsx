import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { isSuperAdmin } from "@/lib/admin";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Renders only for super-admins; wrap in <Suspense> so static pages keep their shell. */
export async function AdminNavLink({ size = "sm" }: { size?: "sm" | "default" }) {
  if (!(await isSuperAdmin())) return null;
  return (
    <Link href="/app/admin" className={cn(buttonVariants({ variant: "outline", size }), "gap-1.5")}>
      <ShieldCheck className="size-3.5" /> Admin
    </Link>
  );
}
