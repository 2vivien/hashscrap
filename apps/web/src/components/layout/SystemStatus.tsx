import { Activity } from "lucide-react";
import { useState } from "react";
import { Progress } from "../ui/progress";

export interface SystemStatusProps {
  cpuPercent?: number;
  ramPercent?: number;
  label?: string;
}

export function SystemStatus({
  cpuPercent = 42,
  ramPercent = 68,
  label = "Système opérationnel",
}: SystemStatusProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[10px] border border-line bg-card p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 text-[12px] font-medium text-ink"
      >
        <Activity className="size-3.5 text-lime" />
        {label}
      </button>
      <Progress value={cpuPercent} className="mt-2.5" />
      <div className="mt-1.5 flex justify-between text-[10px] text-ink-muted">
        <span>CPU {cpuPercent}%</span>
        <span>RAM {ramPercent}%</span>
      </div>
      {open ? (
        <div className="mt-3 border-t border-line pt-3 text-[11px] text-ink-secondary">
          <p>Statut : opérationnel</p>
          <p>Version : v1.0.0 bounded</p>
          <p>Mode : démonstration</p>
          <p className="mt-1 text-ink-muted">Cliquez pour masquer.</p>
        </div>
      ) : null}
    </div>
  );
}
