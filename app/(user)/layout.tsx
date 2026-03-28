import PublicNav from "@/components/public-nav";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">{children}</main>
    </div>
  );
}
