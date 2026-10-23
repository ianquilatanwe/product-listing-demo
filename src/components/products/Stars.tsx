import Image from "next/image";

/** Gold stars clipped to the exact rating width over a faded row of the same icon. */
export function Stars({ rating }: { rating: number }) {
  const row = (
    <span className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <Image key={i} src="/star.svg" alt="" width={17} height={17} className="shrink-0" />
      ))}
    </span>
  );
  return (
    <span className="relative inline-block" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <span className="opacity-25 grayscale">{row}</span>
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${(rating / 5) * 100}%` }}>
        {row}
      </span>
    </span>
  );
}
