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

export default function AltroPage() {
  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      {/* Competizione */}
      <Section label="Competizione">
        <Item icon={<img src="/icons/shield-star.svg" width={18} height={18} alt="" />} label="Squadre" href="/squadre" />
        <Item icon={<img src="/icons/medal.svg" width={18} height={18} alt="" />} label="Capocannoniere" href="/classifica-marcatori" />
        <Item icon={<img src="/icons/table.svg" width={18} height={18} alt="" />} label="Gironi" href="/gironi" />
        <Item icon={<img src="/icons/football-player.svg" width={18} height={18} alt="" />} label="Giocatori" href="/giocatori" />
      </Section>

      {/* Lega */}
      <Section label="Lega">
        <Item icon={<img src="/icons/football-player-sign.svg" width={18} height={18} alt="" />} label="Scelti dai fantallenatori" href="/giocatori-fanta" />
        <Item icon={<img src="/icons/basic-lock.svg" width={18} height={18} alt="" />} label="Bonus pubblici" href="/bonus-pubblici" />
        <Item icon={<img src="/icons/lock.svg" width={18} height={18} alt="" />} label="Bonus segreti" href="/bonus-segreti" />
      </Section>

      {/* Esplora */}
      <Section label="Esplora">
        <Item icon={<img src="/icons/document_new.svg" width={18} height={18} alt="" />} label="Regolamento fanta" href="/regolamento" />
        <Item icon={<img src="/icons/info.svg" width={18} height={18} alt="" />} label="Supporto" href="/supporto" />
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
      <div className="flex flex-col gap-3 items-center">
        <span className="text-xs text-center" style={{ color: "rgba(0,0,0,0.65)" }}>App ufficiale presentata da</span>
        <a href="https://qursor.it/" target="_blank" rel="noopener noreferrer">
          <img src="/images/qursor.svg" height={12} alt="Qursor" style={{ height: 12, width: "auto" }} />
        </a>
      </div>
    </div>
  );
}
