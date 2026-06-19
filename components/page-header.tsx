import BackButton from "@/components/back-button";

export default function PageHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="w-10 flex items-center">
        <BackButton />
      </div>
      <h1
        className="flex-1 text-center uppercase text-xl whitespace-nowrap"
        style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)" }}
      >
        {title}
      </h1>
      <div className="w-10" />
    </div>
  );
}
