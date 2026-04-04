import Link from "next/link";

interface Props {
  value: number;
  label: string;
  href: string;
  icon: string;
}

export default function StatCard({ value, label, href, icon }: Props) {
  return (
    <Link
      href={href}
      className="rounded-2xl p-4 flex items-start justify-between hover:-translate-y-px transition-all duration-150"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border-soft)', boxShadow: '0 4px 24px rgba(0,0,0,0.30)' }}
    >
      <div>
        <div className="text-3xl font-bold" style={{ color: '#6BA3FF' }}>{value}</div>
        <div className="text-xs font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      </div>
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary-light)' }}>
        <i className={`pi ${icon} text-base`} style={{ color: '#6BA3FF' }} />
      </div>
    </Link>
  );
}
