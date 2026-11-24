import Link from "next/link";

export function BrandMark({ size = "md", href = "/" }: { size?: "sm" | "md"; href?: string }) {
  const box = size === "sm" ? "size-7" : "size-9";
  const icon = size === "sm" ? 14 : 18;

  return (
    <Link href={href} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
      <div className={`${box} grid place-items-center rounded-lg bg-[#0d1f17] shrink-0`}>
        <svg width={icon} height={icon} viewBox="0 0 20 20" fill="none">
          <path d="M10 2L2 9h2v9h4v-5h4v5h4V9h2L10 2z" fill="white" />
        </svg>
      </div>
      <div className="leading-tight">
        <p className="font-semibold tracking-tight">DomiComp AI</p>
        <p className="text-[11px] text-muted-foreground">
          Powered by <span className="font-semibold text-foreground">Agrovus</span>
        </p>
      </div>
    </Link>
  );
}
