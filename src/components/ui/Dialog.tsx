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
  // Close only for a press that starts and ends on the backdrop (outside the
  // dialog's box), so dragging its scrollbar or releasing a text selection
  // outside it doesn't close it.
  const pressedBackdrop = useRef(false);
  const onBackdrop = (e: React.MouseEvent<HTMLDialogElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    return e.target === e.currentTarget && outside;
  };
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
      onPointerDown={(e) => (pressedBackdrop.current = onBackdrop(e))}
      onClick={(e) => {
        if (pressedBackdrop.current && onBackdrop(e)) ref.current?.close();
        pressedBackdrop.current = false;
      }}
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
