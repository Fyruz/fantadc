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

type Severity = "error" | "success" | "info";

type ToastCtx = {
  error: (msg: string) => void;
  success: (msg: string) => void;
  info: (msg: string) => () => void;
  cta: (msg: string, onClick: () => void, actionLabel?: string) => void;
};

const Ctx = createContext<ToastCtx>({ error: () => {}, success: () => {}, info: () => () => {}, cta: () => {} });

interface ToastItem {
  id: number;
  msg: string;
  severity: Severity;
  exiting: boolean;
  onClick?: () => void;
  actionLabel?: string;
  icon?: string;
  label?: string;
}

const CONFIG: Record<Severity, { icon: string; label: string; accent: string; iconBg: string; iconColor: string; life: number }> = {
  error:   { icon: "pi-times-circle", label: "Errore",      accent: "#DC2626", iconBg: "#FEF2F2", iconColor: "#DC2626", life: 6000 },
  success: { icon: "pi-check-circle", label: "Completato",  accent: "#059669", iconBg: "#ECFDF5", iconColor: "#059669", life: 3500 },
  info:    { icon: "pi-spin pi-spinner", label: "Un momento", accent: "#0107A3", iconBg: "rgba(1,7,163,0.08)", iconColor: "#0107A3", life: 12000 },
};

let uid = 0;

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const c = CONFIG[item.severity];
  const clickable = !!item.onClick;
  const icon = item.icon ?? c.icon;
  const label = item.label ?? c.label;
  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={() => {
        if (!item.onClick) return;
        item.onClick();
        onDismiss(item.id);
      }}
      onKeyDown={(event) => {
        if (!item.onClick || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        item.onClick();
        onDismiss(item.id);
      }}
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
        cursor: clickable ? "pointer" : "default",
        pointerEvents: clickable ? "auto" : "none",
      }}
    >
      <div
        style={{
          width: 36, height: 36, borderRadius: 12, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: c.iconBg,
        }}
      >
        <i className={`pi ${icon}`} style={{ fontSize: 15, color: c.iconColor }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2, color: c.accent }}>
          {label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35, color: "var(--text-primary)" }}>
          {item.msg}
        </div>
        {item.actionLabel && (
          <div style={{ marginTop: 4, fontSize: 11, fontWeight: 900, textTransform: "uppercase", color: c.accent }}>
            {item.actionLabel}
          </div>
        )}
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

  const show = useCallback((severity: Severity, msg: string, options?: {
    onClick?: () => void;
    actionLabel?: string;
    icon?: string;
    label?: string;
  }) => {
    const id = uid++;
    setToasts((prev) => [...prev, { id, msg, severity, exiting: false, ...options }]);
    const timer = setTimeout(() => dismiss(id), CONFIG[severity].life);
    return () => { clearTimeout(timer); dismiss(id); };
  }, [dismiss]);

  return (
    <Ctx.Provider value={{
      error: (msg) => show("error", msg),
      success: (msg) => show("success", msg),
      info: (msg) => show("info", msg),
      cta: (msg, onClick, actionLabel = "Apri voto") => show("info", msg, {
        onClick,
        actionLabel,
        icon: "pi-star",
        label: "Voto MVP",
      }),
    }}>
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
          {toasts.map((t) => <ToastCard key={t.id} item={t} onDismiss={dismiss} />)}
        </div>,
        document.body
      )}
    </Ctx.Provider>
  );
}

export function useAppToast() {
  return useContext(Ctx);
}
