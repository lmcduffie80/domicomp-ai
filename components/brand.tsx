import { Building2 } from "lucide-react";

export function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Building2 className="size-5" />
      </div>
      <div className="leading-tight">
        <p className="font-semibold tracking-tight">DomiComp AI</p>
        <p className="text-[11px] text-muted-foreground">
          Powered by <span className="font-semibold text-foreground">Agrovus</span>
        </p>
      </div>
    </div>
  );
}
