import { Activity } from "lucide-react";
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
  return (
    <div className="rounded-[10px] border border-line bg-card p-3">
      <p className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
        <Activity className="size-3.5 text-lime" />
        {label}
      </p>
      <Progress value={cpuPercent} className="mt-2.5" />
      <div className="mt-1.5 flex justify-between text-[10px] text-ink-muted">
        <span>CPU {cpuPercent}%</span>
        <span>RAM {ramPercent}%</span>
      </div>
    </div>
  );
}
