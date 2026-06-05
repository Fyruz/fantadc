export default function GVThemeWrapper({ active, children }: { active: boolean; children: React.ReactNode }) {
  return <div className={active ? "gv-theme" : ""}>{children}</div>;
}
