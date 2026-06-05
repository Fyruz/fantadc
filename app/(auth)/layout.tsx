import MobileOnlyGate from "@/components/mobile-only-gate";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileOnlyGate>
      <div className="min-h-screen flex flex-col" style={{ background: "#F5F6FF" }}>
        {children}
      </div>
    </MobileOnlyGate>
  );
}
