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
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] mb-3 transition-colors"
        >
          <i className="pi pi-arrow-left text-xs" />
          Torna indietro
        </Link>
      )}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[22px] font-bold text-[#111827]">{title}</h1>
        {cta && (
          <Link
            href={cta.href}
            className="bg-[#0107A3] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#0106c4] transition-colors flex items-center min-h-[36px] flex-shrink-0"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </div>
  );
}
