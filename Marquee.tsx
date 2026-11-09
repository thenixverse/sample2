const WORDS = ['Strength', 'Consistency', 'Determination', 'Progress', 'Discipline', 'Community'];

export default function Marquee() {
  const row = [...WORDS, ...WORDS];
  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-blood-500 py-4" aria-hidden="true">
      <div className="flex w-max animate-marquee gap-10">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-3xl uppercase tracking-wider text-white">
            {w}
            <span className="h-2 w-2 rotate-45 bg-ink" />
          </span>
        ))}
      </div>
    </div>
  );
}
