import PublicBottomNav from "@/components/public-bottom-nav";
import PublicNav from "@/components/public-nav";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC]">
      <PublicNav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-24 md:pb-8">{children}</main>
      <PublicBottomNav />
    </div>
  );
}
