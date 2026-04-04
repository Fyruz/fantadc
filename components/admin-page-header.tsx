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
          className="inline-flex items-center gap-1.5 text-sm mb-3 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <i className="pi pi-arrow-left text-xs" />
          Torna indietro
        </Link>
      )}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[22px] font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        {cta && (
          <Link
            href={cta.href}
            className="text-white rounded-full px-4 py-2 text-sm font-medium transition-colors flex items-center min-h-[36px] flex-shrink-0"
            style={{ background: 'var(--primary)' }}
          >
            {cta.label}
          </Link>
        )}
      </div>
    </div>
  );
}
