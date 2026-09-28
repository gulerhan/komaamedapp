export function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-10 md:mb-14">
      <p className="text-xs tracking-[0.28em] text-gold uppercase">{eyebrow}</p>
      <h2 className="font-display mt-3 max-w-3xl text-4xl leading-[0.95] text-fg md:text-6xl">
        {title}
      </h2>
    </div>
  );
}
