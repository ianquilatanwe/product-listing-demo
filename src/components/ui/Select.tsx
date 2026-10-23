import Image from "next/image";

/** A native <select> styled as the design's pill, with a visually hidden label. */
export function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [value: string, text: string])[];
  className: string;
}) {
  return (
    <label className={`pill relative motion-safe:transition ${className}`}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent pr-5 capitalize focus:outline-none"
      >
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
      <Image src="/chevron.svg" alt="" width={14} height={14} className="pointer-events-none absolute right-[14px]" />
    </label>
  );
}
