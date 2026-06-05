import Link from "next/link";

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-xs" style={{ color: "rgba(0,0,0,0.65)" }}>{label}</span>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Item({ icon, label, href, external }: { icon: React.ReactNode; label: string; href: string; external?: boolean }) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-3"
    >
      <span className="shrink-0 w-4.5 h-4.5 flex items-center justify-center">{icon}</span>
      <span className="text-base text-black" style={{ lineHeight: "26px" }}>{label}</span>
    </Link>
  );
}

export default function VolleyAltroPage() {
  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div>
        <div className="over-label mb-1">GreenVolley</div>
        <h1 className="text-3xl uppercase" style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}>
          ALTRO
        </h1>
      </div>

      {/* Competizione */}
      <Section label="Competizione">
        <Item icon={<img src="/icons/shield-star.svg" width={18} height={18} alt="" />} label="Squadre" href="/greenvolley/squadre" />
        <Item icon={<img src="/icons/table.svg" width={18} height={18} alt="" />} label="Gironi" href="/greenvolley/gironi" />
        <Item icon={<img src="/icons/bracket.svg" width={18} height={18} alt="" />} label="Eliminazione" href="/greenvolley/eliminazione" />
      </Section>

      {/* Esplora */}
      <Section label="Esplora">
        <Item icon={<img src="/icons/envelope-closed.svg" width={18} height={18} alt="" />} label="Contatti" href="/contatti" />
      </Section>

      {/* Seguici */}
      <Section label="Seguici">
        <Item icon={<img src="/icons/instagram.svg" width={18} height={18} alt="" />} label="Instagram" href="https://www.instagram.com/danimarcas_cup/" external />
        <Item icon={<img src="/icons/facebook.svg" width={18} height={18} alt="" />} label="Facebook" href="https://www.facebook.com/share/18fzTTpgJ3/?mibextid=wwXIfr" external />
      </Section>

      {/* Sponsor */}
      <div className="flex flex-col gap-3 items-center">
        <span className="text-xs text-center" style={{ color: "rgba(0,0,0,0.65)" }}>Sponsor ufficiali</span>
        <img src="/images/nuova_polisportiva_chianti.svg" width={56} height={56} alt="Nuova Polisportiva Chianti" />
      </div>

      {/* Qursor */}
      <div className="flex flex-col gap-3 items-center pb-4">
        <span className="text-xs text-center" style={{ color: "rgba(0,0,0,0.65)" }}>App ufficiale presentata da</span>
        <a href="https://qursor.it/" target="_blank" rel="noopener noreferrer">
          <img src="/images/qursor.svg" height={12} alt="Qursor" style={{ height: 12, width: "auto" }} />
        </a>
      </div>
    </div>
  );
}
