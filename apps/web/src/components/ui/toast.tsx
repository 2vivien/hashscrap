import { createContext, useCallback, useContext, useState } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

export interface Toast {
  id: number;
  title: string;
  description?: string;
  variant?: "info" | "success" | "warning";
}

interface ToastContextValue {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { ...toast, id }]);
    setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 rounded-[12px] border border-line bg-card px-4 py-3 shadow-xl",
              toast.variant === "success" && "border-green/30",
              toast.variant === "warning" && "border-orange/30",
            )}
          >
            <div className="flex-1">
              <p className="text-[13px] font-medium text-ink">{toast.title}</p>
              {toast.description ? (
                <p className="text-[12px] text-ink-secondary">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="text-ink-muted hover:text-ink"
              aria-label="Fermer"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
