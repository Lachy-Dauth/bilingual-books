type Card = { label: string; value: string | number; sub?: string };

export function StatsCards({ cards }: { cards: Card[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
        >
          <div className="text-xs uppercase tracking-wide text-[color:var(--muted)] font-semibold">
            {c.label}
          </div>
          <div className="text-2xl font-bold mt-1">{c.value}</div>
          {c.sub && <div className="text-xs text-[color:var(--muted)] mt-1">{c.sub}</div>}
        </div>
      ))}
    </div>
  );
}
