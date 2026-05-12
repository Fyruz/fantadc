"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type Severity = "error" | "success";

type ToastCtx = { error: (msg: string) => void; success: (msg: string) => void };

const Ctx = createContext<ToastCtx>({ error: () => {}, success: () => {} });

interface ToastItem {
  id: number;
  msg: string;
  severity: Severity;
  exiting: boolean;
}

const CONFIG: Record<Severity, { icon: string; label: string; accent: string; iconBg: string; iconColor: string; life: number }> = {
  error:   { icon: "pi-times-circle", label: "Errore",      accent: "#DC2626", iconBg: "#FEF2F2", iconColor: "#DC2626", life: 6000 },
  success: { icon: "pi-check-circle", label: "Completato",  accent: "#059669", iconBg: "#ECFDF5", iconColor: "#059669", life: 3500 },
};

let uid = 0;

function ToastCard({ item }: { item: ToastItem }) {
  const c = CONFIG[item.severity];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        background: "#fff",
        borderRadius: "16px",
        border: "1.5px solid var(--border-medium)",
        borderLeft: `4px solid ${c.accent}`,
        boxShadow: "0 8px 24px rgba(1,7,163,0.13)",
        width: "min(340px, calc(100vw - 2rem))",
        animation: `${item.exiting ? "toast-out" : "toast-in"} 0.22s ease forwards`,
      }}
    >
      <div
        style={{
          width: 36, height: 36, borderRadius: 12, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: c.iconBg,
        }}
      >
        <i className={`pi ${c.icon}`} style={{ fontSize: 15, color: c.iconColor }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2, color: c.accent }}>
          {c.label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35, color: "var(--text-primary)" }}>
          {item.msg}
        </div>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 220);
  }, []);

  const show = useCallback((severity: Severity, msg: string) => {
    const id = uid++;
    setToasts((prev) => [...prev, { id, msg, severity, exiting: false }]);
    setTimeout(() => dismiss(id), CONFIG[severity].life);
  }, [dismiss]);

  return (
    <Ctx.Provider value={{ error: (msg) => show("error", msg), success: (msg) => show("success", msg) }}>
      {children}
      {mounted && createPortal(
        <div
          style={{
            position: "fixed",
            top: "1.25rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          {toasts.map((t) => <ToastCard key={t.id} item={t} />)}
        </div>,
        document.body
      )}
    </Ctx.Provider>
  );
}

export function useAppToast() {
  return useContext(Ctx);
}
