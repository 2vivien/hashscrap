import { Check } from "lucide-react";
import { SOURCE_NEW_STEPS, type SourceNewStep } from "../types/source-new.types";

export interface SourceNewStepperProps {
  step: SourceNewStep;
  onStepChange: (step: SourceNewStep) => void;
}

export function SourceNewStepper({ step, onStepChange }: SourceNewStepperProps) {
  const currentIndex = SOURCE_NEW_STEPS.findIndex((item) => item.value === step);

  return (
    <ol className="mb-6 flex flex-wrap items-center gap-2">
      {SOURCE_NEW_STEPS.map((item, index) => {
        const done = index < currentIndex;
        const active = item.value === step;
        return (
          <li key={item.value}>
            <button
              type="button"
              onClick={() => onStepChange(item.value)}
              aria-current={active ? "step" : undefined}
              className={`flex items-center gap-2 rounded-[10px] border px-3 py-2 text-[12px] transition-colors ${
                active
                  ? "border-lime/40 bg-lime-dim text-lime"
                  : "border-line bg-card text-ink-secondary hover:text-ink"
              }`}
            >
              <span className="grid size-4 place-items-center rounded-full border border-current text-[9px]">
                {done ? <Check className="size-2.5" /> : index + 1}
              </span>
              {item.label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
