"use client";
import { PrimeReactProvider } from "primereact/api";
import { ToastProvider } from "./toast-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrimeReactProvider>
      <ToastProvider>{children}</ToastProvider>
    </PrimeReactProvider>
  );
}
