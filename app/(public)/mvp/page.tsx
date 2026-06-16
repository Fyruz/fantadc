import BackButton from "@/components/back-button";
import { getPublicMvpData } from "@/lib/data/public/mvp";
import MvpViews from "./_mvp-views";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata = { title: "MVP" };

export default async function MvpPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>;
}) {
  const { vista } = await searchParams;
  const activeView = vista === "giocatore" ? "giocatore" : "partita";

  const data = await getPublicMvpData();

  return (
    <div className="flex flex-col gap-6">
      {/* Header mobile */}
      <div className="md:hidden flex items-center justify-between h-12">
        <div className="flex-1 flex items-center">
          <BackButton />
        </div>
        <span
          className="flex-1 text-center uppercase"
          style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "var(--text-primary)" }}
        >
          MVP
        </span>
        <div className="flex-1" />
      </div>

      <MvpViews data={data} activeView={activeView} />
    </div>
  );
}
