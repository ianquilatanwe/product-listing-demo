/** Centred title + explanation + next step, for empty and error states. */
export function StateMessage({
  title,
  body,
  alert = false,
  children,
}: {
  title: string;
  body: string;
  /** Announce immediately to screen readers (errors). */
  alert?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div role={alert ? "alert" : undefined} className="py-20 text-center">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-muted">{body}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
