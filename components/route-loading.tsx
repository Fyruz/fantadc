export default function RouteLoading() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-8" aria-live="polite" aria-busy="true">
      <div className="h-6 w-32 animate-pulse rounded-full bg-[var(--surface-2)]" />
      <div className="flex flex-col gap-3">
        <div className="h-24 animate-pulse rounded-2xl bg-[var(--surface-1)]" />
        <div className="h-24 animate-pulse rounded-2xl bg-[var(--surface-1)]" />
        <div className="h-24 animate-pulse rounded-2xl bg-[var(--surface-1)]" />
      </div>
    </div>
  );
}
