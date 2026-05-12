"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { Toast } from "primereact/toast";

type Severity = "error" | "success";

type ToastCtx = {
  error: (msg: string) => void;
  success: (msg: string) => void;
};

const Ctx = createContext<ToastCtx>({ error: () => {}, success: () => {} });

const CONFIG: Record<Severity, {
  icon: string;
  label: string;
  accent: string;
  iconBg: string;
  iconColor: string;
  life: number;
}> = {
  error: {
    icon: "pi-times-circle",
    label: "Errore",
    accent: "#DC2626",
    iconBg: "#FEF2F2",
    iconColor: "#DC2626",
    life: 6000,
  },
  success: {
    icon: "pi-check-circle",
    label: "Completato",
    accent: "#059669",
    iconBg: "#ECFDF5",
    iconColor: "#059669",
    life: 3500,
  },
};

function ToastContent({ msg, severity }: { msg: string; severity: Severity }) {
  const c = CONFIG[severity];
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{
        background: "#fff",
        borderRadius: "16px",
        border: "1.5px solid var(--border-medium)",
        borderLeft: `4px solid ${c.accent}`,
        boxShadow: "0 8px 24px rgba(1,7,163,0.13)",
        minWidth: "260px",
        maxWidth: "360px",
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: c.iconBg }}
      >
        <i className={`pi ${c.icon} text-sm`} style={{ color: c.iconColor }} />
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="text-[10px] font-black uppercase tracking-widest mb-0.5"
          style={{ color: c.accent }}
        >
          {c.label}
        </div>
        <div
          className="text-sm font-semibold leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {msg}
        </div>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const ref = useRef<Toast>(null);

  const show = (severity: Severity, msg: string) => {
    ref.current?.show({
      severity,
      life: CONFIG[severity].life,
      content: () => <ToastContent msg={msg} severity={severity} />,
    });
  };

  return (
    <Ctx.Provider
      value={{
        error: (msg) => show("error", msg),
        success: (msg) => show("success", msg),
      }}
    >
      <Toast
        ref={ref}
        position="top-right"
        unstyled
        pt={{
          root: {
            style: {
              position: "fixed",
              top: "1.25rem",
              right: "1.25rem",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            },
          },
          content: { style: { padding: 0 } },
        }}
      />
      {children}
    </Ctx.Provider>
  );
}

export function useAppToast() {
  return useContext(Ctx);
}
