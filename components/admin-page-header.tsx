import Link from "next/link";

interface Props {
  title: string;
  cta?: { href: string; label: string };
  backHref?: string;
}

export default function AdminPageHeader({ title, cta, backHref }: Props) {
  return (
    <div className="mb-6">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3 transition-colors hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
        >
          <i className="pi pi-arrow-left text-[10px]" />
          Indietro
        </Link>
      )}
      <div className="flex items-center justify-between gap-4">
        <h1
          className="font-display font-black text-2xl uppercase"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h1>
        {cta && (
          <Link
            href={cta.href}
            className="inline-flex items-center gap-1.5 text-white rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ background: "var(--primary)" }}
          >
            <i className="pi pi-plus text-[10px]" />
            {cta.label}
          </Link>
        )}
      </div>
    </div>
  );
}
