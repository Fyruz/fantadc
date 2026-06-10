import PageHeader from "@/components/page-header";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

function BonusCard() {
  return (
    <div
      className="bg-white rounded-3xl overflow-hidden flex flex-col items-center justify-center gap-4 p-5"
      style={{ border: "1px solid rgba(9,20,76,0.05)", boxShadow: "0 4px 10px 0 rgba(9,20,76,0.10)" }}
    >
      <img src="/icons/bonus/lock.svg" alt="Bonus segreto" width={54} height={64} />
      <div className="flex flex-col items-center gap-2 text-center">
        <p
          className="uppercase text-sm"
          style={{ fontFamily: "var(--font-tallica)", color: "#5e6070" }}
        >
          ???
        </p>
        <p className="text-xs text-black leading-normal">
          Bonus segreto da scoprire
        </p>
      </div>
    </div>
  );
}

export default function BonusSegreti() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader title="Bonus Segreti" />

      <p className="text-sm text-black text-center leading-5">
        Alcuni bonus sono ancora nascosti.
        <br />
        Quando verranno sbloccati durante la{" "}
        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
          {siteConfig.name}
        </span>
        , diventeranno visibili a tutti i partecipanti.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <BonusCard key={i} />
        ))}
      </div>
    </div>
  );
}
