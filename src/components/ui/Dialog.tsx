"use client";

import { useEffect, useRef } from "react";

/**
 * Native <dialog>: the browser handles focus trapping, Esc to close and the
 * backdrop. Clicking the backdrop (the dialog element itself) also closes it.
 * Add the `modal` or `drawer` class for the matching open animation.
 */
export function Dialog({
  open,
  onClose,
  labelledBy,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  className: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      className={`border-0 p-0 text-ink ${className}`}
    >
      {children}
    </dialog>
  );
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Close"
      className="close-btn grid size-10 place-items-center rounded-full text-2xl leading-none text-muted motion-safe:transition hover:bg-fill active:scale-95"
    >
      ×
    </button>
  );
}
