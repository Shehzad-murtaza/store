"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Check, CircleAlert, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "warning";
type ToastValue = { message: string; kind: ToastKind };
type ToastContextValue = { showToast: (message: string, kind?: ToastKind) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastValue | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, kind: ToastKind = "success") => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, kind });
    timer.current = setTimeout(() => setToast(null), 4500);
  }, []);

  const close = () => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  };

  const Icon = toast?.kind === "error" ? CircleAlert : toast?.kind === "warning" ? Info : Check;

  return <ToastContext.Provider value={{ showToast }}>
    {children}
    {toast && <div className="fixed right-4 top-4 z-[100] flex w-[min(420px,calc(100vw-2rem))] items-start gap-3 rounded-xl border border-[#eaeaea] bg-white p-4 text-sm shadow-lg" role={toast.kind === "error" ? "alert" : "status"} aria-live="polite">
      <Icon size={17} className={toast.kind === "error" ? "mt-0.5 shrink-0 text-[#a43d35]" : toast.kind === "warning" ? "mt-0.5 shrink-0 text-[#8a6b28]" : "mt-0.5 shrink-0 text-[#47714d]"} />
      <p className="flex-1 leading-5 text-[#333]">{toast.message}</p>
      <button type="button" onClick={close} aria-label="Dismiss notification" className="text-[#888] hover:text-black"><X size={16} /></button>
    </div>}
  </ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
