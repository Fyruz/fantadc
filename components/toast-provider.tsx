"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { Toast } from "primereact/toast";

type ToastCtx = {
  error: (msg: string) => void;
  success: (msg: string) => void;
};

const Ctx = createContext<ToastCtx>({ error: () => {}, success: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const ref = useRef<Toast>(null);

  return (
    <Ctx.Provider
      value={{
        error: (msg) =>
          ref.current?.show({
            severity: "error",
            summary: "Errore",
            detail: msg,
            life: 5000,
          }),
        success: (msg) =>
          ref.current?.show({
            severity: "success",
            summary: "Operazione completata",
            detail: msg,
            life: 3000,
          }),
      }}
    >
      <Toast ref={ref} position="top-right" />
      {children}
    </Ctx.Provider>
  );
}

export function useAppToast() {
  return useContext(Ctx);
}
