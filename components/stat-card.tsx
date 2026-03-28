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
      className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-4 flex items-start justify-between hover:shadow-md hover:-translate-y-px transition-all duration-150"
    >
      <div>
        <div className="text-3xl font-bold text-[#0107A3]">{value}</div>
        <div className="text-xs font-medium text-[#6B7280] mt-1">{label}</div>
      </div>
      <div className="w-10 h-10 rounded-full bg-[#E8E9F8] flex items-center justify-center flex-shrink-0">
        <i className={`pi ${icon} text-[#0107A3] text-base`} />
      </div>
    </Link>
  );
}
