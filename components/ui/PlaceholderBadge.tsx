export function PlaceholderBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gold/40 px-3 py-1 text-[10px] tracking-[0.22em] text-gold uppercase">
      {label}
    </span>
  );
}
