import MobileOnlyGate from "@/components/mobile-only-gate";

export default function BareLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileOnlyGate>
      <div className="min-h-screen flex flex-col px-4 py-6" style={{ background: "#F5F6FF" }}>
        {children}
      </div>
    </MobileOnlyGate>
  );
}
