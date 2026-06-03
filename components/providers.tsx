"use client";
import { PrimeReactProvider, updateLocaleOption } from "primereact/api";
import { ToastProvider } from "./toast-provider";

updateLocaleOption("firstDayOfWeek", 1, "en");

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrimeReactProvider>
      <ToastProvider>{children}</ToastProvider>
    </PrimeReactProvider>
  );
}
